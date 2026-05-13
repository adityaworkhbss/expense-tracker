import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ObligationsService {
  constructor(private prisma: PrismaService) {}

  async getUpcomingObligations(userId: string) {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // 1. Get Active EMIs
    const emis = await this.prisma.emi.findMany({
      where: {
        userId,
        active: true,
        nextDueDate: {
          lte: nextMonth,
        }
      }
    });

    // 2. Get Credit Card Statements that are due
    const ccStatements = await this.prisma.creditCardStatement.findMany({
      where: {
        creditCard: { userId },
        isSettled: false,
        dueDate: {
          lte: nextMonth,
        }
      },
      include: { creditCard: true }
    });

    // 3. Get Upcoming Recurring Transactions
    const recurring = await this.prisma.recurringTransaction.findMany({
      where: {
        userId,
        active: true,
        type: 'EXPENSE',
        nextRunAt: {
          lte: nextMonth,
        }
      }
    });

    // 4. Get PAY_LATER accounts with negative balances (outstanding)
    const payLaterAccounts = await this.prisma.account.findMany({
      where: {
        userId,
        type: 'PAY_LATER',
        currentBalance: {
          lt: 0,
        },
        isActive: true,
      },
    });

    let totalObligations = 0;

    const formattedEmis = emis.map(emi => {
      totalObligations += Number(emi.monthlyEmi);
      return {
        type: 'EMI',
        name: emi.name,
        amount: Number(emi.monthlyEmi),
        dueDate: emi.nextDueDate,
      };
    });

    const formattedCc = ccStatements.map(stmt => {
      const pending = Number(stmt.billedAmount) - Number(stmt.paidAmount);
      totalObligations += pending;
      return {
        type: 'CREDIT_CARD',
        name: stmt.creditCard.cardName + ' Statement',
        amount: pending,
        dueDate: stmt.dueDate,
      };
    });

    const formattedRecurring = recurring.map(req => {
      totalObligations += Number(req.amount);
      return {
        type: 'RECURRING_EXPENSE',
        name: req.note || 'Recurring Expense',
        amount: Number(req.amount),
        dueDate: req.nextRunAt,
      };
    });

    const formattedPayLater = payLaterAccounts.map(acc => {
      const amount = Math.abs(Number(acc.currentBalance));
      totalObligations += amount;
      
      // Default due date to 5th of next month if no statement date exists
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);
      dueDate.setDate(5); 

      return {
        type: 'PAY_LATER',
        name: acc.name + ' Repayment',
        amount: amount,
        dueDate: dueDate,
      };
    });

    return {
      totalObligations,
      items: [
        ...formattedEmis,
        ...formattedCc,
        ...formattedRecurring,
        ...formattedPayLater,
      ].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
    };
  }
}
