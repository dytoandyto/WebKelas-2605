import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  const rawExisting = existing as unknown as Record<string, unknown> | undefined;

  // If an existing cached instance in globalThis is missing newly added models like homepageConfiguration, invalidate it!
  if (rawExisting && !rawExisting.homepageConfiguration) {
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

// Proxy guarantees that any access to prisma dynamically accesses the latest client instance
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
