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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RecurringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const dayjs_1 = __importDefault(require("dayjs"));
let RecurringService = RecurringService_1 = class RecurringService {
    prisma;
    logger = new common_1.Logger(RecurringService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.recurringTransaction.findMany({
            where: { userId },
            orderBy: { nextRunAt: 'asc' },
        });
    }
    async create(userId, dto) {
        return this.prisma.recurringTransaction.create({
            data: {
                userId, accountId: dto.accountId, categoryId: dto.categoryId,
                type: dto.type, amount: dto.amount, frequency: dto.frequency,
                nextRunAt: new Date(dto.nextRunAt),
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                note: dto.note,
            },
        });
    }
    async update(userId, id, dto) {
        const existing = await this.prisma.recurringTransaction.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId)
            throw new common_1.NotFoundException('Recurring transaction not found');
        return this.prisma.recurringTransaction.update({
            where: { id },
            data: {
                ...(dto.accountId !== undefined && { accountId: dto.accountId }),
                ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                ...(dto.type !== undefined && { type: dto.type }),
                ...(dto.amount !== undefined && { amount: dto.amount }),
                ...(dto.frequency !== undefined && { frequency: dto.frequency }),
                ...(dto.nextRunAt !== undefined && { nextRunAt: new Date(dto.nextRunAt) }),
                ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
                ...(dto.active !== undefined && { active: dto.active }),
                ...(dto.note !== undefined && { note: dto.note }),
            },
        });
    }
    async remove(userId, id) {
        const existing = await this.prisma.recurringTransaction.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId)
            throw new common_1.NotFoundException();
        await this.prisma.recurringTransaction.delete({ where: { id } });
        return { message: 'Recurring transaction deleted' };
    }
    async processDueRecurring() {
        const now = new Date();
        const dueRecurrings = await this.prisma.recurringTransaction.findMany({
            where: { active: true, nextRunAt: { lte: now } },
        });
        let processed = 0;
        for (const rec of dueRecurrings) {
            try {
                if (rec.endDate && rec.endDate < now) {
                    await this.prisma.recurringTransaction.update({
                        where: { id: rec.id },
                        data: { active: false },
                    });
                    continue;
                }
                await this.prisma.transaction.create({
                    data: {
                        userId: rec.userId, accountId: rec.accountId, categoryId: rec.categoryId,
                        type: rec.type, amount: rec.amount,
                        transactionDate: now, note: rec.note ? `[Recurring] ${rec.note}` : '[Recurring]',
                        status: 'CLEARED',
                    },
                });
                const nextRun = this.calculateNextRun(rec.nextRunAt, rec.frequency);
                await this.prisma.recurringTransaction.update({
                    where: { id: rec.id },
                    data: { nextRunAt: nextRun },
                });
                processed++;
                this.logger.log(`Processed recurring ${rec.id} for user ${rec.userId}`);
            }
            catch (err) {
                this.logger.error(`Failed to process recurring ${rec.id}:`, err);
            }
        }
        return processed;
    }
    calculateNextRun(current, frequency) {
        const d = (0, dayjs_1.default)(current);
        switch (frequency) {
            case 'DAILY': return d.add(1, 'day').toDate();
            case 'WEEKLY': return d.add(1, 'week').toDate();
            case 'MONTHLY': return d.add(1, 'month').toDate();
            case 'YEARLY': return d.add(1, 'year').toDate();
            default: return d.add(1, 'month').toDate();
        }
    }
};
exports.RecurringService = RecurringService;
exports.RecurringService = RecurringService = RecurringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], RecurringService);
//# sourceMappingURL=recurring.service.js.map