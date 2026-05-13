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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const analytics_service_1 = require("../analytics/analytics.service");
const common_2 = require("../common");
let DashboardService = class DashboardService {
    prisma;
    analyticsService;
    constructor(prisma, analyticsService) {
        this.prisma = prisma;
        this.analyticsService = analyticsService;
    }
    async getDashboard(userId) {
        const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
        const cycleDay = salaryRule?.cycleStartDay ?? 10;
        const today = (0, common_2.getTodayRange)();
        const week = (0, common_2.getThisWeekRange)();
        const month = (0, common_2.getThisMonthRange)();
        const cycle = (0, common_2.getSalaryCycleDates)(new Date(), cycleDay);
        const last7 = (0, common_2.getLastNDaysRange)(7);
        const last30 = (0, common_2.getLastNDaysRange)(30);
        const [todayIncome, todayExpense, weekIncome, weekExpense, monthIncome, monthExpense, cycleIncome, cycleExpense,] = await Promise.all([
            this.sumAmount(userId, 'INCOME', today.start, today.end),
            this.sumAmount(userId, 'EXPENSE', today.start, today.end),
            this.sumAmount(userId, 'INCOME', week.start, week.end),
            this.sumAmount(userId, 'EXPENSE', week.start, week.end),
            this.sumAmount(userId, 'INCOME', month.start, month.end),
            this.sumAmount(userId, 'EXPENSE', month.start, month.end),
            this.sumAmount(userId, 'INCOME', cycle.start, cycle.end),
            this.sumAmount(userId, 'EXPENSE', cycle.start, cycle.end),
        ]);
        const accounts = await this.prisma.account.findMany({
            where: { userId, isActive: true },
            select: { id: true, name: true, type: true, currentBalance: true },
        });
        const netBalance = accounts.reduce((s, a) => s + Number(a.currentBalance), 0);
        const fromStr = (0, common_2.toISTDateString)(month.start);
        const toStr = (0, common_2.toISTDateString)(month.end);
        const categoryWise = await this.analyticsService.getCategoryWise(userId, fromStr, toStr);
        const topCategories = categoryWise.slice(0, 5);
        const recentTransactions = await this.prisma.transaction.findMany({
            where: { userId, isDeleted: false },
            include: {
                category: { select: { id: true, name: true, color: true, icon: true } },
                account: { select: { id: true, name: true, type: true } },
            },
            orderBy: { transactionDate: 'desc' },
            take: 10,
        });
        const last7DaysTrend = await this.getDailyTrend(userId, last7.start, last7.end);
        const last30DaysTrend = await this.getDailyTrend(userId, last30.start, last30.end);
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
    async sumAmount(userId, type, start, end) {
        const result = await this.prisma.transaction.aggregate({
            where: { userId, isDeleted: false, status: 'CLEARED', type: type, transactionDate: { gte: start, lte: end } },
            _sum: { amount: true },
        });
        return Number(result._sum.amount ?? 0);
    }
    async getDailyTrend(userId, start, end) {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId, isDeleted: false, status: 'CLEARED', transactionDate: { gte: start, lte: end } },
            select: { transactionDate: true, amount: true, type: true },
        });
        const dayMap = new Map();
        for (const tx of transactions) {
            const date = (0, common_2.toISTDateString)(tx.transactionDate);
            const entry = dayMap.get(date) || { income: 0, expense: 0 };
            if (tx.type === 'INCOME')
                entry.income += Number(tx.amount);
            else if (tx.type === 'EXPENSE')
                entry.expense += Number(tx.amount);
            dayMap.set(date, entry);
        }
        return Array.from(dayMap.entries())
            .map(([date, data]) => ({ date, ...data, net: data.income - data.expense }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        analytics_service_1.AnalyticsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map