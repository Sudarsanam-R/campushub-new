import { PrismaClient, type UserRole } from '@prisma/client';

// Extend NodeJS global to include prisma
declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a new PrismaClient instance
const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Export the PrismaClient instance
export const prisma = global.prisma || prismaClient;

// In development, set the global prisma instance to avoid multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Handle process termination to properly disconnect Prisma
const shutdown = async () => {
  if (process.env.NODE_ENV !== 'test') {
    await prisma.$disconnect();
  }
};

process.on('beforeExit', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Re-export Prisma types
export type { UserRole };

export default prisma;
