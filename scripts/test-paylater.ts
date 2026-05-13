import { prisma } from '../lib/prisma';
import { ObligationsService } from '../src/obligations/obligations.service';

async function testPayLaterLogic() {
  console.log('Testing Pay Later Obligation Logic...');
  const obligationsService = new ObligationsService(prisma as any);
  const userId = 'eaa88a0a-0e70-4aa1-87fd-0d06f8156a84';

  // 1. Create a PAY_LATER transaction
  const payLaterAccount = await prisma.account.findFirst({
    where: { userId, type: 'PAY_LATER' }
  });

  if (!payLaterAccount) {
    console.error('No PAY_LATER account found!');
    return;
  }

  console.log(`Using account: ${payLaterAccount.name}`);

  // Add an expense to this account
  await prisma.transaction.create({
    data: {
      userId,
      accountId: payLaterAccount.id,
      amount: 1500,
      type: 'EXPENSE',
      transactionDate: new Date(),
      status: 'CLEARED'
    }
  });

  // 2. Recalculate balance
  // We need to simulate the service call or just check DB if the service usually handles it
  // But our script already updated the recalculateBalance logic in the service.
  // Let's manually trigger it for the test.
  
  const incomeSum = await prisma.transaction.aggregate({
    where: { accountId: payLaterAccount.id, isDeleted: false, status: 'CLEARED', type: 'INCOME' },
    _sum: { amount: true }
  });
  const expenseSum = await prisma.transaction.aggregate({
    where: { accountId: payLaterAccount.id, isDeleted: false, status: 'CLEARED', type: { in: ['EXPENSE', 'TRANSFER'] } },
    _sum: { amount: true }
  });
  
  const newBalance = Number(payLaterAccount.openingBalance) + Number(incomeSum._sum.amount ?? 0) - Number(expenseSum._sum.amount ?? 0);
  
  await prisma.account.update({
    where: { id: payLaterAccount.id },
    data: { currentBalance: newBalance }
  });

  console.log(`Updated Balance for ${payLaterAccount.name}: ${newBalance}`);

  // 3. Check Obligations
  const obligations = await obligationsService.getUpcomingObligations(userId);
  console.log('--- Upcoming Obligations ---');
  console.log(`Total: ${obligations.totalObligations}`);
  obligations.items.forEach(item => {
    console.log(`- ${item.name}: ${item.amount} (${item.type})`);
  });

  const payLaterItem = obligations.items.find(i => i.type === 'PAY_LATER');
  if (payLaterItem) {
    console.log('✅ SUCCESS: Pay Later debt is correctly included in obligations!');
  } else {
    console.log('❌ FAILURE: Pay Later debt missing from obligations.');
  }
}

testPayLaterLogic()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
