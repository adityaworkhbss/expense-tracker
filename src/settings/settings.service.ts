import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UpdateSettingsDto, UpdateSalaryRuleDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, timezone: true, currency: true, createdAt: true, updatedAt: true },
    });
    const salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId, active: true } });
    return { user, salaryRule };
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
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
      data: { userId, action: 'UPDATE', entityType: 'User', entityId: userId, afterData: updated as any },
    });
    return updated;
  }

  async updateSalaryRule(userId: string, dto: UpdateSalaryRuleDto) {
    let salaryRule = await this.prisma.salaryRule.findFirst({ where: { userId } });
    if (!salaryRule) {
      salaryRule = await this.prisma.salaryRule.create({
        data: { userId, salaryDay: dto.salaryDay ?? 10, expectedAmount: dto.expectedAmount, cycleStartDay: dto.cycleStartDay ?? 10 },
      });
    } else {
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
}
