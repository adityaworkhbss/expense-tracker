"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function addColumn() {
    console.log('Ensuring type column exists...');
    try {
        await prisma_1.prisma.$executeRawUnsafe(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS type text`);
        console.log('Added type column as text');
        await prisma_1.prisma.$executeRawUnsafe(`UPDATE accounts SET type = 'PAY_NOW' WHERE type IS NULL`);
        console.log('Initialized null types to PAY_NOW');
        await prisma_1.prisma.$executeRawUnsafe(`ALTER TABLE accounts ALTER COLUMN type TYPE "AccountType" USING type::"AccountType"`);
        console.log('Converted type column to AccountType enum');
    }
    catch (e) {
        console.error('Error adding column:', e.message);
    }
}
addColumn()
    .catch(console.error)
    .finally(() => prisma_1.prisma.$disconnect());
//# sourceMappingURL=add-column.js.map