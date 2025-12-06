import { PrismaClient } from '@prisma/client';

// Use singleton pattern for better performance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a mock for build time
const createMockPrisma = () => {
  const mockMethods = {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
    groupBy: () => Promise.resolve([]),
    aggregate: () => Promise.resolve({}),
    upsert: () => Promise.resolve({}),
    createMany: () => Promise.resolve({ count: 0 }),
    updateMany: () => Promise.resolve({ count: 0 }),
    deleteMany: () => Promise.resolve({ count: 0 }),
  };

  return {
    user: mockMethods,
    emailVerificationToken: mockMethods,
    session: mockMethods,
    wallet: mockMethods,
    deposit: mockMethods,
    transaction: mockMethods,
    balance: mockMethods,
    profitRecord: mockMethods,
    profitSettings: mockMethods,
    simulationAdjustment: mockMethods,
    auditLog: mockMethods,
    priceCache: mockMethods,
    qRCode: mockMethods,
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
    $transaction: (fn: any) => fn(mockMethods),
  } as any;
};

function createPrismaClient() {
  // During build, use mock
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    console.log('Using mock Prisma client for build...');
    return createMockPrisma();
  }
  
  try {
    console.log('Creating real Prisma client...');
    
    // Use Prisma Accelerate URL if available
    const accelerateUrl = process.env.PRISMA_DATABASE_URL;
    
    if (accelerateUrl) {
      return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        accelerateUrl: accelerateUrl,
      });
    } else {
      // Fallback to direct connection
      return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
  } catch (error) {
    console.error('Failed to create Prisma client, using mock:', error);
    return createMockPrisma();
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
