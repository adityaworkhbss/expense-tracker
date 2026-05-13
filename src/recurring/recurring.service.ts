import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateRecurringDto, UpdateRecurringDto } from './dto/recurring.dto';
import dayjs from 'dayjs';

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.recurringTransaction.findMany({
      where: { userId },
      orderBy: { nextRunAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateRecurringDto) {
    return this.prisma.recurringTransaction.create({
      data: {
        userId, accountId: dto.accountId, categoryId: dto.categoryId,
        type: dto.type, amount: dto.amount, frequency: dto.frequency,
        nextRunAt: new Date(dto.nextRunAt),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        note: dto.note,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateRecurringDto) {
    const existing = await this.prisma.recurringTransaction.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) throw new NotFoundException('Recurring transaction not found');

    return this.prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...(dto.accountId !== undefined && { accountId: dto.accountId }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.frequency !== undefined && { frequency: dto.frequency }),
        ...(dto.nextRunAt !== undefined && { nextRunAt: new Date(dto.nextRunAt) }),
        ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
        ...(dto.active !== undefined && { active: dto.active }),
        ...(dto.note !== undefined && { note: dto.note }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.recurringTransaction.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) throw new NotFoundException();
    await this.prisma.recurringTransaction.delete({ where: { id } });
    return { message: 'Recurring transaction deleted' };
  }

  /**
   * Process all due recurring transactions (called by cron job).
   */
  async processDueRecurring(): Promise<number> {
    const now = new Date();
    const dueRecurrings = await this.prisma.recurringTransaction.findMany({
      where: { active: true, nextRunAt: { lte: now } },
    });

    let processed = 0;
    for (const rec of dueRecurrings) {
      try {
        // Check if end date has passed
        if (rec.endDate && rec.endDate < now) {
          await this.prisma.recurringTransaction.update({
            where: { id: rec.id },
            data: { active: false },
          });
          continue;
        }

        // Create the transaction
        await this.prisma.transaction.create({
          data: {
            userId: rec.userId, accountId: rec.accountId, categoryId: rec.categoryId,
            type: rec.type, amount: rec.amount,
            transactionDate: now, note: rec.note ? `[Recurring] ${rec.note}` : '[Recurring]',
            status: 'CLEARED',
          },
        });

        // Calculate next run date
        const nextRun = this.calculateNextRun(rec.nextRunAt, rec.frequency);
        await this.prisma.recurringTransaction.update({
          where: { id: rec.id },
          data: { nextRunAt: nextRun },
        });

        processed++;
        this.logger.log(`Processed recurring ${rec.id} for user ${rec.userId}`);
      } catch (err) {
        this.logger.error(`Failed to process recurring ${rec.id}:`, err);
      }
    }
    return processed;
  }

  private calculateNextRun(current: Date, frequency: string): Date {
    const d = dayjs(current);
    switch (frequency) {
      case 'DAILY': return d.add(1, 'day').toDate();
      case 'WEEKLY': return d.add(1, 'week').toDate();
      case 'MONTHLY': return d.add(1, 'month').toDate();
      case 'YEARLY': return d.add(1, 'year').toDate();
      default: return d.add(1, 'month').toDate();
    }
  }
}
