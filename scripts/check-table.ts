import { prisma } from '../lib/prisma';

async function checkTable() {
  const res = await prisma.$queryRawUnsafe(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'accounts'`);
  console.log(res);
}

checkTable()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
