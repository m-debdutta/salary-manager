import { describe, it, expect } from 'vitest';
import { createEmployeeSchema } from '../../../src/lib/validation';

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
