import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account || account.userId !== userId) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async create(userId: string, dto: CreateAccountDto) {
    const targetUserId = dto.userId || userId;
    const account = await this.prisma.account.create({
      data: {
        userId: targetUserId,
        name: dto.name,
        type: dto.type,
        openingBalance: dto.openingBalance ?? 0,
        currentBalance: dto.openingBalance ?? 0,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: targetUserId,
        action: 'CREATE',
        entityType: 'Account',
        entityId: account.id,
        afterData: account as any,
      },
    });

    return account;
  }

  async createMany(userId: string, dtos: CreateAccountDto[]) {
    return this.prisma.$transaction(async (tx) => {
      const createdAccounts: any[] = [];
      for (const dto of dtos) {
        const targetUserId = dto.userId || userId;
        const account = await tx.account.create({
          data: {
            userId: targetUserId,
            name: dto.name,
            type: dto.type,
            openingBalance: dto.openingBalance ?? 0,
            currentBalance: dto.openingBalance ?? 0,
          },
        });
        createdAccounts.push(account);

        await tx.auditLog.create({
          data: {
            userId: targetUserId,
            action: 'CREATE',
            entityType: 'Account',
            entityId: account.id,
            afterData: account as any,
          },
        });
      }
      return createdAccounts;
    });
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    const existing = await this.findOne(userId, id);

    const updated = await this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entityType: 'Account',
        entityId: id,
        beforeData: existing as any,
        afterData: updated as any,
      },
    });

    return updated;
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);

    // Check for existing transactions
    const txCount = await this.prisma.transaction.count({
      where: { accountId: id, isDeleted: false },
    });

    if (txCount > 0) {
      // Soft deactivate instead of hard delete
      return this.prisma.account.update({
        where: { id },
        data: { isActive: false },
      });
    }

    try {
      await this.prisma.account.delete({ where: { id } });

      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'DELETE',
          entityType: 'Account',
          entityId: id,
          beforeData: existing as any,
        },
      });

      return { message: 'Account deleted' };
    } catch (error) {
      // Fallback to soft deactivate if hard delete fails due to foreign key constraints
      // (e.g., soft-deleted transactions, recurring transactions, credit cards, emis)
      return this.prisma.account.update({
        where: { id },
        data: { isActive: false },
      });
    }
  }

  /**
   * Recalculate account balance from opening balance + all non-deleted cleared transactions.
   */
  async recalculateBalance(accountId: string): Promise<void> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) return;

    const result = await this.prisma.transaction.aggregate({
      where: {
        accountId,
        isDeleted: false,
        status: 'CLEARED',
      },
      _sum: {
        amount: true,
      },
    });

    // Income adds, Expense/Transfer subtracts from this account
    const incomeSum = await this.prisma.transaction.aggregate({
      where: {
        accountId,
        isDeleted: false,
        status: 'CLEARED',
        type: 'INCOME',
      },
      _sum: { amount: true },
    });

    const expenseSum = await this.prisma.transaction.aggregate({
      where: {
        accountId,
        isDeleted: false,
        status: 'CLEARED',
        type: { in: ['EXPENSE', 'TRANSFER'] },
      },
      _sum: { amount: true },
    });

    // Transfer-in: when this account is the destination of a transfer
    const transferInSum = await this.prisma.transaction.aggregate({
      where: {
        transferToAccountId: accountId,
        isDeleted: false,
        status: 'CLEARED',
        type: 'TRANSFER',
      },
      _sum: { amount: true },
    });

    const openBal = Number(account.openingBalance);
    const income = Number(incomeSum._sum.amount ?? 0);
    const expense = Number(expenseSum._sum.amount ?? 0);
    const transferIn = Number(transferInSum._sum.amount ?? 0);

    const newBalance = openBal + income - expense + transferIn;

    await this.prisma.account.update({
      where: { id: accountId },
      data: { currentBalance: newBalance },
    });
  }
}
