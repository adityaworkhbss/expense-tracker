"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function verify() {
    try {
        await prisma_1.prisma.user.findFirst();
        console.log('✅ Connected');
    }
    catch (error) {
        console.error('Failed to connect to Prisma Postgres:', error);
        process.exit(1);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
verify();
//# sourceMappingURL=verify-prisma.js.map