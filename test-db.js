const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./generated/prisma');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const recurring = await prisma.recurringTransaction.findMany();
  console.log('Recurring:', JSON.stringify(recurring, null, 2));
  
  const emis = await prisma.emi.findMany();
  console.log('EMIs:', JSON.stringify(emis, null, 2));
}

main().finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
