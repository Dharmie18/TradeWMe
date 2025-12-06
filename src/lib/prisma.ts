import { PrismaClient } from '@prisma/client';

// Use singleton pattern for better performance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  try {
    console.log('Creating Prisma client...');
    
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    // Return a basic client that will work for build
    return new PrismaClient({
      log: ['error'],
    });
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
