import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { tmpdir } from 'os';

// Declared individually so each vi.fn() reference stays stable across vi.resetModules() cycles.
// Using mockReturnValue (not an arrow-function impl) to avoid "not a constructor" when
// PrismaClient is invoked with `new`.
const mockAppendFileSync = vi.hoisted(() => vi.fn());
const mockOn = vi.hoisted(() => vi.fn());
const mockDisconnect = vi.hoisted(() => vi.fn());
const MockPrismaClient = vi.hoisted(() => vi.fn());

vi.mock('fs', () => ({ appendFileSync: mockAppendFileSync }));
vi.mock('@prisma/client', () => ({ PrismaClient: MockPrismaClient }));

describe('db/client', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
    mockAppendFileSync.mockClear();
    mockOn.mockClear();
    mockDisconnect.mockClear();
    MockPrismaClient.mockClear();
    // Vitest v4 requires `class` syntax for mocks used with `new`
    MockPrismaClient.mockImplementation(
      class {
        $on = mockOn;
        $disconnect = mockDisconnect;
      } as any
    );
    delete (globalThis as any).prismaGlobal;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('exports PRISMA_LOG_FILE pointing to os.tmpdir()', async () => {
    const { PRISMA_LOG_FILE } = await import('../../../src/db/client');
    expect(PRISMA_LOG_FILE).toBe(join(tmpdir(), 'prisma-queries.log'));
  });

  describe('development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('registers query and warn event listeners', async () => {
      await import('../../../src/db/client');
      expect(mockOn).toHaveBeenCalledWith('query', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('warn', expect.any(Function));
    });

    it('query listener appends a formatted line to the log file', async () => {
      const { PRISMA_LOG_FILE } = await import('../../../src/db/client');
      const [, handler] = mockOn.mock.calls.find(([event]) => event === 'query')!;
      const ts = new Date('2024-06-01T10:00:00.000Z');

      handler({ timestamp: ts, duration: 12, query: 'SELECT * FROM "Employee"', params: '[]' });

      expect(mockAppendFileSync).toHaveBeenCalledWith(
        PRISMA_LOG_FILE,
        '[2024-06-01T10:00:00.000Z] 12ms | SELECT * FROM "Employee" | params: []\n'
      );
    });

    it('warn listener appends a formatted line to the log file', async () => {
      const { PRISMA_LOG_FILE } = await import('../../../src/db/client');
      const [, handler] = mockOn.mock.calls.find(([event]) => event === 'warn')!;
      const ts = new Date('2024-06-01T10:00:00.000Z');

      handler({ timestamp: ts, message: 'Deprecated feature used' });

      expect(mockAppendFileSync).toHaveBeenCalledWith(
        PRISMA_LOG_FILE,
        '[2024-06-01T10:00:00.000Z] WARN | Deprecated feature used\n'
      );
    });

    it('stores the prisma instance on globalThis', async () => {
      const { prisma } = await import('../../../src/db/client');
      expect((globalThis as any).prismaGlobal).toBe(prisma);
    });

    it('reuses the cached globalThis instance on subsequent imports', async () => {
      const { prisma: first } = await import('../../../src/db/client');
      const { prisma: second } = await import('../../../src/db/client');
      expect(first).toBe(second);
      expect(MockPrismaClient).toHaveBeenCalledOnce();
    });
  });

  describe('production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('does not register event listeners', async () => {
      await import('../../../src/db/client');
      expect(mockOn).not.toHaveBeenCalled();
    });

    it('does not write anything to the log file', async () => {
      await import('../../../src/db/client');
      expect(mockAppendFileSync).not.toHaveBeenCalled();
    });

    it('does not set globalThis.prismaGlobal', async () => {
      await import('../../../src/db/client');
      expect((globalThis as any).prismaGlobal).toBeUndefined();
    });
  });

  describe('disconnectDatabase', () => {
    it('calls $disconnect on the prisma instance', async () => {
      process.env.NODE_ENV = 'production';
      const { disconnectDatabase } = await import('../../../src/db/client');
      await disconnectDatabase();
      expect(mockDisconnect).toHaveBeenCalledOnce();
    });
  });
});
