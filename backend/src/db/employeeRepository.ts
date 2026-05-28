import { prisma } from './client.js';

/**
 * Employee Repository
 * Data access layer for Employee entity - handles all direct database operations using Prisma
 */

export interface EmployeeCreateInput {
  firstName: string;
  lastName: string;
  jobTitle: string;
  country: string;
  salary: number;
  department?: string;
  hireDate: Date;
  employmentType: string;
}

/**
 * Create a new employee
 */
export const createEmployee = async (data: EmployeeCreateInput) => {
  return await prisma.employee.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      jobTitle: data.jobTitle,
      country: data.country,
      salary: data.salary,
      department: data.department,
      hireDate: data.hireDate,
      employmentType: data.employmentType,
    },
  });
};
