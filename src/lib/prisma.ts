import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

// Use singleton pattern for better performance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  try {
    // Try to use Turso if connection URL is available
    if (process.env.TURSO_CONNECTION_URL && process.env.TURSO_AUTH_TOKEN) {
      console.log('Connecting to Turso database...');
      const libsql = createClient({
        url: process.env.TURSO_CONNECTION_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      
      const adapter = new PrismaLibSQL(libsql);
      
      return new PrismaClient({ 
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    } else {
      // Fallback to regular SQLite for development
      console.log('Using local SQLite database...');
      return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    throw error;
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
