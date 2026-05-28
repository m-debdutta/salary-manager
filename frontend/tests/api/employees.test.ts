import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchEmployees } from '../../src/api/employees';
import type { EmployeesResponse } from '../../src/api/employees';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const MOCK_RESPONSE: EmployeesResponse = {
  employees: [
    {
      id: 1,
      firstName: 'Alice',
      lastName: 'Johnson',
      jobTitle: 'Software Engineer',
      country: 'USA',
      salary: 120000,
      department: 'Engineering',
      hireDate: '2021-03-15',
      employmentType: 'full-time',
    },
  ],
  total: 1,
  page: 1,
  pageSize: 50,
};

describe('fetchEmployees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /api/employees', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_RESPONSE });

    await fetchEmployees();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/employees',
      expect.objectContaining({ params: expect.any(Object) }),
    );
  });

  it('uses default page=1 and pageSize=50 when called with no arguments', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_RESPONSE });

    await fetchEmployees();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/employees', {
      params: { page: 1, pageSize: 50 },
    });
  });

  it('forwards custom page and pageSize params', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_RESPONSE });

    await fetchEmployees(3, 10);

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/employees', {
      params: { page: 3, pageSize: 10 },
    });
  });

  it('returns the response data', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_RESPONSE });

    const result = await fetchEmployees();

    expect(result).toEqual(MOCK_RESPONSE);
  });

  it('propagates errors thrown by axios', async () => {
    const networkError = new Error('Network Error');
    mockedAxios.get.mockRejectedValueOnce(networkError);

    await expect(fetchEmployees()).rejects.toThrow('Network Error');
  });
});
