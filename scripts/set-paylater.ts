import { prisma } from '../lib/prisma';

async function setPayLater() {
  await prisma.account.updateMany({
    where: { name: { contains: 'Credit' } },
    data: { type: 'PAY_LATER' }
  });
  console.log('Updated Credit Card to PAY_LATER');
  
  const accs = await prisma.account.findMany();
  console.log(accs.map(a => `${a.name}: ${a.type}`));
}

setPayLater()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
