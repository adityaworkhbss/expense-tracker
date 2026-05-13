import { Module } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardsController } from './credit-cards.controller';

@Module({
  providers: [CreditCardsService],
  controllers: [CreditCardsController]
})
export class CreditCardsModule {}
