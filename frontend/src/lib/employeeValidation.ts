import type { CreateEmployeeInput } from '../api/employees';

export const validateEmployeeForm = (
  data: CreateEmployeeInput,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const validations = [
    {
      field: 'firstName' as const,
      check: () => !data.firstName || data.firstName.length < 2,
      message: 'First name must be at least 2 characters',
    },
    {
      field: 'lastName' as const,
      check: () => !data.lastName || data.lastName.length < 2,
      message: 'Last name must be at least 2 characters',
    },
    {
      field: 'jobTitle' as const,
      check: () => !data.jobTitle || data.jobTitle.length < 2,
      message: 'Job title is required',
    },
    {
      field: 'country' as const,
      check: () => !data.country || data.country.length < 2,
      message: 'Country is required',
    },
    {
      field: 'salary' as const,
      check: () => data.salary < 0,
      message: 'Salary cannot be negative',
    },
    {
      field: 'hireDate' as const,
      check: () => !data.hireDate,
      message: 'Hire date is required',
    },
    {
      field: 'employmentType' as const,
      check: () => !data.employmentType,
      message: 'Employment type is required',
    },
  ];

  validations.forEach(({ field, check, message }) => {
    if (check()) {
      errors[field] = message;
    }
  });

  return errors;
};
