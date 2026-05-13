import { prisma } from '../lib/prisma';

async function main() {
  console.log('Seeding database...');
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@expense-tracker.com' },
    update: {},
    create: {
      email: 'admin@expense-tracker.com',
      name: 'Admin User',
      passwordHash: 'dummy_hash',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
  });

  const account = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Main Bank Account',
      type: 'PAY_NOW',
      openingBalance: 50000,
      currentBalance: 50000,
    },
  });

  console.log(`Created user ${user.email} and account ${account.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
