import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { toISTDateString, toISTMonthKey } from '../common';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recalculate daily aggregate for a specific user and date.
   */
  async recalculateDaily(userId: string, date: Date): Promise<void> {
    const dateStr = toISTDateString(date);
    const dateOnly = new Date(dateStr + 'T00:00:00.000Z');

    // Use raw aggregation over transactions for this IST date
    const dayStart = new Date(dateStr + 'T00:00:00.000+05:30');
    const dayEnd = new Date(dateStr + 'T23:59:59.999+05:30');

    const incomeResult = await this.prisma.transaction.aggregate({
      where: {
        userId,
        isDeleted: false,
        status: 'CLEARED',
        type: 'INCOME',
        transactionDate: { gte: dayStart, lte: dayEnd },
      },
      _sum: { amount: true },
      _count: true,
    });

    const expenseResult = await this.prisma.transaction.aggregate({
      where: {
        userId,
        isDeleted: false,
        status: 'CLEARED',
        type: 'EXPENSE',
        transactionDate: { gte: dayStart, lte: dayEnd },
      },
      _sum: { amount: true },
      _count: true,
    });

    const income = Number(incomeResult._sum.amount ?? 0);
    const expense = Number(expenseResult._sum.amount ?? 0);
    const count = incomeResult._count + expenseResult._count;

    await this.prisma.aggregateDaily.upsert({
      where: { userId_date: { userId, date: dateOnly } },
      create: {
        userId,
        date: dateOnly,
        incomeTotal: income,
        expenseTotal: expense,
        netTotal: income - expense,
        transactionCount: count,
      },
      update: {
        incomeTotal: income,
        expenseTotal: expense,
        netTotal: income - expense,
        transactionCount: count,
      },
    });

    this.logger.debug(`Recalculated daily aggregate for ${dateStr}`);
  }

  /**
   * Recalculate monthly aggregate for a specific user and month.
   */
  async recalculateMonthly(userId: string, date: Date): Promise<void> {
    const monthKey = toISTMonthKey(date);
    const [year, month] = monthKey.split('-').map(Number);

    const monthStart = new Date(`${monthKey}-01T00:00:00.000+05:30`);
    const nextMonth = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthEnd = new Date(`${nextMonth}-01T00:00:00.000+05:30`);

    const incomeResult = await this.prisma.transaction.aggregate({
      where: {
        userId,
        isDeleted: false,
        status: 'CLEARED',
        type: 'INCOME',
        transactionDate: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
      _count: true,
    });

    const expenseResult = await this.prisma.transaction.aggregate({
      where: {
        userId,
        isDeleted: false,
        status: 'CLEARED',
        type: 'EXPENSE',
        transactionDate: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
      _count: true,
    });

    const income = Number(incomeResult._sum.amount ?? 0);
    const expense = Number(expenseResult._sum.amount ?? 0);
    const count = incomeResult._count + expenseResult._count;

    await this.prisma.aggregateMonthly.upsert({
      where: { userId_monthKey: { userId, monthKey } },
      create: {
        userId,
        monthKey,
        incomeTotal: income,
        expenseTotal: expense,
        netTotal: income - expense,
        transactionCount: count,
      },
      update: {
        incomeTotal: income,
        expenseTotal: expense,
        netTotal: income - expense,
        transactionCount: count,
      },
    });

    this.logger.debug(`Recalculated monthly aggregate for ${monthKey}`);
  }

  /**
   * Recalculate both daily and monthly aggregates after a transaction change.
   */
  async recalculateForTransaction(
    userId: string,
    transactionDate: Date,
  ): Promise<void> {
    await Promise.all([
      this.recalculateDaily(userId, transactionDate),
      this.recalculateMonthly(userId, transactionDate),
    ]);
  }

  /**
   * Full rebuild of all aggregates for a user (e.g., after import).
   */
  async fullRebuild(userId: string): Promise<void> {
    this.logger.log(`Starting full aggregate rebuild for user ${userId}`);

    // Get all unique dates
    const transactions = await this.prisma.transaction.findMany({
      where: { userId, isDeleted: false, status: 'CLEARED' },
      select: { transactionDate: true },
    });

    const uniqueDates = new Set<string>();
    const uniqueMonths = new Set<string>();

    for (const tx of transactions) {
      uniqueDates.add(toISTDateString(tx.transactionDate));
      uniqueMonths.add(toISTMonthKey(tx.transactionDate));
    }

    // Delete stale aggregates and rebuild
    await this.prisma.aggregateDaily.deleteMany({ where: { userId } });
    await this.prisma.aggregateMonthly.deleteMany({ where: { userId } });

    for (const dateStr of uniqueDates) {
      await this.recalculateDaily(userId, new Date(dateStr + 'T12:00:00.000+05:30'));
    }

    for (const monthKey of uniqueMonths) {
      await this.recalculateMonthly(userId, new Date(monthKey + '-15T12:00:00.000+05:30'));
    }

    this.logger.log(`Full aggregate rebuild complete for user ${userId}`);
  }
}
