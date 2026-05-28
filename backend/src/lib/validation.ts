import { z } from 'zod';

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
  jobTitle: z
    .string()
    .min(1, 'Job title is required')
    .min(2, 'Job title must be at least 2 characters'),
  country: z.string().min(1, 'Country is required').min(2, 'Country must be at least 2 characters'),
  salary: z.number().min(0, 'Salary cannot be negative'),
  department: z.string().optional().nullable(),
  hireDate: z.iso.date('Hire date must be in YYYY-MM-DD format'),
  employmentType: z.string().min(1, 'Employment type is required'),
});

// Type inference from schema
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

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
