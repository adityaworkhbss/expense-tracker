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
exports.EmisService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EmisService = class EmisService {
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
        return this.prisma.emi.create({
            data: {
                userId,
                accountId: dto.accountId,
                transactionId: dto.transactionId,
                name: dto.name,
                principal: dto.principal,
                tenure: dto.tenure,
                monthlyEmi: dto.monthlyEmi,
                startDate: new Date(dto.startDate),
                nextDueDate: new Date(dto.nextDueDate),
                remainingBalance: dto.principal,
                active: true,
            },
        });
    }
    async findAll(userId) {
        const emis = await this.prisma.emi.findMany({
            where: { userId },
            include: { account: true }
        });
        const now = new Date();
        const updatedEmis = await Promise.all(emis.map(async (emi) => {
            if (!emi.active)
                return emi;
            const startDate = emi.startDate ? new Date(emi.startDate) : new Date(emi.createdAt);
            if (isNaN(startDate.getTime()))
                return emi;
            let monthsPassed = (now.getFullYear() - startDate.getFullYear()) * 12;
            monthsPassed += now.getMonth() - startDate.getMonth();
            if (now.getDate() >= startDate.getDate()) {
                monthsPassed += 1;
            }
            const actualMonthsPaid = Math.min(emi.tenure, Math.max(0, monthsPassed));
            if (actualMonthsPaid !== emi.monthsPaid) {
                const remaining = Math.max(0, Number(emi.principal) - (actualMonthsPaid * Number(emi.monthlyEmi)));
                const isActive = actualMonthsPaid < emi.tenure;
                return this.prisma.emi.update({
                    where: { id: emi.id },
                    data: {
                        monthsPaid: actualMonthsPaid,
                        remainingBalance: remaining,
                        active: isActive
                    },
                    include: { account: true }
                });
            }
            return emi;
        }));
        return updatedEmis;
    }
    async findOne(userId, id) {
        const emi = await this.prisma.emi.findFirst({
            where: { id, userId },
            include: { account: true }
        });
        if (!emi)
            throw new common_1.NotFoundException('EMI not found');
        return emi;
    }
    async update(userId, id, dto) {
        const emi = await this.findOne(userId, id);
        const updateData = { ...dto };
        if (dto.nextDueDate) {
            updateData.nextDueDate = new Date(dto.nextDueDate);
        }
        return this.prisma.emi.update({
            where: { id: emi.id },
            data: updateData,
        });
    }
    async remove(userId, id) {
        const emi = await this.findOne(userId, id);
        return this.prisma.emi.delete({
            where: { id: emi.id },
        });
    }
};
exports.EmisService = EmisService;
exports.EmisService = EmisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmisService);
//# sourceMappingURL=emis.service.js.map