// Simple database connection test
const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test user creation
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$12$test.hash.here', // Dummy hash
        emailVerified: true,
        emailVerifiedAt: new Date(),
        accountType: 'REAL',
      },
    });
    
    console.log('✅ User created:', testUser.email);
    
    // Test user login
    const foundUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    
    console.log('✅ User found:', foundUser ? foundUser.email : 'Not found');
    
    // Clean up
    await prisma.user.delete({
      where: { email: 'test@example.com' },
    });
    
    console.log('✅ Test user cleaned up');
    console.log('🎉 Database is working perfectly!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();