import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { AccountsService } from '../accounts/accounts.service';
import { AggregationService } from './aggregation.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionQueryDto,
} from './dto/transaction.dto';
import { paginate, getDateRange } from '../common';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: AccountsService,
    private readonly aggregationService: AggregationService,
  ) {}

  async findAll(userId: string, query: TransactionQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      userId,
      isDeleted: false,
    };

    if (query.from || query.to) {
      const from = query.from || '2000-01-01';
      const to = query.to || '2099-12-31';
      const range = getDateRange(from, to);
      where.transactionDate = { gte: range.start, lte: range.end };
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.accountId) {
      where.accountId = query.accountId;
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, color: true, icon: true } },
          account: { select: { id: true, name: true, type: true } },
          transferToAccount: { select: { id: true, name: true, type: true } },
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(userId: string, id: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        account: true,
        transferToAccount: true,
      },
    });
    if (!tx || tx.userId !== userId || tx.isDeleted) {
      throw new NotFoundException('Transaction not found');
    }
    return tx;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    // Validate account exists
    await this.accountsService.findOne(userId, dto.accountId);

    if (dto.type === 'TRANSFER') {
      if (!dto.transferToAccountId) {
        throw new BadRequestException('Transfer requires a target account');
      }
      await this.accountsService.findOne(userId, dto.transferToAccountId);
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          categoryId: dto.categoryId,
          transferToAccountId: dto.transferToAccountId,
          type: dto.type,
          amount: dto.amount,
          transactionDate: new Date(dto.transactionDate),
          note: dto.note,
          merchant: dto.merchant,
          paymentMethod: dto.paymentMethod,
          tags: dto.tags ?? undefined,
          status: dto.status || 'CLEARED',
          isSalary: dto.isSalary || false,
        },
        include: {
          category: true,
          account: true,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          entityType: 'Transaction',
          entityId: created.id,
          afterData: created as any,
        },
      });

      return created;
    });

    // Recalculate balances and aggregates
    await this.accountsService.recalculateBalance(dto.accountId);
    if (dto.transferToAccountId) {
      await this.accountsService.recalculateBalance(dto.transferToAccountId);
    }
    await this.aggregationService.recalculateForTransaction(
      userId,
      new Date(dto.transactionDate),
    );

    return transaction;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(userId, id);
    const oldDate = existing.transactionDate;
    const oldAccountId = existing.accountId;
    const oldTransferAccountId = existing.transferToAccountId;

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.transaction.update({
        where: { id },
        data: {
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
          ...(dto.transactionDate !== undefined && {
            transactionDate: new Date(dto.transactionDate),
          }),
          ...(dto.accountId !== undefined && { accountId: dto.accountId }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.transferToAccountId !== undefined && {
            transferToAccountId: dto.transferToAccountId,
          }),
          ...(dto.note !== undefined && { note: dto.note }),
          ...(dto.merchant !== undefined && { merchant: dto.merchant }),
          ...(dto.paymentMethod !== undefined && {
            paymentMethod: dto.paymentMethod,
          }),
          ...(dto.tags !== undefined && { tags: dto.tags }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.isSalary !== undefined && { isSalary: dto.isSalary }),
        },
        include: { category: true, account: true },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entityType: 'Transaction',
          entityId: id,
          beforeData: existing as any,
          afterData: result as any,
        },
      });

      return result;
    });

    // Recalculate affected accounts
    const accountsToRecalc = new Set([
      oldAccountId,
      updated.accountId,
    ]);
    if (oldTransferAccountId) accountsToRecalc.add(oldTransferAccountId);
    if (updated.transferToAccountId) accountsToRecalc.add(updated.transferToAccountId);

    for (const accId of accountsToRecalc) {
      await this.accountsService.recalculateBalance(accId);
    }

    // Recalculate aggregates for both old and new dates
    await this.aggregationService.recalculateForTransaction(userId, oldDate);
    if (dto.transactionDate) {
      await this.aggregationService.recalculateForTransaction(
        userId,
        new Date(dto.transactionDate),
      );
    }

    return updated;
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);

    // Soft delete
    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id },
        data: { isDeleted: true },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'DELETE',
          entityType: 'Transaction',
          entityId: id,
          beforeData: existing as any,
        },
      });
    });

    // Recalculate
    await this.accountsService.recalculateBalance(existing.accountId);
    if (existing.transferToAccountId) {
      await this.accountsService.recalculateBalance(existing.transferToAccountId);
    }
    await this.aggregationService.recalculateForTransaction(
      userId,
      existing.transactionDate,
    );

    return { message: 'Transaction deleted' };
  }

  /**
   * Import transactions from parsed CSV/Excel data.
   */
  async importTransactions(
    userId: string,
    transactions: CreateTransactionDto[],
  ) {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const dto of transactions) {
      try {
        await this.create(userId, dto);
        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(err.message);
      }
    }

    // Full aggregate rebuild after import
    await this.aggregationService.fullRebuild(userId);

    return results;
  }

  /**
   * Export all transactions for a user within a date range.
   */
  async getExportData(userId: string, from?: string, to?: string) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      isDeleted: false,
    };

    if (from || to) {
      const range = getDateRange(from || '2000-01-01', to || '2099-12-31');
      where.transactionDate = { gte: range.start, lte: range.end };
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        category: { select: { name: true } },
        account: { select: { name: true } },
      },
      orderBy: { transactionDate: 'asc' },
    });
  }
}
