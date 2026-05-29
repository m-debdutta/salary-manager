import { describe, it, expect } from 'vitest';
import countriesData from '../../../../data/countries.json';
import departmentsData from '../../../../data/departments.json';
import jobTitlesData from '../../../../data/job_titles.json';
import employmentTypesData from '../../../../data/employment_types.json';
import { createEmployeeSchema, updateEmployeeSchema } from '../../../src/lib/validation';

const baseEmployeeData = {
  firstName: 'John',
  lastName: 'Doe',
  jobTitle: 'Software Engineer',
  country: 'United States',
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

  it('should fail with an invalid jobTitle', () => {
    const result = createEmployeeSchema.safeParse({
      ...baseEmployeeData,
      jobTitle: 'InvalidTitle',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/Invalid job title/);
  });

  it('should fail with an invalid country', () => {
    const result = createEmployeeSchema.safeParse({
      ...baseEmployeeData,
      country: 'InvalidCountry',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/Invalid country/);
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

  it('should fail with an invalid employmentType', () => {
    const result = createEmployeeSchema.safeParse({
      ...baseEmployeeData,
      employmentType: 'Freelance',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/Invalid employment type/);
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

describe('createEmployeeSchema — enum allowlists from data files', () => {
  it('should accept every valid employment type', () => {
    for (const type of employmentTypesData) {
      const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, employmentType: type });
      expect(result.success, `expected "${type}" to be valid`).toBe(true);
    }
  });

  it('should accept every valid country', () => {
    for (const { name } of countriesData) {
      const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, country: name });
      expect(result.success, `expected "${name}" to be a valid country`).toBe(true);
    }
  });

  it('should accept every valid department', () => {
    for (const { name } of departmentsData) {
      const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, department: name });
      expect(result.success, `expected "${name}" to be a valid department`).toBe(true);
    }
  });

  it('should accept every valid job title', () => {
    for (const { name } of jobTitlesData) {
      const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, jobTitle: name });
      expect(result.success, `expected "${name}" to be a valid job title`).toBe(true);
    }
  });

  it('should fail with an invalid department', () => {
    const result = createEmployeeSchema.safeParse({ ...baseEmployeeData, department: 'Wizardry' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/Invalid department/);
  });
});

describe('updateEmployeeSchema validation', () => {
  it('should pass with a single valid field', () => {
    const result = updateEmployeeSchema.safeParse({ salary: 120000 });
    expect(result.success).toBe(true);
  });

  it('should pass with all fields provided', () => {
    const result = updateEmployeeSchema.safeParse(baseEmployeeData);
    expect(result.success).toBe(true);
  });

  it('should pass with an empty object', () => {
    const result = updateEmployeeSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should still reject an invalid country in a partial update', () => {
    const result = updateEmployeeSchema.safeParse({ country: 'Neverland' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/Invalid country/);
  });

  it('should still reject an invalid employment type in a partial update', () => {
    const result = updateEmployeeSchema.safeParse({ employmentType: 'Volunteer' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/Invalid employment type/);
  });

  it('should still reject an invalid job title in a partial update', () => {
    const result = updateEmployeeSchema.safeParse({ jobTitle: 'Ninja' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/Invalid job title/);
  });

  it('should still reject an invalid department in a partial update', () => {
    const result = updateEmployeeSchema.safeParse({ department: 'Dark Arts' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/Invalid department/);
  });
});
