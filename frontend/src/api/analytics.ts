import axios from 'axios';

export interface SalaryByCountryRow {
  country: string;
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
