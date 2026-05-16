import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmiDto, UpdateEmiDto } from './dto/emi.dto';

@Injectable()
export class EmisService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEmiDto) {
    if (dto.accountId) {
      const account = await this.prisma.account.findUnique({
        where: { id: dto.accountId }
      });

      if (!account || account.userId !== userId) {
        throw new BadRequestException('Invalid account ID');
      }
    }

    const monthsPaid = dto.monthsPaid ?? 0;
    const remainingBalance = Math.max(0, Number(dto.principal) - (monthsPaid * Number(dto.monthlyEmi)));

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
        remainingBalance: remainingBalance,
        monthsPaid: monthsPaid,
        active: monthsPaid < dto.tenure,
      },
    });
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
