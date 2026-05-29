import axios from 'axios';

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

export interface DepartmentSummaryRow {
  department: string;
  count: number;
  min: number;
  max: number;
  avg: number;
  median: number;
}

export const fetchSalaryByCountry = async (): Promise<SalaryByCountryRow[]> => {
  const { data } = await axios.get<SalaryByCountryRow[]>(
    '/api/analytics/salary-by-country',
  );
  return data;
};

export const fetchSalaryByJobTitle = async (
  country?: string,
): Promise<SalaryByJobTitleRow[]> => {
  const { data } = await axios.get<SalaryByJobTitleRow[]>(
    '/api/analytics/salary-by-job-title',
    { params: country ? { country } : undefined },
  );
  return data;
};

export const fetchDepartmentSummary = async (): Promise<DepartmentSummaryRow[]> => {
  const { data } = await axios.get<DepartmentSummaryRow[]>(
    '/api/analytics/department-summary',
  );
  return data;
};
