import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { setupMiddleware } from '../../../src/middleware';
import analyticsRouter from '../../../src/routes/analytics';
import { prisma } from '../../../src/db/client';

const createTestApp = (): Express => {
  const app = express();
  setupMiddleware(app);
  app.use('/api/analytics', analyticsRouter);
  return app;
};

/**
 * Test dataset (same as repository unit tests for consistent assertions):
 *
 * Alice  - Engineer  - USA  - Engineering - 100_000
 * Bob    - Engineer  - USA  - Engineering - 120_000
 * Carol  - Manager   - UK   - HR          -  90_000
 * Dave   - Engineer  - UK   - Engineering -  80_000
 */
const seedEmployees = async () => {
  await prisma.employee.createMany({
    data: [
      {
        firstName: 'Alice',
        lastName: 'Smith',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 100_000,
        department: 'Engineering',
        hireDate: new Date('2024-01-01'),
        employmentType: 'Full-time',
      },
      {
        firstName: 'Bob',
        lastName: 'Jones',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 120_000,
        department: 'Engineering',
        hireDate: new Date('2024-01-01'),
        employmentType: 'Full-time',
      },
      {
        firstName: 'Carol',
        lastName: 'Brown',
        jobTitle: 'Manager',
        country: 'UK',
        salary: 90_000,
        department: 'HR',
        hireDate: new Date('2024-01-01'),
        employmentType: 'Full-time',
      },
      {
        firstName: 'Dave',
        lastName: 'Wilson',
        jobTitle: 'Engineer',
        country: 'UK',
        salary: 80_000,
        department: 'Engineering',
        hireDate: new Date('2024-01-01'),
        employmentType: 'Contract',
      },
    ],
  });
};

describe('Analytics API - Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    await prisma.employee.deleteMany({});
    await seedEmployees();
  });

  afterEach(async () => {
    await prisma.employee.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ─── GET /api/analytics/salary-by-country ─────────────────────────────────

  describe('GET /api/analytics/salary-by-country', () => {
    it('should return 200 with an array', async () => {
      const response = await request(app).get('/api/analytics/salary-by-country');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return one entry per country', async () => {
      const response = await request(app).get('/api/analytics/salary-by-country');

      expect(response.body).toHaveLength(2);
      const countries = response.body.map((r: { country: string }) => r.country).sort();
      expect(countries).toEqual(['UK', 'USA']);
    });

    it('should include required fields in each row', async () => {
      const response = await request(app).get('/api/analytics/salary-by-country');

      for (const row of response.body) {
        expect(row).toHaveProperty('country');
        expect(row).toHaveProperty('count');
        expect(row).toHaveProperty('min');
        expect(row).toHaveProperty('max');
        expect(row).toHaveProperty('avg');
        expect(row).toHaveProperty('median');
      }
    });

    it('should return correct stats for USA', async () => {
      const response = await request(app).get('/api/analytics/salary-by-country');
      const usa = response.body.find((r: { country: string }) => r.country === 'USA');

      expect(usa.count).toBe(2);
      expect(usa.min).toBe(100_000);
      expect(usa.max).toBe(120_000);
      expect(usa.avg).toBeCloseTo(110_000, 0);
      expect(usa.median).toBeCloseTo(110_000, 0);
    });

    it('should return 200 empty array when database is empty', async () => {
      await prisma.employee.deleteMany({});

      const response = await request(app).get('/api/analytics/salary-by-country');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  // ─── GET /api/analytics/salary-by-job-title ───────────────────────────────

  describe('GET /api/analytics/salary-by-job-title', () => {
    it('should return 200 with all job titles', async () => {
      const response = await request(app).get('/api/analytics/salary-by-job-title');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should include required fields in each row', async () => {
      const response = await request(app).get('/api/analytics/salary-by-job-title');

      for (const row of response.body) {
        expect(row).toHaveProperty('jobTitle');
        expect(row).toHaveProperty('count');
        expect(row).toHaveProperty('min');
        expect(row).toHaveProperty('max');
        expect(row).toHaveProperty('avg');
        expect(row).toHaveProperty('median');
      }
    });

    it('should filter by country when ?country= param is provided', async () => {
      const response = await request(app).get('/api/analytics/salary-by-job-title?country=USA');

      expect(response.status).toBe(200);
      // Only Engineer appears in USA
      expect(response.body).toHaveLength(1);
      expect(response.body[0].jobTitle).toBe('Engineer');
      expect(response.body[0].count).toBe(2);
    });

    it('should return 200 empty array for unknown country', async () => {
      const response = await request(app).get('/api/analytics/salary-by-job-title?country=Narnia');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return correct stats for Engineer across all countries', async () => {
      const response = await request(app).get('/api/analytics/salary-by-job-title');
      const eng = response.body.find((r: { jobTitle: string }) => r.jobTitle === 'Engineer');

      expect(eng.count).toBe(3);
      expect(eng.min).toBe(80_000);
      expect(eng.max).toBe(120_000);
      expect(eng.avg).toBeCloseTo(100_000, 0);
      expect(eng.median).toBeCloseTo(100_000, 0);
    });
  });
});
