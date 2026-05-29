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
 * Optionally filters by a search pattern matched against firstName and lastName
 */
export const getEmployees = async (
  skip: number = 0,
  take: number = 50,
  search?: string,
  department?: string,
  jobTitle?: string,
  country?: string,
  employmentType?: string
) => {
  // SQLite does not support Prisma's `mode: 'insensitive'`.
  // SQLite's LIKE (used by Prisma `contains`) is case-insensitive for ASCII by default,
  // so lowercasing the search term is sufficient for consistent behaviour.
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search.toLowerCase() } },
      { lastName: { contains: search.toLowerCase() } },
    ];
  }

  if (department) {
    where.department = department;
  }

  if (jobTitle) {
    where.jobTitle = jobTitle;
  }

  if (country) {
    where.country = country;
  }

  if (employmentType) {
    where.employmentType = employmentType;
  }

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take,
      orderBy: { id: 'asc' },
    }),
    prisma.employee.count({ where: Object.keys(where).length ? where : undefined }),
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
