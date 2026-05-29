import { PrismaClient } from '@prisma/client';
import { appendFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export const PRISMA_LOG_FILE = join(tmpdir(), 'prisma-queries.log');

const prismaClientSingleton = () => {
  const isDev = process.env.NODE_ENV === 'development';

  const client = new PrismaClient({
    log: isDev
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'warn' },
          { emit: 'stdout', level: 'error' },
        ]
      : [{ emit: 'stdout', level: 'error' }],
  });

  if (isDev) {
    client.$on('query', (e) => {
      const line = `[${e.timestamp.toISOString()}] ${e.duration}ms | ${e.query} | params: ${e.params}\n`;
      appendFileSync(PRISMA_LOG_FILE, line);
    });

    client.$on('warn', (e) => {
      const line = `[${e.timestamp.toISOString()}] WARN | ${e.message}\n`;
      appendFileSync(PRISMA_LOG_FILE, line);
    });
  }

  return client;
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prisma.$disconnect();
}
