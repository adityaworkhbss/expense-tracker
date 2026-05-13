import { prisma } from '../lib/prisma';

async function migrateAccountTypes() {
  console.log('Starting account type migration...');

  // Step 1: Add new enum values to PostgreSQL
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "AccountType" ADD VALUE IF NOT EXISTS 'PAY_NOW'`);
    console.log('Added PAY_NOW to enum');
  } catch (e) {
    console.log('PAY_NOW already exists or error:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "AccountType" ADD VALUE IF NOT EXISTS 'PAY_LATER'`);
    console.log('Added PAY_LATER to enum');
  } catch (e) {
    console.log('PAY_LATER already exists or error:', e.message);
  }

  // Step 2: Update existing accounts - Bank/Cash/Wallet -> PAY_NOW, Credit Card -> PAY_LATER
  const payNow = await prisma.$executeRawUnsafe(
    `UPDATE accounts SET type = 'PAY_NOW' WHERE type IN ('CASH', 'BANK', 'WALLET')`
  );
  console.log('Converted to PAY_NOW:', payNow, 'rows');

  const payLater = await prisma.$executeRawUnsafe(
    `UPDATE accounts SET type = 'PAY_LATER' WHERE type = 'CREDIT_CARD'`
  );
  console.log('Converted to PAY_LATER:', payLater, 'rows');

  // Step 3: Remove old enum values (rename enum approach)
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "AccountType" RENAME TO "AccountType_old";
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "AccountType" AS ENUM ('PAY_NOW', 'PAY_LATER');
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE accounts ALTER COLUMN type TYPE "AccountType" USING type::text::"AccountType";
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE accounts ALTER COLUMN type SET DEFAULT 'PAY_NOW';
    `);
    await prisma.$executeRawUnsafe(`
      DROP TYPE "AccountType_old";
    `);
    console.log('Enum cleaned up - only PAY_NOW and PAY_LATER remain');
  } catch (e) {
    console.log('Enum cleanup note:', e.message);
  }

  // Step 4: Verify
  const accounts = await prisma.$queryRawUnsafe(`SELECT name, type FROM accounts`);
  console.log('\nFinal accounts:');
  accounts.forEach(a => console.log(`  - ${a.name}: ${a.type}`));
}

migrateAccountTypes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
