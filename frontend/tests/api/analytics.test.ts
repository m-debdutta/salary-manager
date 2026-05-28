import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSalaryByCountry } from '../../src/api/analytics';
import type { SalaryByCountryRow } from '../../src/api/analytics';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const MOCK_DATA: SalaryByCountryRow[] = [
  { country: 'USA', count: 10, min: 80000, max: 150000, avg: 120000, median: 115000 },
  { country: 'UK', count: 5, min: 70000, max: 130000, avg: 100000, median: 95000 },
];

describe('fetchSalaryByCountry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /api/analytics/salary-by-country', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_DATA });

    await fetchSalaryByCountry();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/analytics/salary-by-country');
  });

  it('returns the response data', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_DATA });

    const result = await fetchSalaryByCountry();

    expect(result).toEqual(MOCK_DATA);
  });

  it('propagates errors thrown by axios', async () => {
    const networkError = new Error('Network Error');
    mockedAxios.get.mockRejectedValueOnce(networkError);

    await expect(fetchSalaryByCountry()).rejects.toThrow('Network Error');
  });
});
