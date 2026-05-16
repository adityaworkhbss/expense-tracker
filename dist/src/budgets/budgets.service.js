"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const common_2 = require("../common");
let BudgetsService = class BudgetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.budget.findMany({
            where: { userId },
            include: { category: { select: { id: true, name: true, color: true, icon: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(userId, dto) {
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
            data: { userId, action: 'CREATE', entityType: 'Budget', entityId: budget.id, afterData: budget },
        });
        return budget;
    }
    async createMany(userId, dtos) {
        const data = dtos.map((dto) => ({
            userId,
            categoryId: dto.categoryId,
            periodType: dto.periodType,
            limitAmount: dto.limitAmount,
            startDate: new Date(dto.startDate),
            endDate: dto.endDate ? new Date(dto.endDate) : null,
        }));
        return this.prisma.$transaction(async (tx) => {
            const budgets = [];
            for (const item of data) {
                const b = await tx.budget.create({ data: item });
                budgets.push(b);
                await tx.auditLog.create({
                    data: { userId, action: 'CREATE', entityType: 'Budget', entityId: b.id, afterData: b },
                });
            }
            return budgets;
        });
    }
    async update(userId, id, dto) {
        const existing = await this.prisma.budget.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId)
            throw new common_1.NotFoundException('Budget not found');
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
            data: { userId, action: 'UPDATE', entityType: 'Budget', entityId: id, beforeData: existing, afterData: updated },
        });
        return updated;
    }
    async remove(userId, id) {
        const existing = await this.prisma.budget.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId)
            throw new common_1.NotFoundException('Budget not found');
        await this.prisma.budget.delete({ where: { id } });
        await this.prisma.auditLog.create({
            data: { userId, action: 'DELETE', entityType: 'Budget', entityId: id, beforeData: existing },
        });
        return { message: 'Budget deleted' };
    }
    async getStatus(userId) {
        const budgets = await this.prisma.budget.findMany({
            where: { userId },
            include: { category: { select: { id: true, name: true, color: true } } },
        });
        const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
        const cycleDay = salaryRule?.cycleStartDay ?? 10;
        const statusList = [];
        for (const budget of budgets) {
            let start, end;
            switch (budget.periodType) {
                case 'WEEKLY': {
                    const wk = (0, common_2.getThisWeekRange)();
                    start = wk.start;
                    end = wk.end;
                    break;
                }
                case 'MONTHLY': {
                    const mo = (0, common_2.getThisMonthRange)();
                    start = mo.start;
                    end = mo.end;
                    break;
                }
                case 'SALARY_CYCLE': {
                    const sc = (0, common_2.getSalaryCycleDates)(new Date(), cycleDay);
                    start = sc.start;
                    end = sc.end;
                    break;
                }
                case 'CUSTOM':
                default:
                    start = budget.startDate;
                    end = budget.endDate || new Date();
                    break;
            }
            const whereClause = {
                userId, isDeleted: false, status: 'CLEARED', type: 'EXPENSE',
                transactionDate: { gte: start, lte: end },
            };
            if (budget.categoryId)
                whereClause.categoryId = budget.categoryId;
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
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map