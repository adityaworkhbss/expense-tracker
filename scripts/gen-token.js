const { prisma } = require('../lib/prisma');
const jwt = require('jsonwebtoken');

async function generateToken() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@expense-tracker.com' }
  });
  
  if (!user) {
    console.error('User not found');
    return;
  }
  
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    { expiresIn: '7d' }
  );
  
  console.log('--- TOKEN START ---');
  console.log(token);
  console.log('--- TOKEN END ---');
}

generateToken().catch(console.error).finally(() => prisma.$disconnect());
