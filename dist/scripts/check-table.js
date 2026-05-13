"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function checkTable() {
    const res = await prisma_1.prisma.$queryRawUnsafe(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'accounts'`);
    console.log(res);
}
checkTable()
    .catch(console.error)
    .finally(() => prisma_1.prisma.$disconnect());
//# sourceMappingURL=check-table.js.map