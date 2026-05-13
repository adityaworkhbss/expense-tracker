"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function run() {
    const accs = await prisma_1.prisma.account.findMany();
    console.log(JSON.stringify(accs, null, 2));
}
run()
    .catch(console.error)
    .finally(() => prisma_1.prisma.$disconnect());
//# sourceMappingURL=check-accounts.js.map