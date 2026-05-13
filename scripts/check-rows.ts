import { prisma } from '../lib/prisma';

async function checkRows() {
  const res = await prisma.$queryRawUnsafe(`SELECT * FROM accounts LIMIT 1`);
  const rows = res as any[];
  if (rows.length > 0) {
    console.log(Object.keys(rows[0]));
  }
}

checkRows()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
