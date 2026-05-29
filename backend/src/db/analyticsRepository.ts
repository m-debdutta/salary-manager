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

export interface OverviewStats {
  totalEmployees: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  countriesCount: number;
  departmentsCount: number;
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

interface RawOverview {
  totalEmployees: bigint;
  avgSalary: number | null;
  medianSalary: number | null;
  minSalary: number | null;
  maxSalary: number | null;
  countriesCount: bigint;
  departmentsCount: bigint;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Compute median + aggregate stats for a group field using a single raw SQL query.
 * PostgreSQL window functions (ROW_NUMBER / COUNT OVER) are used for efficient computation.
 *
 * `field` is an internal enum — never user-supplied. Interpolating it into
 * $queryRawUnsafe is safe because the TypeScript union prevents arbitrary strings.
 * `whereClause` must only ever be a hardcoded string literal (e.g. 'WHERE department IS NOT NULL').
 * User-supplied filter values must NOT be passed through this function — use the
 * dedicated parameterized helpers below instead.
 */
async function queryGroupStats(
  field: 'country' | 'job_title' | 'department',
  whereClause: '' | 'WHERE department IS NOT NULL' = ''
): Promise<RawGroupStats[]> {
  // language=PostgreSQL
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

/**
 * Variant of queryGroupStats that filters by country using a parameterized query.
 * The country value comes from user input and MUST be passed as a $queryRaw parameter,
 * never interpolated into the SQL string.
 */
async function queryJobStatsByCountry(country: string): Promise<RawGroupStats[]> {
  // language=PostgreSQL
  // $queryRaw uses tagged template literals — Prisma serializes ${country} as a
  // bind parameter ($1), so no user data ever reaches the SQL string itself.
  return prisma.$queryRaw<RawGroupStats[]>`
    WITH ranked AS (
      SELECT
        job_title                                                    AS group_key,
        salary,
        ROW_NUMBER() OVER (PARTITION BY job_title ORDER BY salary)   AS rn,
        COUNT(*)    OVER (PARTITION BY job_title)                    AS cnt
      FROM employees
      WHERE country = ${country}
    ),
    medians AS (
      SELECT group_key, AVG(salary) AS median
      FROM ranked
      WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2)
      GROUP BY group_key
    ),
    aggs AS (
      SELECT
        job_title     AS group_key,
        COUNT(*)      AS count,
        MIN(salary)   AS min,
        MAX(salary)   AS max,
        AVG(salary)   AS avg
      FROM employees
      WHERE country = ${country}
      GROUP BY job_title
    )
    SELECT a.group_key, a.count, a.min, a.max, a.avg, m.median
    FROM   aggs a
    JOIN   medians m ON a.group_key = m.group_key
    ORDER  BY a.avg DESC
  `;
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
  const rows = country ? await queryJobStatsByCountry(country) : await queryGroupStats('job_title');
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

/**
 * GET /api/analytics/overview
 * Returns a single object with high-level salary statistics.
 */
export const getOverview = async (): Promise<OverviewStats> => {
  const total = await prisma.employee.count();

  if (total === 0) {
    return {
      totalEmployees: 0,
      avgSalary: 0,
      medianSalary: 0,
      minSalary: 0,
      maxSalary: 0,
      countriesCount: 0,
      departmentsCount: 0,
    };
  }

  const rows = await prisma.$queryRaw<RawOverview[]>`
    WITH ranked AS (
      SELECT
        salary,
        ROW_NUMBER() OVER (ORDER BY salary) AS rn,
        COUNT(*)    OVER ()                 AS cnt
      FROM employees
    ),
    median AS (
      SELECT AVG(salary) AS value
      FROM ranked
      WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2)
    ),
    stats AS (
      SELECT
        COUNT(*)                   AS "totalEmployees",
        AVG(salary)                AS "avgSalary",
        MIN(salary)                AS "minSalary",
        MAX(salary)                AS "maxSalary",
        COUNT(DISTINCT country)    AS "countriesCount",
        COUNT(DISTINCT department) AS "departmentsCount"
      FROM employees
    )
    SELECT s.*, m.value AS "medianSalary"
    FROM   stats s, median m
  `;

  const r = rows[0];
  return {
    totalEmployees: Number(r.totalEmployees),
    avgSalary: r.avgSalary ?? 0,
    medianSalary: r.medianSalary ?? 0,
    minSalary: r.minSalary ?? 0,
    maxSalary: r.maxSalary ?? 0,
    countriesCount: Number(r.countriesCount),
    departmentsCount: Number(r.departmentsCount),
  };
};
