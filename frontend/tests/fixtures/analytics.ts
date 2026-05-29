import type {
  SalaryByCountryRow,
  SalaryByJobTitleRow,
  SalaryDistributionRow,
  DepartmentSummaryRow,
  OverviewStats,
} from '../../src/api/analytics';

export const MOCK_COUNTRY_DATA: SalaryByCountryRow[] = [
  { country: 'USA', count: 10, min: 80000, max: 150000, avg: 120000, median: 115000 },
  { country: 'UK', count: 5, min: 70000, max: 130000, avg: 100000, median: 95000 },
];

export const MOCK_JOB_TITLE_DATA: SalaryByJobTitleRow[] = [
  {
    jobTitle: 'Software Engineer',
    count: 8,
    min: 90000,
    max: 160000,
    avg: 125000,
    median: 120000,
  },
  {
    jobTitle: 'Product Manager',
    count: 4,
    min: 100000,
    max: 150000,
    avg: 130000,
    median: 128000,
  },
];

export const MOCK_DISTRIBUTION_DATA: SalaryDistributionRow[] = [
  { range: '$50k–$75k', min: 50000, max: 75000, count: 5 },
  { range: '$75k–$100k', min: 75000, max: 100000, count: 12 },
];

export const MOCK_DEPARTMENT_DATA: DepartmentSummaryRow[] = [
  {
    department: 'Engineering',
    count: 20,
    min: 85000,
    max: 160000,
    avg: 130000,
    median: 125000,
  },
  {
    department: 'Design',
    count: 8,
    min: 70000,
    max: 120000,
    avg: 95000,
    median: 92000,
  },
];

export const MOCK_OVERVIEW_DATA: OverviewStats = {
  totalEmployees: 28,
  avgSalary: 120000,
  medianSalary: 115000,
  minSalary: 70000,
  maxSalary: 160000,
  countriesCount: 2,
  departmentsCount: 2,
};
