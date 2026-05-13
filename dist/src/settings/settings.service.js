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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, timezone: true, currency: true, createdAt: true, updatedAt: true },
        });
        const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
        return { user, salaryRule };
    }
    async updateSettings(userId, dto) {
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.timezone !== undefined && { timezone: dto.timezone }),
                ...(dto.currency !== undefined && { currency: dto.currency }),
            },
            select: { id: true, name: true, email: true, timezone: true, currency: true },
        });
        await this.prisma.auditLog.create({
            data: { userId, action: 'UPDATE', entityType: 'User', entityId: userId, afterData: updated },
        });
        return updated;
    }
    async updateSalaryRule(userId, dto) {
        let salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId } });
        if (!salaryRule) {
            salaryRule = await this.prisma.salaryRule.create({
                data: { userId, salaryDay: dto.salaryDay ?? 10, expectedAmount: dto.expectedAmount, cycleStartDay: dto.cycleStartDay ?? 10 },
            });
        }
        else {
            salaryRule = await this.prisma.salaryRule.update({
                where: { id: salaryRule.id },
                data: {
                    ...(dto.salaryDay !== undefined && { salaryDay: dto.salaryDay }),
                    ...(dto.expectedAmount !== undefined && { expectedAmount: dto.expectedAmount }),
                    ...(dto.cycleStartDay !== undefined && { cycleStartDay: dto.cycleStartDay }),
                    ...(dto.active !== undefined && { active: dto.active }),
                    ...(dto.timezone !== undefined && { timezone: dto.timezone }),
                },
            });
        }
        return salaryRule;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map