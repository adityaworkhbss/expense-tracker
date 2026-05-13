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
var AggregationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const common_2 = require("../common");
let AggregationService = AggregationService_1 = class AggregationService {
    prisma;
    logger = new common_1.Logger(AggregationService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recalculateDaily(userId, date) {
        const dateStr = (0, common_2.toISTDateString)(date);
        const dateOnly = new Date(dateStr + 'T00:00:00.000Z');
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
    async recalculateMonthly(userId, date) {
        const monthKey = (0, common_2.toISTMonthKey)(date);
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
    async recalculateForTransaction(userId, transactionDate) {
        await Promise.all([
            this.recalculateDaily(userId, transactionDate),
            this.recalculateMonthly(userId, transactionDate),
        ]);
    }
    async fullRebuild(userId) {
        this.logger.log(`Starting full aggregate rebuild for user ${userId}`);
        const transactions = await this.prisma.transaction.findMany({
            where: { userId, isDeleted: false, status: 'CLEARED' },
            select: { transactionDate: true },
        });
        const uniqueDates = new Set();
        const uniqueMonths = new Set();
        for (const tx of transactions) {
            uniqueDates.add((0, common_2.toISTDateString)(tx.transactionDate));
            uniqueMonths.add((0, common_2.toISTMonthKey)(tx.transactionDate));
        }
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
};
exports.AggregationService = AggregationService;
exports.AggregationService = AggregationService = AggregationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], AggregationService);
//# sourceMappingURL=aggregation.service.js.map