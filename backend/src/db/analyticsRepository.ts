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

export interface SalaryDistributionRow {
  range: string;
  min: number;
  max: number;
  count: number;
}

export interface DepartmentSummaryRow {
  department: string;
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

interface RawDistribution {
  salary_range: string;
  range_min: bigint;
  range_max: bigint;
  count: bigint;
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

/**
 * GET /api/analytics/salary-distribution
 * Returns employee counts bucketed into salary ranges.
 */
export const getSalaryDistribution = async (): Promise<SalaryDistributionRow[]> => {
  const rows = await prisma.$queryRaw<RawDistribution[]>`
    SELECT
      CASE
        WHEN salary <  30000  THEN 'Under $30k'
        WHEN salary <  60000  THEN '$30k - $60k'
        WHEN salary <  90000  THEN '$60k - $90k'
        WHEN salary < 120000  THEN '$90k - $120k'
        WHEN salary < 150000  THEN '$120k - $150k'
        ELSE                       'Over $150k'
      END                    AS salary_range,
      CASE
        WHEN salary <  30000  THEN 0
        WHEN salary <  60000  THEN 30000
        WHEN salary <  90000  THEN 60000
        WHEN salary < 120000  THEN 90000
        WHEN salary < 150000  THEN 120000
        ELSE                       150000
      END                    AS range_min,
      CASE
        WHEN salary <  30000  THEN 29999
        WHEN salary <  60000  THEN 59999
        WHEN salary <  90000  THEN 89999
        WHEN salary < 120000  THEN 119999
        WHEN salary < 150000  THEN 149999
        ELSE                       2147483647
      END                    AS range_max,
      COUNT(*)               AS count
    FROM employees
    GROUP BY 1, 2, 3
    ORDER BY 2
  `;

  return rows.map((r) => ({
    range: r.salary_range,
    min: Number(r.range_min),
    max: Number(r.range_max),
    count: Number(r.count),
  }));
};

/**
 * GET /api/analytics/department-summary
 * Returns salary stats per department (employees without department are excluded).
 */
export const getDepartmentSummary = async (): Promise<DepartmentSummaryRow[]> => {
  const rows = await queryGroupStats('department', 'WHERE department IS NOT NULL');
  return rows.map((r) => ({
    department: r.group_key,
    count: Number(r.count),
    min: r.min,
    max: r.max,
    avg: r.avg,
    median: r.median,
  }));
};
