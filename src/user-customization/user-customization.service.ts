import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UpdateUserCustomizationDto } from './dto/user-customization.dto';

@Injectable()
export class UserCustomizationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get customization for a user. Auto-creates with defaults if not found.
   */
  async get(userId: string) {
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

  /**
   * Update customization flags. Creates if not exists.
   */
  async update(userId: string, dto: UpdateUserCustomizationDto) {
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
}
