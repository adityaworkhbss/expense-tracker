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
exports.ObligationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ObligationsService = class ObligationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUpcomingObligations(userId) {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const emis = await this.prisma.emi.findMany({
            where: {
                userId,
                active: true,
                nextDueDate: {
                    lte: nextMonth,
                }
            }
        });
        const ccStatements = await this.prisma.creditCardStatement.findMany({
            where: {
                creditCard: { userId },
                isSettled: false,
                dueDate: {
                    lte: nextMonth,
                }
            },
            include: { creditCard: true }
        });
        const recurring = await this.prisma.recurringTransaction.findMany({
            where: {
                userId,
                active: true,
                type: 'EXPENSE',
                nextRunAt: {
                    lte: nextMonth,
                }
            }
        });
        const payLaterAccounts = await this.prisma.account.findMany({
            where: {
                userId,
                type: 'PAY_LATER',
                currentBalance: {
                    lt: 0,
                },
                isActive: true,
            },
        });
        let totalObligations = 0;
        const formattedEmis = emis.map(emi => {
            totalObligations += Number(emi.monthlyEmi);
            return {
                type: 'EMI',
                name: emi.name,
                amount: Number(emi.monthlyEmi),
                dueDate: emi.nextDueDate,
            };
        });
        const formattedCc = ccStatements.map(stmt => {
            const pending = Number(stmt.billedAmount) - Number(stmt.paidAmount);
            totalObligations += pending;
            return {
                type: 'CREDIT_CARD',
                name: stmt.creditCard.cardName + ' Statement',
                amount: pending,
                dueDate: stmt.dueDate,
            };
        });
        const formattedRecurring = recurring.map(req => {
            totalObligations += Number(req.amount);
            return {
                type: 'RECURRING_EXPENSE',
                name: req.note || 'Recurring Expense',
                amount: Number(req.amount),
                dueDate: req.nextRunAt,
            };
        });
        const formattedPayLater = payLaterAccounts.map(acc => {
            const amount = Math.abs(Number(acc.currentBalance));
            totalObligations += amount;
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + 1);
            dueDate.setDate(5);
            return {
                type: 'PAY_LATER',
                name: acc.name + ' Repayment',
                amount: amount,
                dueDate: dueDate,
            };
        });
        return {
            totalObligations,
            items: [
                ...formattedEmis,
                ...formattedCc,
                ...formattedRecurring,
                ...formattedPayLater,
            ].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
        };
    }
};
exports.ObligationsService = ObligationsService;
exports.ObligationsService = ObligationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ObligationsService);
//# sourceMappingURL=obligations.service.js.map