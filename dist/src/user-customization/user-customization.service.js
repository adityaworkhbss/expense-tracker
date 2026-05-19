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
exports.UserCustomizationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
let UserCustomizationService = class UserCustomizationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(userId) {
        let customization = await this.prisma.userCustomization.findUnique({
            where: { userId },
        });
        if (!customization) {
            customization = await this.prisma.userCustomization.create({
                data: {
                    userId,
                    aiTransaction: false,
                    reminder: false,
                },
            });
        }
        return customization;
    }
    async update(userId, dto) {
        const existing = await this.prisma.userCustomization.findUnique({
            where: { userId },
        });
        if (!existing) {
            return this.prisma.userCustomization.create({
                data: {
                    userId,
                    aiTransaction: dto.aiTransaction ?? false,
                    reminder: dto.reminder ?? false,
                },
            });
        }
        return this.prisma.userCustomization.update({
            where: { userId },
            data: {
                ...(dto.aiTransaction !== undefined && { aiTransaction: dto.aiTransaction }),
                ...(dto.reminder !== undefined && { reminder: dto.reminder }),
            },
        });
    }
};
exports.UserCustomizationService = UserCustomizationService;
exports.UserCustomizationService = UserCustomizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], UserCustomizationService);
//# sourceMappingURL=user-customization.service.js.map