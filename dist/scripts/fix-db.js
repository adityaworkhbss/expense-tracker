"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function fixDatabase() {
    console.log('Fixing Database Types...');
    try {
        await prisma_1.prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "AccountType_old" CASCADE`);
        console.log('Dropped AccountType_old');
    }
    catch (e) {
        console.log('Note:', e.message);
    }
    try {
        await prisma_1.prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "AccountType" AS ENUM ('PAY_NOW', 'PAY_LATER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
        console.log('AccountType enum ensured');
    }
    catch (e) {
        console.log('Note:', e.message);
    }
    try {
        await prisma_1.prisma.$executeRawUnsafe(`
      ALTER TABLE accounts ALTER COLUMN type TYPE "AccountType" USING type::text::"AccountType";
    `);
        console.log('Accounts table type column updated');
    }
    catch (e) {
        console.log('Note:', e.message);
    }
}
fixDatabase()
    .catch(console.error)
    .finally(() => prisma_1.prisma.$disconnect());
//# sourceMappingURL=fix-db.js.map