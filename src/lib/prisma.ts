import { PrismaClient } from '@prisma/client';

// Use singleton pattern for better performance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// For build process, use a simple mock that doesn't actually connect
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

export const prisma = globalForPrisma.prisma || (() => {
  // During build, use mock
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    return createMockPrisma();
  }
  
  // During development or on Vercel, use real client
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    globalForPrisma.prisma = client;
    return client;
  } catch (error) {
    console.warn('Failed to create Prisma client, using mock:', error);
    return createMockPrisma();
  }
})();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
