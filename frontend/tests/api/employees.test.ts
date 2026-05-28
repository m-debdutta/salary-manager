import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchEmployees, createEmployee, updateEmployee } from '../../src/api/employees';
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

describe('createEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /api/employees', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: MOCK_RESPONSE.employees[0] });

    await createEmployee({
      firstName: 'Alice',
      lastName: 'Johnson',
      jobTitle: 'Software Engineer',
      country: 'USA',
      salary: 120000,
      hireDate: '2021-03-15',
      employmentType: 'full-time',
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/employees',
      expect.objectContaining({ firstName: 'Alice' }),
    );
  });
});

describe('updateEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls PUT /api/employees/:id with the correct URL', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: MOCK_RESPONSE.employees[0] });

    await updateEmployee(1, { salary: 130000 });

    expect(mockedAxios.put).toHaveBeenCalledWith(
      '/api/employees/1',
      expect.objectContaining({ salary: 130000 }),
    );
  });

  it('sends the full payload in the request body', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: MOCK_RESPONSE.employees[0] });
    const update = { firstName: 'Alicia', salary: 135000 };

    await updateEmployee(42, update);

    expect(mockedAxios.put).toHaveBeenCalledWith('/api/employees/42', update);
  });

  it('returns the updated employee from the response', async () => {
    const updated = { ...MOCK_RESPONSE.employees[0], salary: 150000 };
    mockedAxios.put.mockResolvedValueOnce({ data: updated });

    const result = await updateEmployee(1, { salary: 150000 });

    expect(result).toEqual(updated);
  });

  it('propagates errors thrown by axios', async () => {
    mockedAxios.put.mockRejectedValueOnce(new Error('Not Found'));

    await expect(updateEmployee(999, { salary: 50000 })).rejects.toThrow('Not Found');
  });
});
