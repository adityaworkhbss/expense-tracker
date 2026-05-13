import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { AggregationService } from './aggregation.service';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [AccountsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, AggregationService],
  exports: [TransactionsService, AggregationService],
})
export class TransactionsModule {}
