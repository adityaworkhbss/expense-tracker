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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const common_2 = require("../common");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    baseWhere(userId) {
        return { userId, isDeleted: false, status: 'CLEARED' };
    }
    async getSummary(userId) {
        const today = (0, common_2.getTodayRange)();
        const week = (0, common_2.getThisWeekRange)();
        const month = (0, common_2.getThisMonthRange)();
        const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
        const cycle = (0, common_2.getSalaryCycleDates)(new Date(), salaryRule?.cycleStartDay ?? 10);
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
        let cashflowBalance = 0;
        for (const a of accounts) {
            if (a.type === 'PAY_NOW') {
                cashflowBalance += Number(a.currentBalance);
            }
        }
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
        const totalLiabilities = totalCcLiabilities + totalEmiRemaining + totalPayLaterLiabilities;
        const netWorth = cashflowBalance - totalLiabilities;
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const ccStatements = await this.prisma.creditCardStatement.findMany({
            where: { creditCard: { userId }, isSettled: false, dueDate: { lte: nextMonth } }
        });
        const upcomingCcBills = ccStatements.reduce((s, st) => s + (Number(st.billedAmount) - Number(st.paidAmount)), 0);
        const upcomingEmis = emis.filter(e => e.nextDueDate <= nextMonth).reduce((s, e) => s + Number(e.monthlyEmi), 0);
        const upcomingPayLater = totalPayLaterLiabilities;
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
    async getDaily(userId, from, to) {
        const range = (0, common_2.getDateRange)(from, to);
        const aggregates = await this.prisma.aggregateDaily.findMany({
            where: { userId, date: { gte: new Date(from), lte: new Date(to) } },
            orderBy: { date: 'asc' },
        });
        return aggregates.map(a => ({
            date: (0, common_2.toISTDateString)(a.date),
            income: Number(a.incomeTotal),
            expense: Number(a.expenseTotal),
            net: Number(a.netTotal),
            count: a.transactionCount,
        }));
    }
    async getWeekly(userId, from, to) {
        const daily = await this.getDaily(userId, from, to);
        const dayjs = (await import('dayjs')).default;
        const isoWeek = require('dayjs/plugin/isoWeek');
        dayjs.extend(isoWeek);
        const weekMap = new Map();
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
    async getMonthly(userId, from, to) {
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
    async getCategoryWise(userId, from, to) {
        const range = (0, common_2.getDateRange)(from, to);
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
        const categoryIds = results.map(r => r.categoryId).filter(Boolean);
        const categories = await this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true, color: true, icon: true },
        });
        const catMap = new Map(categories.map(c => [c.id, c]));
        return results.map(r => ({
            categoryId: r.categoryId,
            category: catMap.get(r.categoryId) || { name: 'Uncategorized' },
            total: Number(r._sum.amount ?? 0),
            count: r._count,
        }));
    }
    async getCashflow(userId, from, to) {
        const range = (0, common_2.getDateRange)(from, to);
        const [incomeByDay, expenseByDay] = await Promise.all([
            this.groupByDate(userId, 'INCOME', range.start, range.end),
            this.groupByDate(userId, 'EXPENSE', range.start, range.end),
        ]);
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
    async getCurrentSalaryCycle(userId) {
        const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
        const cycleDay = salaryRule?.cycleStartDay ?? 10;
        const cycle = (0, common_2.getSalaryCycleDates)(new Date(), cycleDay);
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
    async getSalaryCycleHistory(userId) {
        const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
        const cycleDay = salaryRule?.cycleStartDay ?? 10;
        const cycles = (0, common_2.getSalaryCycleHistory)(12, cycleDay);
        const history = [];
        for (const cycle of cycles) {
            const [income, expense] = await Promise.all([
                this.sumAmount(userId, 'INCOME', cycle.start, cycle.end),
                this.sumAmount(userId, 'EXPENSE', cycle.start, cycle.end),
            ]);
            history.push({ label: cycle.label, start: cycle.start, end: cycle.end, income, expense, net: income - expense });
        }
        return history;
    }
    async getExcelDashboard(userId) {
        const today = new Date();
        const fyStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
        const fyStart = new Date(fyStartYear, 3, 1);
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const ytdTxs = await this.prisma.transaction.findMany({
            where: { ...this.baseWhere(userId), transactionDate: { gte: fyStart, lte: today } },
            include: { category: true, account: true }
        });
        const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
        const emis = await this.prisma.emi.findMany({ where: { userId, active: true } });
        const subs = await this.prisma.recurringTransaction.findMany({ where: { userId, active: true } });
        let ytdEmiPaid = 0;
        let currEmiPaid = 0;
        for (const emi of emis) {
            if (emi.active) {
                const emiStart = new Date(emi.startDate);
                if (emiStart <= today) {
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
            if (!sub.active)
                continue;
            const subAmt = Number(sub.amount);
            const monthsYtd = (today.getFullYear() - fyStart.getFullYear()) * 12 + (today.getMonth() - fyStart.getMonth()) + 1;
            if (sub.type === 'EXPENSE' && ['MONTHLY', 'YEARLY'].includes(sub.frequency)) {
                if (sub.frequency === 'MONTHLY') {
                    ytdSubExp += monthsYtd * subAmt;
                    currSubExp += subAmt;
                }
                else if (sub.frequency === 'YEARLY') {
                    ytdSubExp += subAmt;
                    const runDate = new Date(sub.nextRunAt);
                    if (runDate >= currentMonthStart && runDate <= currentMonthEnd)
                        currSubExp += subAmt;
                }
            }
            else if (sub.type === 'INCOME' && ['MONTHLY', 'YEARLY'].includes(sub.frequency)) {
                if (sub.frequency === 'MONTHLY') {
                    ytdSubInc += monthsYtd * subAmt;
                    currSubInc += subAmt;
                }
                else if (sub.frequency === 'YEARLY') {
                    ytdSubInc += subAmt;
                    const runDate = new Date(sub.nextRunAt);
                    if (runDate >= currentMonthStart && runDate <= currentMonthEnd)
                        currSubInc += subAmt;
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
                if (isCurrentMonth)
                    currIncome += amt;
            }
            else if (tx.type === 'EXPENSE') {
                ytdTotalActualExpense += amt;
                if (isCurrentMonth)
                    currTotalActualExpense += amt;
                if (ccAccountIds.has(tx.accountId)) {
                    if (isCurrentMonth)
                        currCcExpense += amt;
                }
            }
        }
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
        let ytdVariable = Math.max(0, ytdTotalActualExpense - ytdFixed);
        let currVariable = Math.max(0, currTotalActualExpense - currFixed);
        const ytdTotalExpense = Math.max(ytdTotalActualExpense, ytdFixed + ytdVariable);
        const monthsPassed = (today.getFullYear() - fyStart.getFullYear()) * 12 + (today.getMonth() - fyStart.getMonth()) + 1;
        let expectedYtdFixedInc = 0;
        let expectedCurrFixedInc = 0;
        if (salaryRule && salaryRule.expectedAmount) {
            expectedYtdFixedInc += monthsPassed * Number(salaryRule.expectedAmount);
            expectedCurrFixedInc += Number(salaryRule.expectedAmount);
        }
        expectedYtdFixedInc += ytdSubInc;
        expectedCurrFixedInc += currSubInc;
        if (ytdIncome === 0)
            ytdIncome = expectedYtdFixedInc;
        if (currIncome === 0)
            currIncome = expectedCurrFixedInc;
        const ytdNetSavings = ytdIncome - ytdTotalExpense;
        const ytdSavingsRate = ytdIncome > 0 ? (ytdNetSavings / ytdIncome) * 100 : 0;
        const currTotalExpCalc = currFixed + currVariable;
        const currNetBalance = currIncome - currTotalExpCalc;
        const nextExpectedIncome = salaryRule && salaryRule.expectedAmount ? Number(salaryRule.expectedAmount) : currIncome;
        const nextMonthEmis = emis.filter(e => (e.tenure - e.monthsPaid) > 1);
        const nextExpectedFixed = nextMonthEmis.reduce((sum, e) => sum + Number(e.monthlyEmi), 0) +
            subs.filter(s => s.active && ['MONTHLY', 'YEARLY'].includes(s.frequency)).reduce((sum, s) => sum + Number(s.amount), 0);
        const nextCcPaymentDue = creditCards.reduce((sum, c) => sum + Number(c.currentOutstanding), 0);
        const nextEstTotalExp = nextExpectedFixed + currVariable;
        const nextEstBalance = nextExpectedIncome - nextEstTotalExp - nextCcPaymentDue;
        const fixedVsVar = ytdTotalExpense > 0 ? (ytdFixed / ytdTotalExpense) * 100 : 0;
        const emiTotal = emis.reduce((sum, e) => sum + Number(e.monthlyEmi), 0);
        const emiPercentOfIncome = currIncome > 0 ? (emiTotal / currIncome) * 100 : 0;
        let bankSpending = 0;
        let ccSpending = 0;
        for (const tx of ytdTxs) {
            if (tx.type === 'EXPENSE') {
                if (ccAccountIds.has(tx.accountId))
                    ccSpending += Number(tx.amount);
                else
                    bankSpending += Number(tx.amount);
            }
        }
        const ccVsBank = (ccSpending + bankSpending) > 0 ? (ccSpending / (ccSpending + bankSpending)) * 100 : 0;
        const fixedMaster = [];
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
            projections: Array.from({ length: 6 }).map((_, i) => {
                const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
                const activeEmis = emis.filter(e => (e.tenure - e.monthsPaid) > i);
                const fixedTotal = activeEmis.reduce((sum, e) => sum + Number(e.monthlyEmi), 0) +
                    subs.filter(s => s.active && ['MONTHLY', 'YEARLY'].includes(s.frequency)).reduce((sum, s) => sum + Number(s.amount), 0);
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
    async sumAmount(userId, type, start, end) {
        const result = await this.prisma.transaction.aggregate({
            where: { ...this.baseWhere(userId), type: type, transactionDate: { gte: start, lte: end } },
            _sum: { amount: true },
        });
        return Number(result._sum.amount ?? 0);
    }
    async getCategoryWiseRaw(userId, start, end) {
        const results = await this.prisma.transaction.groupBy({
            by: ['categoryId'],
            where: { ...this.baseWhere(userId), type: 'EXPENSE', transactionDate: { gte: start, lte: end } },
            _sum: { amount: true }, _count: true,
            orderBy: { _sum: { amount: 'desc' } },
        });
        const catIds = results.map(r => r.categoryId).filter(Boolean);
        const cats = await this.prisma.category.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true, color: true } });
        const catMap = new Map(cats.map(c => [c.id, c]));
        return results.map(r => ({
            category: catMap.get(r.categoryId) || { name: 'Uncategorized' },
            total: Number(r._sum.amount ?? 0), count: r._count,
        }));
    }
    async groupByDate(userId, type, start, end) {
        const txs = await this.prisma.transaction.findMany({
            where: { ...this.baseWhere(userId), type: type, transactionDate: { gte: start, lte: end } },
            select: { transactionDate: true, amount: true },
        });
        const map = new Map();
        for (const tx of txs) {
            const date = (0, common_2.toISTDateString)(tx.transactionDate);
            map.set(date, (map.get(date) ?? 0) + Number(tx.amount));
        }
        return Array.from(map.entries()).map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map