import { prisma } from './client.js';

/**
 * Analytics Repository
 * Data access layer for salary analytics - all queries return plain numbers (no BigInt).
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SalaryByCountryRow {
  country: string;
  count: number;
  min: number;
  max: number;
  avg: number;
  median: number;
}

export interface SalaryByJobTitleRow {
  jobTitle: string;
  count: number;
  min: number;
  max: number;
  avg: number;
  median: number;
}

// ─── Raw query result types ──────────────────────────────────────────────────

interface RawGroupStats {
  group_key: string;
  count: bigint;
  min: number;
  max: number;
  avg: number;
  median: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Compute median + aggregate stats for a group field using a single raw SQL query.
 * SQLite window functions (ROW_NUMBER / COUNT OVER) are supported since 3.25.
 */
async function queryGroupStats(
  field: 'country' | 'job_title' | 'department',
  whereClause: string = ''
): Promise<RawGroupStats[]> {
  // language=SQLite
  const rows = await prisma.$queryRawUnsafe<RawGroupStats[]>(`
    WITH ranked AS (
      SELECT
        ${field}                                                AS group_key,
        salary,
        ROW_NUMBER() OVER (PARTITION BY ${field} ORDER BY salary) AS rn,
        COUNT(*)    OVER (PARTITION BY ${field})                  AS cnt
      FROM employees
      ${whereClause}
    ),
    medians AS (
      SELECT group_key, AVG(salary) AS median
      FROM ranked
      WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2)
      GROUP BY group_key
    ),
    aggs AS (
      SELECT
        ${field}      AS group_key,
        COUNT(*)      AS count,
        MIN(salary)   AS min,
        MAX(salary)   AS max,
        AVG(salary)   AS avg
      FROM employees
      ${whereClause}
      GROUP BY ${field}
    )
    SELECT a.group_key, a.count, a.min, a.max, a.avg, m.median
    FROM   aggs a
    JOIN   medians m ON a.group_key = m.group_key
    ORDER  BY a.avg DESC
  `);
  return rows;
}

// ─── Public functions ────────────────────────────────────────────────────────

/**
 * GET /api/analytics/salary-by-country
 * Returns min / max / avg / median salary and employee count per country.
 */
export const getSalaryByCountry = async (): Promise<SalaryByCountryRow[]> => {
  const rows = await queryGroupStats('country');
  return rows.map((r) => ({
    country: r.group_key,
    count: Number(r.count),
    min: r.min,
    max: r.max,
    avg: r.avg,
    median: r.median,
  }));
};

/**
 * GET /api/analytics/salary-by-job-title
 * Returns salary stats per job title, optionally filtered by country.
 */
export const getSalaryByJobTitle = async (country?: string): Promise<SalaryByJobTitleRow[]> => {
  const where = country ? `WHERE country = '${country.replace(/'/g, "''")}'` : '';
  const rows = await queryGroupStats('job_title', where);
  return rows.map((r) => ({
    jobTitle: r.group_key,
    count: Number(r.count),
    min: r.min,
    max: r.max,
    avg: r.avg,
    median: r.median,
  }));
};
