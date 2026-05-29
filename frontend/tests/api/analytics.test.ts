import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchSalaryByCountry,
  fetchSalaryByJobTitle,
} from '../../src/api/analytics';
import type {
  SalaryByCountryRow,
  SalaryByJobTitleRow,
} from '../../src/api/analytics';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const MOCK_COUNTRY_DATA: SalaryByCountryRow[] = [
  { country: 'USA', count: 10, min: 80000, max: 150000, avg: 120000, median: 115000 },
  { country: 'UK', count: 5, min: 70000, max: 130000, avg: 100000, median: 95000 },
];

const MOCK_JOB_TITLE_DATA: SalaryByJobTitleRow[] = [
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

describe('fetchSalaryByCountry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /api/analytics/salary-by-country', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_COUNTRY_DATA });

    await fetchSalaryByCountry();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/analytics/salary-by-country');
  });

  it('returns the response data', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_COUNTRY_DATA });

    const result = await fetchSalaryByCountry();

    expect(result).toEqual(MOCK_COUNTRY_DATA);
  });

  it('propagates errors thrown by axios', async () => {
    const networkError = new Error('Network Error');
    mockedAxios.get.mockRejectedValueOnce(networkError);

    await expect(fetchSalaryByCountry()).rejects.toThrow('Network Error');
  });
});

describe('fetchSalaryByJobTitle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /api/analytics/salary-by-job-title without params when no country given', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JOB_TITLE_DATA });

    await fetchSalaryByJobTitle();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/analytics/salary-by-job-title', {
      params: undefined,
    });
  });

  it('passes the country query param when provided', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JOB_TITLE_DATA });

    await fetchSalaryByJobTitle('USA');

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/analytics/salary-by-job-title', {
      params: { country: 'USA' },
    });
  });

  it('returns the response data', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JOB_TITLE_DATA });

    const result = await fetchSalaryByJobTitle();

    expect(result).toEqual(MOCK_JOB_TITLE_DATA);
  });

  it('propagates errors thrown by axios', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(fetchSalaryByJobTitle()).rejects.toThrow('Network Error');
  });
});

