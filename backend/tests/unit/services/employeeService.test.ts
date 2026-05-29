import { describe, it, expect, beforeEach, vi } from 'vitest';
import { employeeService } from '../../../src/services/employeeService';
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

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        10,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
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

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should propagate repository errors', async () => {
      vi.mocked(employeeRepository.getEmployees).mockRejectedValue(new Error('DB connection lost'));

      await expect(employeeService.getEmployees()).rejects.toThrow('DB connection lost');
    });

    it('should forward search term to repository', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50, 'alice');

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        'alice',
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should forward undefined search to repository when not provided', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50);

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should forward department filter to repository', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50, undefined, 'Engineering');

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        'Engineering',
        undefined,
        undefined,
        undefined
      );
    });

    it('should forward undefined department when not provided', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50, 'alice');

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        'alice',
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should forward both search and department to repository', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50, 'alice', 'Engineering');

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        'alice',
        'Engineering',
        undefined,
        undefined,
        undefined
      );
    });

    it('should forward jobTitle filter to repository', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50, undefined, undefined, 'Software Engineer');

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        'Software Engineer',
        undefined,
        undefined
      );
    });

    it('should forward undefined jobTitle when not provided', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50);

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should forward jobTitle together with search and department to repository', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50, 'alice', 'Engineering', 'Software Engineer');

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        'alice',
        'Engineering',
        'Software Engineer',
        undefined,
        undefined
      );
    });

    it('should forward country filter to repository', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50, undefined, undefined, undefined, 'USA');

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        'USA',
        undefined
      );
    });

    it('should forward undefined country when not provided', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50);

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should forward country together with all other filters to repository', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50, 'alice', 'Engineering', 'Software Engineer', 'USA');

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        'alice',
        'Engineering',
        'Software Engineer',
        'USA',
        undefined
      );
    });

    it('should forward employmentType filter to repository', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        'Full-time'
      );

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        'Full-time'
      );
    });

    it('should forward undefined employmentType when not provided', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(0, 50);

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should forward employmentType together with all other filters to repository', async () => {
      vi.mocked(employeeRepository.getEmployees).mockResolvedValue({ employees: [], total: 0 });

      await employeeService.getEmployees(
        0,
        50,
        'alice',
        'Engineering',
        'Software Engineer',
        'USA',
        'Full-time'
      );

      expect(employeeRepository.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        'alice',
        'Engineering',
        'Software Engineer',
        'USA',
        'Full-time'
      );
    });
  });

  describe('updateEmployee', () => {
    it('should call repository updateEmployee with correct id and data', async () => {
      vi.mocked(employeeRepository.updateEmployee).mockResolvedValue(mockCreatedEmployee);

      await employeeService.updateEmployee(1, { salary: 120000 });

      expect(employeeRepository.updateEmployee).toHaveBeenCalledWith(1, { salary: 120000 });
    });

    it('should convert hireDate string to Date before calling repository', async () => {
      const updateSpy = vi
        .mocked(employeeRepository.updateEmployee)
        .mockResolvedValue(mockCreatedEmployee);

      await employeeService.updateEmployee(1, { hireDate: '2025-06-01' });

      const calledWith = updateSpy.mock.calls[0][1];
      expect((calledWith as any).hireDate).toBeInstanceOf(Date);
      expect((calledWith as any).hireDate.toISOString()).toContain('2025-06-01');
    });

    it('should not modify data when hireDate is not provided', async () => {
      const updateSpy = vi
        .mocked(employeeRepository.updateEmployee)
        .mockResolvedValue(mockCreatedEmployee);

      await employeeService.updateEmployee(1, { salary: 90000 });

      const calledWith = updateSpy.mock.calls[0][1];
      expect((calledWith as any).hireDate).toBeUndefined();
    });

    it('should return the updated employee', async () => {
      vi.mocked(employeeRepository.updateEmployee).mockResolvedValue({
        ...mockCreatedEmployee,
        salary: 120000,
      });

      const result = await employeeService.updateEmployee(1, { salary: 120000 });

      expect(result?.salary).toBe(120000);
    });

    it('should return null when employee does not exist', async () => {
      vi.mocked(employeeRepository.updateEmployee).mockResolvedValue(null);

      const result = await employeeService.updateEmployee(999, { salary: 120000 });

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      vi.mocked(employeeRepository.updateEmployee).mockRejectedValue(new Error('DB error'));

      await expect(employeeService.updateEmployee(1, { salary: 120000 })).rejects.toThrow(
        'DB error'
      );
    });
  });

  describe('getEmployeeById', () => {
    it('should call repository getEmployeeById with the given id', async () => {
      vi.mocked(employeeRepository.getEmployeeById).mockResolvedValue(mockCreatedEmployee);

      await employeeService.getEmployeeById(1);

      expect(employeeRepository.getEmployeeById).toHaveBeenCalledWith(1);
    });

    it('should return the employee when found', async () => {
      vi.mocked(employeeRepository.getEmployeeById).mockResolvedValue(mockCreatedEmployee);

      const result = await employeeService.getEmployeeById(1);

      expect(result).toEqual(mockCreatedEmployee);
    });

    it('should return null when employee does not exist', async () => {
      vi.mocked(employeeRepository.getEmployeeById).mockResolvedValue(null);

      const result = await employeeService.getEmployeeById(999);

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      vi.mocked(employeeRepository.getEmployeeById).mockRejectedValue(new Error('DB error'));

      await expect(employeeService.getEmployeeById(1)).rejects.toThrow('DB error');
    });
  });

  describe('deleteEmployee', () => {
    it('should call repository deleteEmployee with the given id', async () => {
      vi.mocked(employeeRepository.deleteEmployee).mockResolvedValue(mockCreatedEmployee);

      await employeeService.deleteEmployee(1);

      expect(employeeRepository.deleteEmployee).toHaveBeenCalledWith(1);
    });

    it('should return the deleted employee when found', async () => {
      vi.mocked(employeeRepository.deleteEmployee).mockResolvedValue(mockCreatedEmployee);

      const result = await employeeService.deleteEmployee(1);

      expect(result).toEqual(mockCreatedEmployee);
    });

    it('should return null when employee does not exist', async () => {
      vi.mocked(employeeRepository.deleteEmployee).mockResolvedValue(null);

      const result = await employeeService.deleteEmployee(999);

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      vi.mocked(employeeRepository.deleteEmployee).mockRejectedValue(new Error('DB error'));

      await expect(employeeService.deleteEmployee(1)).rejects.toThrow('DB error');
    });
  });
});
