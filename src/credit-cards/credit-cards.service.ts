import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditCardDto, UpdateCreditCardDto } from './dto/credit-card.dto';

@Injectable()
export class CreditCardsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCreditCardDto) {
    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId }
    });

    if (!account || account.userId !== userId) {
      throw new BadRequestException('Invalid account ID');
    }

    if (account.type !== 'CREDIT_CARD') {
      throw new BadRequestException('Account must be of type CREDIT_CARD');
    }

    const existingCard = await this.prisma.creditCard.findUnique({
      where: { accountId: dto.accountId }
    });

    if (existingCard) {
      throw new BadRequestException('Credit card already linked to this account');
    }

    return this.prisma.creditCard.create({
      data: {
        userId,
        accountId: dto.accountId,
        cardName: dto.cardName,
        limit: dto.limit,
        statementDate: dto.statementDate,
        dueDays: dto.dueDays,
        currentOutstanding: 0,
        availableLimit: dto.limit,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.creditCard.findMany({
      where: { userId },
      include: {
        account: true,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const card = await this.prisma.creditCard.findFirst({
      where: { id, userId },
      include: {
        account: true,
      },
    });

    if (!card) {
      throw new NotFoundException('Credit card not found');
    }
    return card;
  }

  async update(userId: string, id: string, dto: UpdateCreditCardDto) {
    const card = await this.findOne(userId, id);
    
    // Check if limit is being updated, then availableLimit might need to change
    const updateData: any = { ...dto };
    if (dto.limit !== undefined) {
      const limitDiff = Number(dto.limit) - Number(card.limit);
      updateData.availableLimit = Number(card.availableLimit) + limitDiff;
    }

    return this.prisma.creditCard.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(userId: string, id: string) {
    const card = await this.findOne(userId, id);
    return this.prisma.creditCard.delete({
      where: { id: card.id },
    });
  }
}
