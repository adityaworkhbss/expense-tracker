import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { getSalaryCycleDates, getThisWeekRange, getThisMonthRange } from '../common';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateBudgetDto) {
    const budget = await this.prisma.budget.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        periodType: dto.periodType,
        limitAmount: dto.limitAmount,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
    await this.prisma.auditLog.create({
      data: { userId, action: 'CREATE', entityType: 'Budget', entityId: budget.id, afterData: budget as any },
    });
    return budget;
  }

  async createMany(userId: string, dtos: CreateBudgetDto[]) {
    const data = dtos.map((dto) => ({
      userId,
      categoryId: dto.categoryId,
      periodType: dto.periodType,
      limitAmount: dto.limitAmount,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    }));

    // Using transaction to ensure all are created or none
    return this.prisma.$transaction(async (tx) => {
      const budgets = [];
      for (const item of data) {
        const b = await tx.budget.create({ data: item });
        budgets.push(b);
        await tx.auditLog.create({
          data: { userId, action: 'CREATE', entityType: 'Budget', entityId: b.id, afterData: b as any },
        });
      }
      return budgets;
    });
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    const existing = await this.prisma.budget.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) throw new NotFoundException('Budget not found');

    const updated = await this.prisma.budget.update({
      where: { id },
      data: {
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.periodType !== undefined && { periodType: dto.periodType }),
        ...(dto.limitAmount !== undefined && { limitAmount: dto.limitAmount }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
      },
    });
    await this.prisma.auditLog.create({
      data: { userId, action: 'UPDATE', entityType: 'Budget', entityId: id, beforeData: existing as any, afterData: updated as any },
    });
    return updated;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.budget.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) throw new NotFoundException('Budget not found');
    await this.prisma.budget.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: { userId, action: 'DELETE', entityType: 'Budget', entityId: id, beforeData: existing as any },
    });
    return { message: 'Budget deleted' };
  }

  /** Get budget status: compare limits vs actual spending */
  async getStatus(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: { category: { select: { id: true, name: true, color: true } } },
    });

    const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
    const cycleDay = salaryRule?.cycleStartDay ?? 10;

    const statusList: any[] = [];
    for (const budget of budgets) {
      let start: Date, end: Date;

      switch (budget.periodType) {
        case 'WEEKLY': {
          const wk = getThisWeekRange();
          start = wk.start; end = wk.end;
          break;
        }
        case 'MONTHLY': {
          const mo = getThisMonthRange();
          start = mo.start; end = mo.end;
          break;
        }
        case 'SALARY_CYCLE': {
          const sc = getSalaryCycleDates(new Date(), cycleDay);
          start = sc.start; end = sc.end;
          break;
        }
        case 'CUSTOM':
        default:
          start = budget.startDate;
          end = budget.endDate || new Date();
          break;
      }

      const whereClause: any = {
        userId, isDeleted: false, status: 'CLEARED', type: 'EXPENSE',
        transactionDate: { gte: start, lte: end },
      };
      if (budget.categoryId) whereClause.categoryId = budget.categoryId;

      const spent = await this.prisma.transaction.aggregate({
        where: whereClause,
        _sum: { amount: true },
      });

      const spentAmount = Number(spent._sum.amount ?? 0);
      const limit = Number(budget.limitAmount);
      const remaining = limit - spentAmount;
      const percentage = limit > 0 ? Math.round((spentAmount / limit) * 100) : 0;

      statusList.push({
        budgetId: budget.id,
        category: budget.category,
        periodType: budget.periodType,
        limit,
        spent: spentAmount,
        remaining,
        percentage,
        isOverBudget: spentAmount > limit,
        periodStart: start,
        periodEnd: end,
      });
    }
    return statusList;
  }
}
