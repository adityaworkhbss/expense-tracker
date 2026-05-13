"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function setPayLater() {
    await prisma_1.prisma.account.updateMany({
        where: { name: { contains: 'Credit' } },
        data: { type: 'PAY_LATER' }
    });
    console.log('Updated Credit Card to PAY_LATER');
    const accs = await prisma_1.prisma.account.findMany();
    console.log(accs.map(a => `${a.name}: ${a.type}`));
}
setPayLater()
    .catch(console.error)
    .finally(() => prisma_1.prisma.$disconnect());
//# sourceMappingURL=set-paylater.js.map