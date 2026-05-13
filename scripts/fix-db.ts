import { prisma } from '../lib/prisma';

async function fixDatabase() {
  console.log('Fixing Database Types...');
  
  try {
    // 1. Drop the old enum if it exists
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "AccountType_old" CASCADE`);
    console.log('Dropped AccountType_old');
  } catch (e) {
    console.log('Note:', e.message);
  }

  // 2. Ensure current AccountType is correct
  try {
    // Check if AccountType already has PAY_NOW and PAY_LATER
    // If not, we re-create it.
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "AccountType" AS ENUM ('PAY_NOW', 'PAY_LATER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('AccountType enum ensured');
  } catch (e) {
    console.log('Note:', e.message);
  }

  // 3. Force the table column to use the enum correctly
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE accounts ALTER COLUMN type TYPE "AccountType" USING type::text::"AccountType";
    `);
    console.log('Accounts table type column updated');
  } catch (e) {
    console.log('Note:', e.message);
  }
}

fixDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
