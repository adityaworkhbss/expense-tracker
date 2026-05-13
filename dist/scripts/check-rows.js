"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function checkRows() {
    const res = await prisma_1.prisma.$queryRawUnsafe(`SELECT * FROM accounts LIMIT 1`);
    const rows = res;
    if (rows.length > 0) {
        console.log(Object.keys(rows[0]));
    }
}
checkRows()
    .catch(console.error)
    .finally(() => prisma_1.prisma.$disconnect());
//# sourceMappingURL=check-rows.js.map