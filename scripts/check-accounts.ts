import { prisma } from '../lib/prisma';

async function run() {
  const accs = await prisma.account.findMany();
  console.log(JSON.stringify(accs, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
