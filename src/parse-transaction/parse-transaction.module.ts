import { Module } from '@nestjs/common';
import { ParseTransactionController } from './parse-transaction.controller';
import { ParseTransactionService } from './parse-transaction.service';
import { UserCustomizationModule } from '../user-customization/user-customization.module';

@Module({
  imports: [UserCustomizationModule],
  controllers: [ParseTransactionController],
  providers: [ParseTransactionService],
})
export class ParseTransactionModule {}
