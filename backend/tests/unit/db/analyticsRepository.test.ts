import { describe, it, expect, afterEach } from 'vitest';
import { prisma } from '../../../src/db/client';
import { getSalaryByCountry } from '../../../src/db/analyticsRepository';

/**
 * Predictable test dataset:
 *
 * Alice  - Engineer  - USA  - Engineering - 100_000
 * Bob    - Engineer  - USA  - Engineering - 120_000
 * Carol  - Manager   - UK   - HR          -  90_000
 * Dave   - Engineer  - UK   - Engineering -  80_000
 *
 * By country:
 *   USA: count=2, min=100k, max=120k, avg=110k, median=110k
 *   UK:  count=2, min=80k,  max=90k,  avg=85k,  median=85k
 *
 */

const seed = async () => {
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

describe('AnalyticsRepository', () => {
  beforeEach(async () => {
    await prisma.employee.deleteMany({});
    await seed();
  });

  afterEach(async () => {
    await prisma.employee.deleteMany({});
  });

  // ─── getSalaryByCountry ──────────────────────────────────────────────────

  describe('getSalaryByCountry', () => {
    it('should return one row per country with correct shape', async () => {
      const result = await getSalaryByCountry();

      expect(result).toHaveLength(2);
      const countries = result.map((r) => r.country).sort();
      expect(countries).toEqual(['UK', 'USA']);
    });

    it('should return correct aggregates for USA', async () => {
      const result = await getSalaryByCountry();
      const usa = result.find((r) => r.country === 'USA')!;

      expect(usa.count).toBe(2);
      expect(usa.min).toBe(100_000);
      expect(usa.max).toBe(120_000);
      expect(usa.avg).toBeCloseTo(110_000, 0);
      expect(usa.median).toBeCloseTo(110_000, 0);
    });

    it('should return correct aggregates for UK', async () => {
      const result = await getSalaryByCountry();
      const uk = result.find((r: { country: string }) => r.country === 'UK')!;

      expect(uk.count).toBe(2);
      expect(uk.min).toBe(80_000);
      expect(uk.max).toBe(90_000);
      expect(uk.avg).toBeCloseTo(85_000, 0);
      expect(uk.median).toBeCloseTo(85_000, 0);
    });

    it('should return empty array when no employees exist', async () => {
      await prisma.employee.deleteMany({});

      const result = await getSalaryByCountry();

      expect(result).toEqual([]);
    });
  });
});
