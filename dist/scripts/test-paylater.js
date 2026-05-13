"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const obligations_service_1 = require("../src/obligations/obligations.service");
async function testPayLaterLogic() {
    console.log('Testing Pay Later Obligation Logic...');
    const obligationsService = new obligations_service_1.ObligationsService(prisma_1.prisma);
    const userId = 'eaa88a0a-0e70-4aa1-87fd-0d06f8156a84';
    const payLaterAccount = await prisma_1.prisma.account.findFirst({
        where: { userId, type: 'PAY_LATER' }
    });
    if (!payLaterAccount) {
        console.error('No PAY_LATER account found!');
        return;
    }
    console.log(`Using account: ${payLaterAccount.name}`);
    await prisma_1.prisma.transaction.create({
        data: {
            userId,
            accountId: payLaterAccount.id,
            amount: 1500,
            type: 'EXPENSE',
            transactionDate: new Date(),
            status: 'CLEARED'
        }
    });
    const incomeSum = await prisma_1.prisma.transaction.aggregate({
        where: { accountId: payLaterAccount.id, isDeleted: false, status: 'CLEARED', type: 'INCOME' },
        _sum: { amount: true }
    });
    const expenseSum = await prisma_1.prisma.transaction.aggregate({
        where: { accountId: payLaterAccount.id, isDeleted: false, status: 'CLEARED', type: { in: ['EXPENSE', 'TRANSFER'] } },
        _sum: { amount: true }
    });
    const newBalance = Number(payLaterAccount.openingBalance) + Number(incomeSum._sum.amount ?? 0) - Number(expenseSum._sum.amount ?? 0);
    await prisma_1.prisma.account.update({
        where: { id: payLaterAccount.id },
        data: { currentBalance: newBalance }
    });
    console.log(`Updated Balance for ${payLaterAccount.name}: ${newBalance}`);
    const obligations = await obligationsService.getUpcomingObligations(userId);
    console.log('--- Upcoming Obligations ---');
    console.log(`Total: ${obligations.totalObligations}`);
    obligations.items.forEach(item => {
        console.log(`- ${item.name}: ${item.amount} (${item.type})`);
    });
    const payLaterItem = obligations.items.find(i => i.type === 'PAY_LATER');
    if (payLaterItem) {
        console.log('✅ SUCCESS: Pay Later debt is correctly included in obligations!');
    }
    else {
        console.log('❌ FAILURE: Pay Later debt missing from obligations.');
    }
}
testPayLaterLogic()
    .catch(console.error)
    .finally(() => prisma_1.prisma.$disconnect());
//# sourceMappingURL=test-paylater.js.map