import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchSalaryByCountry,
  fetchSalaryByJobTitle,
  fetchSalaryDistribution,
  fetchDepartmentSummary,
  fetchOverview,
} from '../../src/api/analytics';
import {
  MOCK_COUNTRY_DATA,
  MOCK_JOB_TITLE_DATA,
  MOCK_DISTRIBUTION_DATA,
  MOCK_DEPARTMENT_DATA,
  MOCK_OVERVIEW_DATA,
} from '../fixtures/analytics';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

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

describe('fetchSalaryDistribution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /api/analytics/salary-distribution', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_DISTRIBUTION_DATA });

    await fetchSalaryDistribution();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/analytics/salary-distribution');
  });

  it('returns the response data', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_DISTRIBUTION_DATA });

    const result = await fetchSalaryDistribution();

    expect(result).toEqual(MOCK_DISTRIBUTION_DATA);
  });

  it('propagates errors thrown by axios', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(fetchSalaryDistribution()).rejects.toThrow('Network Error');
  });
});

describe('fetchDepartmentSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /api/analytics/department-summary', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_DEPARTMENT_DATA });

    await fetchDepartmentSummary();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/analytics/department-summary');
  });

  it('returns the response data', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_DEPARTMENT_DATA });

    const result = await fetchDepartmentSummary();

    expect(result).toEqual(MOCK_DEPARTMENT_DATA);
  });

  it('propagates errors thrown by axios', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(fetchDepartmentSummary()).rejects.toThrow('Network Error');
  });
});

describe('fetchOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /api/analytics/overview', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_OVERVIEW_DATA });

    await fetchOverview();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/analytics/overview');
  });

  it('returns the response data', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_OVERVIEW_DATA });

    const result = await fetchOverview();

    expect(result).toEqual(MOCK_OVERVIEW_DATA);
  });

  it('propagates errors thrown by axios', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(fetchOverview()).rejects.toThrow('Network Error');
  });
});
