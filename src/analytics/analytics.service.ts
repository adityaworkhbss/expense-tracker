import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  getSalaryCycleDates,
  getSalaryCycleHistory,
  getTodayRange,
  getThisWeekRange,
  getThisMonthRange,
  getLastNDaysRange,
  getDateRange,
  toISTDateString,
} from '../common';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private baseWhere(userId: string): Prisma.TransactionWhereInput {
    return { userId, isDeleted: false, status: 'CLEARED' };
  }

  /** Summary: today, week, month, salary-cycle totals and cashflow/net-worth */
  async getSummary(userId: string) {
    const today = getTodayRange();
    const week = getThisWeekRange();
    const month = getThisMonthRange();
    const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
    const cycle = getSalaryCycleDates(new Date(), salaryRule?.cycleStartDay ?? 10);

    const [dailyExp, weeklyExp, monthlyExp, monthlyInc, cycleExp, cycleInc] = await Promise.all([
      this.sumAmount(userId, 'EXPENSE', today.start, today.end),
      this.sumAmount(userId, 'EXPENSE', week.start, week.end),
      this.sumAmount(userId, 'EXPENSE', month.start, month.end),
      this.sumAmount(userId, 'INCOME', month.start, month.end),
      this.sumAmount(userId, 'EXPENSE', cycle.start, cycle.end),
      this.sumAmount(userId, 'INCOME', cycle.start, cycle.end),
    ]);

    const accounts = await this.prisma.account.findMany({
      where: { userId, isActive: true },
      select: { type: true, currentBalance: true },
    });
    
    // Cashflow Balance = Only money you actually have (PAY_NOW)
    let cashflowBalance = 0;
    for (const a of accounts) {
      if (a.type === 'PAY_NOW') {
        cashflowBalance += Number(a.currentBalance);
      }
    }

    // Liabilities
    const ccCards = await this.prisma.creditCard.findMany({ where: { userId } });
    let totalCcLiabilities = ccCards.reduce((s, c) => s + Number(c.currentOutstanding), 0);

    const payLaterAccounts = await this.prisma.account.findMany({
      where: { userId, type: 'PAY_LATER', isActive: true }
    });
    let totalPayLaterLiabilities = payLaterAccounts.reduce((s, a) => {
      const bal = Number(a.currentBalance);
      return s + (bal < 0 ? Math.abs(bal) : 0);
    }, 0);

    const emis = await this.prisma.emi.findMany({ where: { userId, active: true } });
    let totalEmiRemaining = emis.reduce((s, e) => s + Number(e.remainingBalance), 0);

    // Net Worth = Cashflow - All Liabilities
    const totalLiabilities = totalCcLiabilities + totalEmiRemaining + totalPayLaterLiabilities;
    const netWorth = cashflowBalance - totalLiabilities;

    // Upcoming month projection
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const ccStatements = await this.prisma.creditCardStatement.findMany({
      where: { creditCard: { userId }, isSettled: false, dueDate: { lte: nextMonth } }
    });
    const upcomingCcBills = ccStatements.reduce((s, st) => s + (Number(st.billedAmount) - Number(st.paidAmount)), 0);
    
    const upcomingEmis = emis.filter(e => e.nextDueDate <= nextMonth).reduce((s, e) => s + Number(e.monthlyEmi), 0);
    
    const upcomingPayLater = totalPayLaterLiabilities; // Assume all Pay Later is due next cycle

    const projectedFreeCash = cashflowBalance - upcomingCcBills - upcomingEmis - upcomingPayLater;

    return {
      dailyExpense: dailyExp,
      weeklyExpense: weeklyExp,
      monthlyExpense: monthlyExp,
      monthlyIncome: monthlyInc,
      salaryCycleExpense: cycleExp,
      salaryCycleIncome: cycleInc,
      salaryCycleNet: cycleInc - cycleExp,
      cashflowBalance,
      netWorth,
      totalLiabilities,
      futureObligations: {
        ccBills: upcomingCcBills,
        emis: upcomingEmis,
        payLater: upcomingPayLater,
        total: upcomingCcBills + upcomingEmis + upcomingPayLater,
      },
      projectedFreeCash,
      safeSpendingLimit: projectedFreeCash > 0 ? projectedFreeCash : 0,
      salaryCycleDates: { start: cycle.start, end: cycle.end },
    };
  }

  /** Daily totals for a date range */
  async getDaily(userId: string, from: string, to: string) {
    const range = getDateRange(from, to);
    const aggregates = await this.prisma.aggregateDaily.findMany({
      where: { userId, date: { gte: new Date(from), lte: new Date(to) } },
      orderBy: { date: 'asc' },
    });
    return aggregates.map(a => ({
      date: toISTDateString(a.date),
      income: Number(a.incomeTotal),
      expense: Number(a.expenseTotal),
      net: Number(a.netTotal),
      count: a.transactionCount,
    }));
  }

  /** Weekly totals - group daily aggregates by ISO week */
  async getWeekly(userId: string, from: string, to: string) {
    const daily = await this.getDaily(userId, from, to);
    const dayjs = (await import('dayjs')).default;
    const isoWeek = require('dayjs/plugin/isoWeek');
    dayjs.extend(isoWeek);

    const weekMap = new Map<string, { income: number; expense: number; net: number; count: number }>();
    for (const d of daily) {
      const wk = dayjs(d.date).isoWeek();
      const yr = dayjs(d.date).isoWeekYear();
      const key = `${yr}-W${String(wk).padStart(2, '0')}`;
      const existing = weekMap.get(key) || { income: 0, expense: 0, net: 0, count: 0 };
      existing.income += d.income;
      existing.expense += d.expense;
      existing.net += d.net;
      existing.count += d.count;
      weekMap.set(key, existing);
    }
    return Array.from(weekMap.entries()).map(([week, data]) => ({ week, ...data }));
  }

  /** Monthly totals */
  async getMonthly(userId: string, from: string, to: string) {
    const fromMonth = from.substring(0, 7);
    const toMonth = to.substring(0, 7);
    const aggregates = await this.prisma.aggregateMonthly.findMany({
      where: { userId, monthKey: { gte: fromMonth, lte: toMonth } },
      orderBy: { monthKey: 'asc' },
    });
    return aggregates.map(a => ({
      month: a.monthKey,
      income: Number(a.incomeTotal),
      expense: Number(a.expenseTotal),
      net: Number(a.netTotal),
      count: a.transactionCount,
    }));
  }

  /** Category-wise totals */
  async getCategoryWise(userId: string, from: string, to: string) {
    const range = getDateRange(from, to);
    const results = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        ...this.baseWhere(userId),
        type: 'EXPENSE',
        transactionDate: { gte: range.start, lte: range.end },
      },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    });

    const categoryIds = results.map(r => r.categoryId).filter(Boolean) as string[];
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true },
    });
    const catMap = new Map(categories.map(c => [c.id, c]));

    return results.map(r => ({
      categoryId: r.categoryId,
      category: catMap.get(r.categoryId!) || { name: 'Uncategorized' },
      total: Number(r._sum.amount ?? 0),
      count: r._count,
    }));
  }

  /** Cash flow: income vs expense over time */
  async getCashflow(userId: string, from: string, to: string) {
    const range = getDateRange(from, to);
    const [incomeByDay, expenseByDay] = await Promise.all([
      this.groupByDate(userId, 'INCOME', range.start, range.end),
      this.groupByDate(userId, 'EXPENSE', range.start, range.end),
    ]);
    // Merge into unified timeline
    const allDates = new Set([...incomeByDay.map(d => d.date), ...expenseByDay.map(d => d.date)]);
    const incMap = new Map(incomeByDay.map(d => [d.date, d.total]));
    const expMap = new Map(expenseByDay.map(d => [d.date, d.total]));

    return Array.from(allDates).sort().map(date => ({
      date,
      income: incMap.get(date) ?? 0,
      expense: expMap.get(date) ?? 0,
      net: (incMap.get(date) ?? 0) - (expMap.get(date) ?? 0),
    }));
  }

  /** Current salary cycle details */
  async getCurrentSalaryCycle(userId: string) {
    const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
    const cycleDay = salaryRule?.cycleStartDay ?? 10;
    const cycle = getSalaryCycleDates(new Date(), cycleDay);

    const [income, expense, categoryWise, txCount] = await Promise.all([
      this.sumAmount(userId, 'INCOME', cycle.start, cycle.end),
      this.sumAmount(userId, 'EXPENSE', cycle.start, cycle.end),
      this.getCategoryWiseRaw(userId, cycle.start, cycle.end),
      this.prisma.transaction.count({
        where: { ...this.baseWhere(userId), transactionDate: { gte: cycle.start, lte: cycle.end } },
      }),
    ]);

    const salaryTx = await this.prisma.transaction.findFirst({
      where: { ...this.baseWhere(userId), isSalary: true, transactionDate: { gte: cycle.start, lte: cycle.end } },
      select: { amount: true, transactionDate: true },
    });

    return {
      cycleStart: cycle.start, cycleEnd: cycle.end, cycleDay,
      totalIncome: income, totalExpense: expense, netSavings: income - expense,
      salaryReceived: salaryTx ? Number(salaryTx.amount) : null,
      expectedSalary: salaryRule ? Number(salaryRule.expectedAmount) : null,
      transactionCount: txCount,
      categoryBreakdown: categoryWise,
    };
  }

  /** Salary cycle history */
  async getSalaryCycleHistory(userId: string) {
    const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
    const cycleDay = salaryRule?.cycleStartDay ?? 10;
    const cycles = getSalaryCycleHistory(12, cycleDay);

    const history: any[] = [];
    for (const cycle of cycles) {
      const [income, expense] = await Promise.all([
        this.sumAmount(userId, 'INCOME', cycle.start, cycle.end),
        this.sumAmount(userId, 'EXPENSE', cycle.start, cycle.end),
      ]);
      history.push({ label: cycle.label, start: cycle.start, end: cycle.end, income, expense, net: income - expense });
    }
    return history;
  }

  /** Excel-like Comprehensive Dashboard */
  async getExcelDashboard(userId: string) {
    const today = new Date();
    const fyStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    const fyStart = new Date(fyStartYear, 3, 1);
    
    // Current Month Range
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    
    // Next Month
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Fetch all transactions for YTD
    const ytdTxs = await this.prisma.transaction.findMany({
      where: { ...this.baseWhere(userId), transactionDate: { gte: fyStart, lte: today } },
      include: { category: true, account: true }
    });

    // Fetch master tables first
    const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
    const emis = await this.prisma.emi.findMany({ where: { userId, active: true } });
    const subs = await this.prisma.recurringTransaction.findMany({ where: { userId, active: true } });

    // Calculate theoretical/actual Fixed values from the master tables
    let ytdEmiPaid = 0;
    let currEmiPaid = 0;
    for (const emi of emis) {
      // Calculate how many months have passed since fyStart and current month
      // Assuming 1 EMI per month if active
      if (emi.active) {
        // Just as an approximation for YTD, if it started before today
        const emiStart = new Date(emi.startDate);
        if (emiStart <= today) {
          // Months between fyStart (or emiStart) and today
          const start = emiStart > fyStart ? emiStart : fyStart;
          const monthsYtd = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth()) + 1;
          ytdEmiPaid += monthsYtd * Number(emi.monthlyEmi);
          
          if (emiStart <= currentMonthEnd) {
             currEmiPaid += Number(emi.monthlyEmi);
          }
        }
      }
    }

    let ytdSubExp = 0;
    let currSubExp = 0;
    let ytdSubInc = 0;
    let currSubInc = 0;

    for (const sub of subs) {
      if (!sub.active) continue;
      const subAmt = Number(sub.amount);
      const monthsYtd = (today.getFullYear() - fyStart.getFullYear()) * 12 + (today.getMonth() - fyStart.getMonth()) + 1;

      if (sub.type === 'EXPENSE' && ['MONTHLY', 'YEARLY'].includes(sub.frequency)) {
        if (sub.frequency === 'MONTHLY') {
          ytdSubExp += monthsYtd * subAmt;
          currSubExp += subAmt;
        } else if (sub.frequency === 'YEARLY') {
          ytdSubExp += subAmt;
          const runDate = new Date(sub.nextRunAt);
          if (runDate >= currentMonthStart && runDate <= currentMonthEnd) currSubExp += subAmt;
        }
      } else if (sub.type === 'INCOME' && ['MONTHLY', 'YEARLY'].includes(sub.frequency)) {
        if (sub.frequency === 'MONTHLY') {
          ytdSubInc += monthsYtd * subAmt;
          currSubInc += subAmt;
        } else if (sub.frequency === 'YEARLY') {
          ytdSubInc += subAmt;
          const runDate = new Date(sub.nextRunAt);
          if (runDate >= currentMonthStart && runDate <= currentMonthEnd) currSubInc += subAmt;
        }
      }
    }

    let ytdFixed = ytdEmiPaid + ytdSubExp;
    let currFixed = currEmiPaid + currSubExp;

    let ytdIncome = 0;
    let currIncome = 0;
    let ytdTotalActualExpense = 0;
    let currTotalActualExpense = 0;
    let currCcExpense = 0;
    let currCcPayment = 0;

    const creditCards = await this.prisma.creditCard.findMany({ where: { userId }, include: { account: true } });
    const ccAccountIds = new Set(creditCards.map(c => c.accountId));

    for (const tx of ytdTxs) {
      const amt = Number(tx.amount);
      const isCurrentMonth = tx.transactionDate >= currentMonthStart && tx.transactionDate <= currentMonthEnd;

      if (tx.type === 'INCOME') {
        ytdIncome += amt;
        if (isCurrentMonth) currIncome += amt;
      } else if (tx.type === 'EXPENSE') {
        ytdTotalActualExpense += amt;
        if (isCurrentMonth) currTotalActualExpense += amt;

        // CC Expense
        if (ccAccountIds.has(tx.accountId)) {
          if (isCurrentMonth) currCcExpense += amt;
        }
      }
    }

    // Refine CC Payments (transfers TO a credit card account)
    const ytdTransfers = await this.prisma.transaction.findMany({
      where: { ...this.baseWhere(userId), type: 'TRANSFER', transactionDate: { gte: fyStart, lte: today } },
    });
    for (const tx of ytdTransfers) {
      const isCurrentMonth = tx.transactionDate >= currentMonthStart && tx.transactionDate <= currentMonthEnd;
      if (tx.transferToAccountId && ccAccountIds.has(tx.transferToAccountId)) {
        if (isCurrentMonth) {
          currCcPayment += Number(tx.amount);
        }
      }
    }

    // Since users might not have logged actual EMI/Sub transactions, or we want to use tables directly:
    // Variable = Total Logged Expenses - Calculated Fixed (floor at 0)
    let ytdVariable = Math.max(0, ytdTotalActualExpense - ytdFixed);
    let currVariable = Math.max(0, currTotalActualExpense - currFixed);

    // If actual logged is less than fixed, then total expense is at least fixed
    const ytdTotalExpense = Math.max(ytdTotalActualExpense, ytdFixed + ytdVariable);
    
    // PROJECT FIXED INCOME (Salary + Recurring Income)
    const monthsPassed = (today.getFullYear() - fyStart.getFullYear()) * 12 + (today.getMonth() - fyStart.getMonth()) + 1;
    let expectedYtdFixedInc = 0;
    let expectedCurrFixedInc = 0;

    if (salaryRule && salaryRule.expectedAmount) {
      expectedYtdFixedInc += monthsPassed * Number(salaryRule.expectedAmount);
      expectedCurrFixedInc += Number(salaryRule.expectedAmount);
    }
    expectedYtdFixedInc += ytdSubInc;
    expectedCurrFixedInc += currSubInc;

    // Use projected if actual is 0
    if (ytdIncome === 0) ytdIncome = expectedYtdFixedInc;
    if (currIncome === 0) currIncome = expectedCurrFixedInc;

    const ytdNetSavings = ytdIncome - ytdTotalExpense;
    const ytdSavingsRate = ytdIncome > 0 ? (ytdNetSavings / ytdIncome) * 100 : 0;

    const currTotalExpCalc = currFixed + currVariable;
    const currNetBalance = currIncome - currTotalExpCalc;

    // NEXT MONTH PREVIEW
    const nextExpectedIncome = salaryRule && salaryRule.expectedAmount ? Number(salaryRule.expectedAmount) : currIncome;

    // Only include EMIs that have remaining payments after this month
    const nextMonthEmis = emis.filter(e => (e.tenure - e.monthsPaid) > 1);
    const nextExpectedFixed = nextMonthEmis.reduce((sum, e) => sum + Number(e.monthlyEmi), 0) + 
                              subs.filter(s => s.active && ['MONTHLY', 'YEARLY'].includes(s.frequency)).reduce((sum, s) => sum + Number(s.amount), 0);

    // CC Payment Due = Sum of current outstanding (will be due next month)
    const nextCcPaymentDue = creditCards.reduce((sum, c) => sum + Number(c.currentOutstanding), 0);

    const nextEstTotalExp = nextExpectedFixed + currVariable; 
    const nextEstBalance = nextExpectedIncome - nextEstTotalExp - nextCcPaymentDue;

    // INSIGHTS
    const fixedVsVar = ytdTotalExpense > 0 ? (ytdFixed / ytdTotalExpense) * 100 : 0;
    const emiTotal = emis.reduce((sum, e) => sum + Number(e.monthlyEmi), 0);
    const emiPercentOfIncome = currIncome > 0 ? (emiTotal / currIncome) * 100 : 0;
    
    // CC vs Bank Spending
    let bankSpending = 0;
    let ccSpending = 0;
    for (const tx of ytdTxs) {
      if (tx.type === 'EXPENSE') {
        if (ccAccountIds.has(tx.accountId)) ccSpending += Number(tx.amount);
        else bankSpending += Number(tx.amount);
      }
    }
    const ccVsBank = (ccSpending + bankSpending) > 0 ? (ccSpending / (ccSpending + bankSpending)) * 100 : 0;

    // Fixed Income & Expense Master
    const fixedMaster: any[] = [];
    if (salaryRule && salaryRule.expectedAmount) {
      fixedMaster.push({ id: 'salary', name: 'Salary Income', amount: Number(salaryRule.expectedAmount), type: 'INCOME', notes: 'Monthly income', active: true, remainingTenure: null });
    }
    for (const sub of subs) {
      fixedMaster.push({ id: sub.id, name: sub.note || 'Recurring', amount: Number(sub.amount), type: sub.type, notes: `${sub.frequency.toLowerCase()} ${sub.type.toLowerCase()}`, active: sub.active, remainingTenure: null });
    }
    for (const emi of emis) {
      fixedMaster.push({ 
        id: emi.id, 
        name: emi.name, 
        amount: Number(emi.monthlyEmi), 
        type: 'EXPENSE', 
        notes: 'Monthly EMI', 
        active: emi.active,
        remainingTenure: emi.tenure - emi.monthsPaid 
      });
    }

    const totalFixedIncome = fixedMaster.filter(f => f.type === 'INCOME').reduce((s, f) => s + f.amount, 0);
    const totalFixedExpenseList = fixedMaster.filter(f => f.type === 'EXPENSE').reduce((s, f) => s + f.amount, 0);

    return {
      fyString: `FY ${fyStartYear}-${(fyStartYear + 1).toString().slice(2)}`,
      currentMonthString: today.toLocaleString('default', { month: 'short', year: 'numeric' }),
      nextMonthString: nextMonthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
      ytd: {
        income: ytdIncome,
        fixedExpenses: ytdFixed,
        variableExpenses: ytdVariable,
        totalExpenses: ytdTotalExpense,
        netSavings: ytdNetSavings,
        savingsRate: ytdSavingsRate
      },
      currentMonth: {
        income: currIncome,
        fixedExpenses: currFixed,
        expectedFixed: emis.reduce((sum, e) => sum + Number(e.monthlyEmi), 0) + 
                       subs.filter(s => s.active && ['MONTHLY', 'YEARLY'].includes(s.frequency)).reduce((sum, s) => sum + Number(s.amount), 0),
        variableExpenses: currVariable,
        ccExpensesCurrent: currCcExpense,
        ccPaymentPrev: currCcPayment,
        totalExpenses: currFixed + currVariable + emis.reduce((sum, e) => sum + Number(e.monthlyEmi), 0),
        netBalance: currIncome - (currFixed + currVariable + emis.reduce((sum, e) => sum + Number(e.monthlyEmi), 0))
      },
      nextMonth: {
        expectedIncome: nextExpectedIncome,
        expectedFixed: nextExpectedFixed,
        ccPaymentDue: nextCcPaymentDue,
        estTotalExpenses: nextEstTotalExp,
        estBalance: nextEstBalance
      },
      // 6-MONTH PROJECTION FOR DEBT BURN-DOWN
      projections: Array.from({ length: 6 }).map((_, i) => {
        const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const activeEmis = emis.filter(e => (e.tenure - e.monthsPaid) > i);
        const fixedTotal = activeEmis.reduce((sum, e) => sum + Number(e.monthlyEmi), 0) + 
                          subs.filter(s => s.active && ['MONTHLY', 'YEARLY'].includes(s.frequency)).reduce((sum, s) => sum + Number(s.amount), 0);
        
        // Calculate incremental savings compared to previous month
        const prevActiveEmis = i === 0 ? emis : emis.filter(e => (e.tenure - e.monthsPaid) > (i - 1));
        const prevFixedTotal = prevActiveEmis.reduce((sum, e) => sum + Number(e.monthlyEmi), 0) + 
                               subs.filter(s => s.active).reduce((sum, s) => sum + Number(s.amount), 0);
        
        return {
          month: targetDate.toLocaleString('default', { month: 'short' }),
          fixedObligations: fixedTotal,
          savingsGained: i > 0 ? prevFixedTotal - fixedTotal : 0
        };
      }),
      insights: {
        fixedVsVariable: fixedVsVar,
        emiTotal: emis.length > 0 ? emis.reduce((sum, e) => sum + (Number(e.monthlyEmi) || 0), 0) : 0,
        emiPercentOfIncome: currIncome > 0 ? (emis.reduce((sum, e) => sum + (Number(e.monthlyEmi) || 0), 0) / currIncome) * 100 : 0,
        ccVsBankSpending: ccVsBank
      },
      fixedMasterList: {
        items: fixedMaster,
        totalIncome: totalFixedIncome,
        totalExpense: totalFixedExpenseList
      },
      summary: await this.getSummary(userId)
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────

  private async sumAmount(userId: string, type: string, start: Date, end: Date): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: { ...this.baseWhere(userId), type: type as any, transactionDate: { gte: start, lte: end } },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }

  private async getCategoryWiseRaw(userId: string, start: Date, end: Date) {
    const results = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...this.baseWhere(userId), type: 'EXPENSE', transactionDate: { gte: start, lte: end } },
      _sum: { amount: true }, _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    });
    const catIds = results.map(r => r.categoryId).filter(Boolean) as string[];
    const cats = await this.prisma.category.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true, color: true } });
    const catMap = new Map(cats.map(c => [c.id, c]));
    return results.map(r => ({
      category: catMap.get(r.categoryId!) || { name: 'Uncategorized' },
      total: Number(r._sum.amount ?? 0), count: r._count,
    }));
  }

  private async groupByDate(userId: string, type: string, start: Date, end: Date) {
    const txs = await this.prisma.transaction.findMany({
      where: { ...this.baseWhere(userId), type: type as any, transactionDate: { gte: start, lte: end } },
      select: { transactionDate: true, amount: true },
    });
    const map = new Map<string, number>();
    for (const tx of txs) {
      const date = toISTDateString(tx.transactionDate);
      map.set(date, (map.get(date) ?? 0) + Number(tx.amount));
    }
    return Array.from(map.entries()).map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date));
  }
}
