import { PrismaClient } from '@prisma/client';

// Use singleton pattern for better performance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  try {
    // For now, use regular Prisma client to avoid build issues
    // TODO: Re-enable Turso adapter after fixing webpack configuration
    console.log('Creating Prisma client...');
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    throw error;
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
