import { createEmployee, getEmployees, getEmployeeById, updateEmployee, EmployeeCreateInput } from '../db/employeeRepository';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../lib/validation';

/**
 * Employee Service - Handles business logic for employee operations
 */

export class EmployeeService {
  /**
   * Create a new employee
   * @param data - Employee data
   * @returns Created employee
   */
  async createEmployee(data: CreateEmployeeInput) {
    try {
      // Convert string date to Date object
      const employeeData = {
        ...data,
        hireDate: new Date(data.hireDate),
      };

      const employee = await createEmployee(employeeData as EmployeeCreateInput);

      return employee;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  async getEmployeeById(id: number) {
    return await getEmployeeById(id);
  }

  async updateEmployee(id: number, data: UpdateEmployeeInput) {
    const updateData: Partial<EmployeeCreateInput> = { ...data } as any;

    if (data.hireDate) {
      updateData.hireDate = new Date(data.hireDate);
    }

    return await updateEmployee(id, updateData);
  }

  async getEmployees(skip: number = 0, take: number = 50) {
    const { employees, total } = await getEmployees(skip, take);

    return {
      employees,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }
}

// Export singleton instance
export const employeeService = new EmployeeService();
