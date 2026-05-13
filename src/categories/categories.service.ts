import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Return tree structure: only top-level categories with their children
    return categories.filter((c) => !c.parentId);
  }

  async findAllFlat(userId: string) {
    return this.prisma.category.findMany({
      where: { userId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async create(userId: string, dto: CreateCategoryDto) {
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
        afterData: category as any,
      },
    });

    return category;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
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
        beforeData: existing as any,
        afterData: updated as any,
      },
    });

    return updated;
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);

    // Soft deactivate if transactions exist
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
        beforeData: existing as any,
      },
    });

    return { message: 'Category deleted' };
  }
}
