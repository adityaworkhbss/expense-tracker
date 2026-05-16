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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        if (!userId)
            return [];
        const categories = await this.prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });
        const categoryMap = new Map();
        const roots = [];
        categories.forEach((cat) => {
            cat.children = [];
            categoryMap.set(cat.id, cat);
        });
        categories.forEach((cat) => {
            if (cat.parentId && categoryMap.has(cat.parentId)) {
                if (cat.isActive) {
                    categoryMap.get(cat.parentId).children.push(cat);
                }
            }
            else if (!cat.parentId) {
                roots.push(cat);
            }
        });
        return roots;
    }
    async findAllFlat(userId) {
        return this.prisma.category.findMany({
            where: { userId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(userId, id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { children: true },
        });
        if (!category || category.userId !== userId) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async create(userId, dto) {
        const category = await this.prisma.category.create({
            data: {
                userId,
                name: dto.name,
                type: dto.type,
                parentId: dto.parentId,
                color: dto.color,
                icon: dto.icon,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'CREATE',
                entityType: 'Category',
                entityId: category.id,
                afterData: category,
            },
        });
        return category;
    }
    async createMany(userId, dtos) {
        return this.prisma.$transaction(async (tx) => {
            const createdCategories = [];
            for (const dto of dtos) {
                const category = await tx.category.create({
                    data: {
                        userId,
                        name: dto.name,
                        type: dto.type,
                        parentId: dto.parentId,
                        color: dto.color,
                        icon: dto.icon,
                    },
                });
                createdCategories.push(category);
                await tx.auditLog.create({
                    data: {
                        userId,
                        action: 'CREATE',
                        entityType: 'Category',
                        entityId: category.id,
                        afterData: category,
                    },
                });
            }
            return createdCategories;
        });
    }
    async update(userId, id, dto) {
        const existing = await this.findOne(userId, id);
        const updated = await this.prisma.category.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.type !== undefined && { type: dto.type }),
                ...(dto.parentId !== undefined && { parentId: dto.parentId }),
                ...(dto.color !== undefined && { color: dto.color }),
                ...(dto.icon !== undefined && { icon: dto.icon }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'UPDATE',
                entityType: 'Category',
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
            where: { categoryId: id, isDeleted: false },
        });
        if (txCount > 0) {
            return this.prisma.category.update({
                where: { id },
                data: { isActive: false },
            });
        }
        await this.prisma.category.delete({ where: { id } });
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'DELETE',
                entityType: 'Category',
                entityId: id,
                beforeData: existing,
            },
        });
        return { message: 'Category deleted' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map