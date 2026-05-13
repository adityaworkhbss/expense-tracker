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
exports.CreditCardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CreditCardsService = class CreditCardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const account = await this.prisma.account.findUnique({
            where: { id: dto.accountId }
        });
        if (!account || account.userId !== userId) {
            throw new common_1.BadRequestException('Invalid account ID');
        }
        if (account.type !== 'CREDIT_CARD') {
            throw new common_1.BadRequestException('Account must be of type CREDIT_CARD');
        }
        const existingCard = await this.prisma.creditCard.findUnique({
            where: { accountId: dto.accountId }
        });
        if (existingCard) {
            throw new common_1.BadRequestException('Credit card already linked to this account');
        }
        return this.prisma.creditCard.create({
            data: {
                userId,
                accountId: dto.accountId,
                cardName: dto.cardName,
                limit: dto.limit,
                statementDate: dto.statementDate,
                dueDays: dto.dueDays,
                currentOutstanding: 0,
                availableLimit: dto.limit,
            },
        });
    }
    async findAll(userId) {
        return this.prisma.creditCard.findMany({
            where: { userId },
            include: {
                account: true,
            },
        });
    }
    async findOne(userId, id) {
        const card = await this.prisma.creditCard.findFirst({
            where: { id, userId },
            include: {
                account: true,
            },
        });
        if (!card) {
            throw new common_1.NotFoundException('Credit card not found');
        }
        return card;
    }
    async update(userId, id, dto) {
        const card = await this.findOne(userId, id);
        const updateData = { ...dto };
        if (dto.limit !== undefined) {
            const limitDiff = Number(dto.limit) - Number(card.limit);
            updateData.availableLimit = Number(card.availableLimit) + limitDiff;
        }
        return this.prisma.creditCard.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(userId, id) {
        const card = await this.findOne(userId, id);
        return this.prisma.creditCard.delete({
            where: { id: card.id },
        });
    }
};
exports.CreditCardsService = CreditCardsService;
exports.CreditCardsService = CreditCardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreditCardsService);
//# sourceMappingURL=credit-cards.service.js.map