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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
let AccountsService = class AccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.account.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(userId, id) {
        const account = await this.prisma.account.findUnique({ where: { id } });
        if (!account || account.userId !== userId) {
            throw new common_1.NotFoundException('Account not found');
        }
        return account;
    }
    async create(userId, dto) {
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
                afterData: account,
            },
        });
        return account;
    }
    async createMany(userId, dtos) {
        return this.prisma.$transaction(async (tx) => {
            const createdAccounts = [];
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
                        afterData: account,
                    },
                });
            }
            return createdAccounts;
        });
    }
    async update(userId, id, dto) {
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
                beforeData: existing,
                afterData: updated,
            },
        });
        return updated;
    }
    async remove(userId, id) {
        const existing = await this.findOne(userId, id);
        const txCount = await this.prisma.transaction.count({
            where: { accountId: id, isDeleted: false },
        });
        if (txCount > 0) {
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
                    beforeData: existing,
                },
            });
            return { message: 'Account deleted' };
        }
        catch (error) {
            return this.prisma.account.update({
                where: { id },
                data: { isActive: false },
            });
        }
    }
    async recalculateBalance(accountId) {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
        });
        if (!account)
            return;
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
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map