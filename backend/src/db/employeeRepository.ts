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
 * Get a paginated list of employees with total count
 */
export const getEmployees = async (skip: number = 0, take: number = 50) => {
  const [employees, total] = await Promise.all([
    prisma.employee.findMany({ skip, take, orderBy: { id: 'asc' } }),
    prisma.employee.count(),
  ]);
  return { employees, total };
};

/**
 * Get a single employee by ID
 */
export const getEmployeeById = async (id: number) => {
  return await prisma.employee.findUnique({ where: { id } });
};

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

/**
 * Update an existing employee by ID
 * Returns the updated employee, or null if not found
 */
export const updateEmployee = async (
  id: number,
  data: Partial<EmployeeCreateInput>
): Promise<Awaited<ReturnType<typeof prisma.employee.update>> | null> => {
  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) return null;

  return await prisma.employee.update({
    where: { id },
    data,
  });
};

/**
 * Delete an employee by ID
 * Returns the deleted employee, or null if not found
 */
export const deleteEmployee = async (
  id: number
): Promise<Awaited<ReturnType<typeof prisma.employee.delete>> | null> => {
  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) return null;

  return await prisma.employee.delete({ where: { id } });
};
