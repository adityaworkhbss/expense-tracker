import { prisma } from '../lib/prisma';

async function verify() {
  try {
    // Attempt a basic read query
    await prisma.user.findFirst();
    console.log('✅ Connected');
  } catch (error) {
    console.error('Failed to connect to Prisma Postgres:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
