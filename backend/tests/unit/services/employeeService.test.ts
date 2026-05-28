import { describe, it, expect, beforeEach, vi } from 'vitest';
import { employeeService } from '../../../src/services/employeeService';
import { createEmployeeSchema } from '../../../src/lib/validation';
import * as employeeRepository from '../../../src/db/employeeRepository';

vi.mock('../../../src/db/employeeRepository');

const baseEmployeeData = {
  firstName: 'John',
  lastName: 'Doe',
  jobTitle: 'Software Engineer',
  country: 'USA',
  salary: 100000,
  department: 'Engineering',
  hireDate: '2024-01-15',
  employmentType: 'Full-time',
};

const mockCreatedEmployee = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  jobTitle: 'Software Engineer',
  country: 'USA',
  salary: 100000,
  department: 'Engineering',
  hireDate: new Date('2024-01-15'),
  employmentType: 'Full-time',
  createdAt: new Date('2024-01-15T10:00:00.000Z'),
  updatedAt: new Date('2024-01-15T10:00:00.000Z'),
};

describe('EmployeeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEmployee', () => {
    it('should create an employee and return a complete record', async () => {
      vi.mocked(employeeRepository.createEmployee).mockResolvedValue(mockCreatedEmployee);

      const employee = await employeeService.createEmployee(baseEmployeeData);

      expect(employee.id).toBeGreaterThan(0);
      expect(employee.firstName).toBe(baseEmployeeData.firstName);
      expect(employee.department).toBe(baseEmployeeData.department);
      expect(employee.createdAt).toBeInstanceOf(Date);
      expect(employee.updatedAt).toBeInstanceOf(Date);
    });

    it('should parse hireDate string into a Date object', async () => {
      vi.mocked(employeeRepository.createEmployee).mockResolvedValue(mockCreatedEmployee);

      const employee = await employeeService.createEmployee(baseEmployeeData);

      expect(employee.hireDate).toBeInstanceOf(Date);
      expect(employee.hireDate.toISOString()).toContain('2024-01-15');
    });

    it('should convert hireDate string to Date before calling repository', async () => {
      const createEmployeeSpy = vi
        .mocked(employeeRepository.createEmployee)
        .mockResolvedValue(mockCreatedEmployee);

      await employeeService.createEmployee(baseEmployeeData);

      const calledWith = createEmployeeSpy.mock.calls[0][0];
      expect(calledWith.hireDate).toBeInstanceOf(Date);
      expect(calledWith.hireDate.toISOString()).toContain('2024-01-15');
    });

    it('should store null when department is omitted', async () => {
      const { department: _, ...withoutDept } = baseEmployeeData;
      vi.mocked(employeeRepository.createEmployee).mockResolvedValue({
        ...mockCreatedEmployee,
        department: null,
      });

      const employee = await employeeService.createEmployee(withoutDept);

      expect(employee.department).toBeNull();
    });
  });

  describe('getEmployees', () => {
    it('should call repository getEmployees with correct skip and take', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(10, 20);

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(10, 20);
    });

    it('should return paginated result with employees and total', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({
        employees: [mockCreatedEmployee],
        total: 5,
      });

      const result = await employeeService.getEmployees(0, 50);

      expect(result.employees).toEqual([mockCreatedEmployee]);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
    });

    it('should calculate page number correctly from skip and take', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      const result = await employeeService.getEmployees(20, 10);

      expect(result.page).toBe(3); // Math.floor(20 / 10) + 1
      expect(result.pageSize).toBe(10);
    });

    it('should use defaults of skip=0 and take=50', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees();

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(0, 50);
    });

    it('should propagate repository errors', async () => {
      vi.mocked(employeeRepository.getEmployees).mockRejectedValue(new Error('DB connection lost'));

      await expect(employeeService.getEmployees()).rejects.toThrow('DB connection lost');
    });
  });
});

describe('createEmployeeSchema validation', () => {
  it('should pass with valid data', () => {
    const result = createEmployeeSchema.safeParse(baseEmployeeData);
    expect(result.success).toBe(true);
  });

  it('should fail when firstName is missing', () => {
    const { firstName: _, ...data } = baseEmployeeData;
    const result = createEmployeeSchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/required|invalid_type|invalid input/i);
  });

  it('should fail when firstName is too short', () => {
    const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, firstName: 'A' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('First name must be at least 2 characters');
  });

  it('should fail when lastName is too short', () => {
    const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, lastName: 'X' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Last name must be at least 2 characters');
  });

  it('should fail when jobTitle is too short', () => {
    const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, jobTitle: 'A' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Job title must be at least 2 characters');
  });

  it('should fail when country is too short', () => {
    const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, country: 'A' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Country must be at least 2 characters');
  });

  it('should fail when salary is negative', () => {
    const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, salary: -1 });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Salary cannot be negative');
  });

  it('should pass when salary is 0', () => {
    const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, salary: 0 });
    expect(result.success).toBe(true);
  });

  it('should fail when hireDate is not in YYYY-MM-DD format', () => {
    const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, hireDate: '15-01-2024' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Hire date must be in YYYY-MM-DD format');
  });

  it('should fail when hireDate is a free-form string', () => {
    const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, hireDate: 'not-a-date' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Hire date must be in YYYY-MM-DD format');
  });

  it('should fail when employmentType is empty', () => {
    const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, employmentType: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Employment type is required');
  });

  it('should pass when department is null or omitted', () => {
    const withNull = createEmployeeSchema.safeParse({ ...baseEmployeeData, department: null });
    const withOmit = createEmployeeSchema.safeParse(
      (({ department: _, ...rest }) => rest)(baseEmployeeData)
    );

    expect(withNull.success).toBe(true);
    expect(withOmit.success).toBe(true);
  });
});
