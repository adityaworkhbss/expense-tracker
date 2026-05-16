import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmiDto, UpdateEmiDto } from './dto/emi.dto';

@Injectable()
export class EmisService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEmiDto) {
    const data = await this.prepareEmiData(userId, dto);
    return this.prisma.emi.create({ data });
  }

  async createMany(userId: string, dtos: CreateEmiDto[]) {
    return this.prisma.$transaction(async (tx) => {
      const emis: any[] = [];
      for (const dto of dtos) {
        const data = await this.prepareEmiData(userId, dto);
        const emi = await tx.emi.create({ data });
        emis.push(emi);
      }
      return emis;
    });
  }

  private async prepareEmiData(userId: string, dto: CreateEmiDto) {
    if (dto.accountId) {
      const account = await this.prisma.account.findUnique({
        where: { id: dto.accountId }
      });

      if (!account || account.userId !== userId) {
        throw new BadRequestException(`Invalid account ID: ${dto.accountId}`);
      }
    }

    const monthsPaid = dto.monthsPaid ?? 0;
    const tenure = dto.tenure ?? (dto.principal ? Math.ceil(Number(dto.principal) / Number(dto.monthlyEmi)) : 0);
    const principal = dto.principal ?? (Number(dto.monthlyEmi) * tenure);
    const remainingBalance = Math.max(0, principal - (monthsPaid * Number(dto.monthlyEmi)));
    
    const startDate = new Date(dto.startDate);
    
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date(startDate);
    if (!dto.endDate && tenure > 0) {
      endDate.setMonth(endDate.getMonth() + tenure);
    }

    const nextDueDate = dto.nextDueDate ? new Date(dto.nextDueDate) : new Date(startDate);
    if (!dto.nextDueDate) {
      nextDueDate.setMonth(nextDueDate.getMonth() + monthsPaid + 1);
    }

    return {
      userId,
      accountId: dto.accountId,
      transactionId: dto.transactionId,
      name: dto.name,
      principal: principal,
      tenure: tenure,
      monthlyEmi: dto.monthlyEmi,
      startDate: startDate,
      endDate: tenure > 0 ? endDate : null,
      nextDueDate: nextDueDate,
      remainingBalance: remainingBalance,
      monthsPaid: monthsPaid,
      active: tenure > 0 ? monthsPaid < tenure : true,
    };
  }

  async findAll(userId: string) {
    const emis = await this.prisma.emi.findMany({
      where: { userId },
      include: { account: true }
    });

    const now = new Date();
    const updatedEmis = await Promise.all(emis.map(async (emi) => {
      if (!emi.active) return emi;

      const startDate = emi.startDate ? new Date(emi.startDate) : new Date(emi.createdAt);
      if (isNaN(startDate.getTime())) return emi;

      // Calculate months passed since start date
      let monthsPassed = (now.getFullYear() - startDate.getFullYear()) * 12;
      monthsPassed += now.getMonth() - startDate.getMonth();
      
      // If today's day is >= start date's day, the current month's EMI is considered "paid"
      if (now.getDate() >= startDate.getDate()) {
        monthsPassed += 1;
      }
      
      // We start at 1 if the date has passed. If it hasn't even reached the first month, it's 0.
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

  async findOne(userId: string, id: string) {
    const emi = await this.prisma.emi.findFirst({
      where: { id, userId },
      include: { account: true }
    });
    if (!emi) throw new NotFoundException('EMI not found');
    return emi;
  }

  async update(userId: string, id: string, dto: UpdateEmiDto) {
    const emi = await this.findOne(userId, id);

    const updateData: any = { ...dto };
    if (dto.nextDueDate) {
      updateData.nextDueDate = new Date(dto.nextDueDate);
    }

    return this.prisma.emi.update({
      where: { id: emi.id },
      data: updateData,
    });
  }

  async remove(userId: string, id: string) {
    const emi = await this.findOne(userId, id);
    return this.prisma.emi.delete({
      where: { id: emi.id },
    });
  }
}
