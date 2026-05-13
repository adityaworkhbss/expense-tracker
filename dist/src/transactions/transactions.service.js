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
var TransactionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const accounts_service_1 = require("../accounts/accounts.service");
const aggregation_service_1 = require("./aggregation.service");
const common_2 = require("../common");
let TransactionsService = TransactionsService_1 = class TransactionsService {
    prisma;
    accountsService;
    aggregationService;
    logger = new common_1.Logger(TransactionsService_1.name);
    constructor(prisma, accountsService, aggregationService) {
        this.prisma = prisma;
        this.accountsService = accountsService;
        this.aggregationService = aggregationService;
    }
    async findAll(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {
            userId,
            isDeleted: false,
        };
        if (query.from || query.to) {
            const from = query.from || '2000-01-01';
            const to = query.to || '2099-12-31';
            const range = (0, common_2.getDateRange)(from, to);
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
        return (0, common_2.paginate)(data, total, page, limit);
    }
    async findOne(userId, id) {
        const tx = await this.prisma.transaction.findUnique({
            where: { id },
            include: {
                category: true,
                account: true,
                transferToAccount: true,
            },
        });
        if (!tx || tx.userId !== userId || tx.isDeleted) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return tx;
    }
    async create(userId, dto) {
        await this.accountsService.findOne(userId, dto.accountId);
        if (dto.type === 'TRANSFER') {
            if (!dto.transferToAccountId) {
                throw new common_1.BadRequestException('Transfer requires a target account');
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
            await tx.auditLog.create({
                data: {
                    userId,
                    action: 'CREATE',
                    entityType: 'Transaction',
                    entityId: created.id,
                    afterData: created,
                },
            });
            return created;
        });
        await this.accountsService.recalculateBalance(dto.accountId);
        if (dto.transferToAccountId) {
            await this.accountsService.recalculateBalance(dto.transferToAccountId);
        }
        await this.aggregationService.recalculateForTransaction(userId, new Date(dto.transactionDate));
        return transaction;
    }
    async update(userId, id, dto) {
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
                    beforeData: existing,
                    afterData: result,
                },
            });
            return result;
        });
        const accountsToRecalc = new Set([
            oldAccountId,
            updated.accountId,
        ]);
        if (oldTransferAccountId)
            accountsToRecalc.add(oldTransferAccountId);
        if (updated.transferToAccountId)
            accountsToRecalc.add(updated.transferToAccountId);
        for (const accId of accountsToRecalc) {
            await this.accountsService.recalculateBalance(accId);
        }
        await this.aggregationService.recalculateForTransaction(userId, oldDate);
        if (dto.transactionDate) {
            await this.aggregationService.recalculateForTransaction(userId, new Date(dto.transactionDate));
        }
        return updated;
    }
    async remove(userId, id) {
        const existing = await this.findOne(userId, id);
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
                    beforeData: existing,
                },
            });
        });
        await this.accountsService.recalculateBalance(existing.accountId);
        if (existing.transferToAccountId) {
            await this.accountsService.recalculateBalance(existing.transferToAccountId);
        }
        await this.aggregationService.recalculateForTransaction(userId, existing.transactionDate);
        return { message: 'Transaction deleted' };
    }
    async importTransactions(userId, transactions) {
        const results = { success: 0, failed: 0, errors: [] };
        for (const dto of transactions) {
            try {
                await this.create(userId, dto);
                results.success++;
            }
            catch (err) {
                results.failed++;
                results.errors.push(err.message);
            }
        }
        await this.aggregationService.fullRebuild(userId);
        return results;
    }
    async getExportData(userId, from, to) {
        const where = {
            userId,
            isDeleted: false,
        };
        if (from || to) {
            const range = (0, common_2.getDateRange)(from || '2000-01-01', to || '2099-12-31');
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
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = TransactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        accounts_service_1.AccountsService,
        aggregation_service_1.AggregationService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map