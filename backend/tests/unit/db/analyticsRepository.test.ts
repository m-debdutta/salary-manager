import { describe, it, expect, afterEach } from 'vitest';
import { prisma } from '../../../src/db/client';
import {
  getSalaryByCountry,
  getSalaryByJobTitle,
  getSalaryDistribution,
} from '../../../src/db/analyticsRepository';

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
 * By job title:
 *   Engineer: count=3, min=80k, max=120k, avg=100k, median=100k
 *   Manager:  count=1, min=90k, max=90k,  avg=90k,  median=90k
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

  // ─── getSalaryByJobTitle ─────────────────────────────────────────────────

  describe('getSalaryByJobTitle', () => {
    it('should return one row per job title with correct shape', async () => {
      const result = await getSalaryByJobTitle();

      expect(result).toHaveLength(2);
      const titles = result.map((r) => r.jobTitle).sort();
      expect(titles).toEqual(['Engineer', 'Manager']);
    });

    it('should return correct aggregates for Engineer', async () => {
      const result = await getSalaryByJobTitle();
      const eng = result.find((r) => r.jobTitle === 'Engineer')!;

      expect(eng.count).toBe(3);
      expect(eng.min).toBe(80_000);
      expect(eng.max).toBe(120_000);
      expect(eng.avg).toBeCloseTo(100_000, 0);
      // sorted: 80k, 100k, 120k → median = 100k (middle element)
      expect(eng.median).toBeCloseTo(100_000, 0);
    });

    it('should return correct aggregates for Manager (single employee)', async () => {
      const result = await getSalaryByJobTitle();
      const mgr = result.find((r) => r.jobTitle === 'Manager')!;

      expect(mgr.count).toBe(1);
      expect(mgr.min).toBe(90_000);
      expect(mgr.max).toBe(90_000);
      expect(mgr.avg).toBeCloseTo(90_000, 0);
      expect(mgr.median).toBeCloseTo(90_000, 0);
    });

    it('should filter by country when provided', async () => {
      const result = await getSalaryByJobTitle('USA');

      // Only Alice & Bob are in USA, both Engineers
      expect(result).toHaveLength(1);
      expect(result[0].jobTitle).toBe('Engineer');
      expect(result[0].count).toBe(2);
    });

    it('should return empty array for unknown country', async () => {
      const result = await getSalaryByJobTitle('Narnia');

      expect(result).toEqual([]);
    });

    it('should return empty array when no employees exist', async () => {
      await prisma.employee.deleteMany({});

      const result = await getSalaryByJobTitle();

      expect(result).toEqual([]);
    });
  });

  // ─── getSalaryDistribution ───────────────────────────────────────────────

  describe('getSalaryDistribution', () => {
    it('should return distribution rows for occupied ranges', async () => {
      const result = await getSalaryDistribution();

      // All 4 employees fall in $60k-$90k, $90k-$120k, or $120k-$150k
      expect(result.length).toBeGreaterThan(0);
      const ranges = result.map((r) => r.range);
      // 80k → "$60k - $90k", 90k+100k → "$90k - $120k", 120k → "$120k - $150k"
      expect(ranges).toContain('$60k - $90k');
      expect(ranges).toContain('$90k - $120k');
      expect(ranges).toContain('$120k - $150k');
    });

    it('should have correct counts per bucket', async () => {
      const result = await getSalaryDistribution();
      const byRange = Object.fromEntries(result.map((r) => [r.range, r.count]));

      expect(byRange['$60k - $90k']).toBe(1); // Dave 80k
      expect(byRange['$90k - $120k']).toBe(2); // Carol 90k, Alice 100k
      expect(byRange['$120k - $150k']).toBe(1); // Bob 120k
    });

    it('should return each row with range, min, max, count fields', async () => {
      const result = await getSalaryDistribution();

      for (const row of result) {
        expect(row).toHaveProperty('range');
        expect(row).toHaveProperty('min');
        expect(row).toHaveProperty('max');
        expect(row).toHaveProperty('count');
        expect(typeof row.count).toBe('number');
      }
    });

    it('should return empty array when no employees exist', async () => {
      await prisma.employee.deleteMany({});

      const result = await getSalaryDistribution();

      expect(result).toEqual([]);
    });
  });
});
