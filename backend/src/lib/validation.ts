import { z } from 'zod';
import countriesData from '../../../data/countries.json';
import departmentsData from '../../../data/departments.json';
import jobTitlesData from '../../../data/job_titles.json';
import employmentTypesData from '../../../data/employment_types.json';

const validCountries = countriesData.map((c) => c.name);
const validDepartments = departmentsData.map((d) => d.name);
const validJobTitles = jobTitlesData.map((jt) => jt.name);
const validEmploymentTypes = employmentTypesData;

/**
 * Validation schemas for Employee API
 */

// Schema for creating a new employee
export const createEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  jobTitle: z.string().refine((val) => validJobTitles.includes(val), {
    message: `Invalid job title. Must be one of: ${validJobTitles.join(', ')}`,
  }),
  country: z.string().refine((val) => validCountries.includes(val), {
    message: `Invalid country. Must be one of: ${validCountries.join(', ')}`,
  }),
  salary: z.number().min(0, 'Salary cannot be negative'),
  department: z
    .string()
    .refine((val) => validDepartments.includes(val), {
      message: `Invalid department. Must be one of: ${validDepartments.join(', ')}`,
    })
    .optional()
    .nullable(),
  hireDate: z.iso.date('Hire date must be in YYYY-MM-DD format'),
  employmentType: z.string().refine((val) => validEmploymentTypes.includes(val), {
    message: `Invalid employment type. Must be one of: ${validEmploymentTypes.join(', ')}`,
  }),
});

// Type inference from schema
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

// Schema for updating an existing employee (all fields optional)
export const updateEmployeeSchema = createEmployeeSchema.partial();

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

// Schema for employee response
export const employeeResponseSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  jobTitle: z.string(),
  country: z.string(),
  salary: z.number(),
  department: z.string().nullable(),
  hireDate: z.date(),
  employmentType: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EmployeeResponse = z.infer<typeof employeeResponseSchema>;

// Schema for validation errors
export const validationErrorSchema = z.object({
  error: z.string(),
});
