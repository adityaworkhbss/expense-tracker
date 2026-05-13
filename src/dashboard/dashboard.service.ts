import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  getTodayRange, getThisWeekRange, getThisMonthRange,
  getSalaryCycleDates, getLastNDaysRange, toISTDateString,
} from '../common';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async getDashboard(userId: string) {
    const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
    const cycleDay = salaryRule?.cycleStartDay ?? 10;

    const today = getTodayRange();
    const week = getThisWeekRange();
    const month = getThisMonthRange();
    const cycle = getSalaryCycleDates(new Date(), cycleDay);
    const last7 = getLastNDaysRange(7);
    const last30 = getLastNDaysRange(30);

    // All totals computed from DB
    const [
      todayIncome, todayExpense,
      weekIncome, weekExpense,
      monthIncome, monthExpense,
      cycleIncome, cycleExpense,
    ] = await Promise.all([
      this.sumAmount(userId, 'INCOME', today.start, today.end),
      this.sumAmount(userId, 'EXPENSE', today.start, today.end),
      this.sumAmount(userId, 'INCOME', week.start, week.end),
      this.sumAmount(userId, 'EXPENSE', week.start, week.end),
      this.sumAmount(userId, 'INCOME', month.start, month.end),
      this.sumAmount(userId, 'EXPENSE', month.start, month.end),
      this.sumAmount(userId, 'INCOME', cycle.start, cycle.end),
      this.sumAmount(userId, 'EXPENSE', cycle.start, cycle.end),
    ]);

    // Net balance from all accounts
    const accounts = await this.prisma.account.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true, type: true, currentBalance: true },
    });
    const netBalance = accounts.reduce((s, a) => s + Number(a.currentBalance), 0);

    // Category-wise breakdown for current month
    const fromStr = toISTDateString(month.start);
    const toStr = toISTDateString(month.end);
    const categoryWise = await this.analyticsService.getCategoryWise(userId, fromStr, toStr);

    // Top spending categories (top 5)
    const topCategories = categoryWise.slice(0, 5);

    // Recent transactions
    const recentTransactions = await this.prisma.transaction.findMany({
      where: { userId, isDeleted: false },
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } },
        account: { select: { id: true, name: true, type: true } },
      },
      orderBy: { transactionDate: 'desc' },
      take: 10,
    });

    // Last 7 days trend (chart-ready)
    const last7DaysTrend = await this.getDailyTrend(userId, last7.start, last7.end);

    // Last 30 days trend
    const last30DaysTrend = await this.getDailyTrend(userId, last30.start, last30.end);

    // Transaction count
    const transactionCount = await this.prisma.transaction.count({
      where: { userId, isDeleted: false, status: 'CLEARED' },
    });

    return {
      summary: {
        totalIncome: monthIncome,
        totalExpense: monthExpense,
        netBalance,
        savingsRate: monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0,
      },
      periodTotals: {
        daily: { income: todayIncome, expense: todayExpense, net: todayIncome - todayExpense },
        weekly: { income: weekIncome, expense: weekExpense, net: weekIncome - weekExpense },
        monthly: { income: monthIncome, expense: monthExpense, net: monthIncome - monthExpense },
        salaryCycle: {
          income: cycleIncome, expense: cycleExpense, net: cycleIncome - cycleExpense,
          start: cycle.start, end: cycle.end,
        },
      },
      accounts,
      categoryBreakdown: categoryWise,
      topCategories,
      recentTransactions,
      charts: {
        last7Days: last7DaysTrend,
        last30Days: last30DaysTrend,
      },
      transactionCount,
    };
  }

  private async sumAmount(userId: string, type: string, start: Date, end: Date): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: { userId, isDeleted: false, status: 'CLEARED', type: type as any, transactionDate: { gte: start, lte: end } },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }

  private async getDailyTrend(userId: string, start: Date, end: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId, isDeleted: false, status: 'CLEARED', transactionDate: { gte: start, lte: end } },
      select: { transactionDate: true, amount: true, type: true },
    });

    const dayMap = new Map<string, { income: number; expense: number }>();
    for (const tx of transactions) {
      const date = toISTDateString(tx.transactionDate);
      const entry = dayMap.get(date) || { income: 0, expense: 0 };
      if (tx.type === 'INCOME') entry.income += Number(tx.amount);
      else if (tx.type === 'EXPENSE') entry.expense += Number(tx.amount);
      dayMap.set(date, entry);
    }

    return Array.from(dayMap.entries())
      .map(([date, data]) => ({ date, ...data, net: data.income - data.expense }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
