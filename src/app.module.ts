import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RecurringModule } from './recurring/recurring.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { EmisModule } from './emis/emis.module';
import { ObligationsModule } from './obligations/obligations.module';
import { CategoriesModule } from './categories/categories.module';
import { AccountsModule } from './accounts/accounts.module';
import { UserCustomizationModule } from './user-customization/user-customization.module';
import { ParseTransactionModule } from './parse-transaction/parse-transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TransactionsModule,
    BudgetsModule,
    AnalyticsModule,
    RecurringModule,
    CreditCardsModule, 
    EmisModule, 
    ObligationsModule,
    CategoriesModule,
    AccountsModule,
    UserCustomizationModule,
    ParseTransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
