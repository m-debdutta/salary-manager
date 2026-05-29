import { describe, it, expect } from 'vitest';
import { validateEmployeeForm } from '../../src/lib/employeeValidation';
import type { CreateEmployeeInput } from '../../src/api/employees';

describe('validateEmployeeForm', () => {
  const validForm: CreateEmployeeInput = {
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'Software Engineer',
    country: 'United States',
    salary: 80000,
    department: 'Engineering',
    hireDate: '2024-01-15',
    employmentType: 'full-time',
  };

  it('should return no errors for a valid form', () => {
    const errors = validateEmployeeForm(validForm);
    expect(errors).toEqual({});
  });

  describe('firstName validation', () => {
    it('should error if firstName is empty', () => {
      const errors = validateEmployeeForm({ ...validForm, firstName: '' });
      expect(errors.firstName).toBe('First name must be at least 2 characters');
    });

    it('should error if firstName has only 1 character', () => {
      const errors = validateEmployeeForm({ ...validForm, firstName: 'J' });
      expect(errors.firstName).toBe('First name must be at least 2 characters');
    });

    it('should not error if firstName has exactly 2 characters', () => {
      const errors = validateEmployeeForm({ ...validForm, firstName: 'Jo' });
      expect(errors.firstName).toBeUndefined();
    });
  });

  describe('lastName validation', () => {
    it('should error if lastName is empty', () => {
      const errors = validateEmployeeForm({ ...validForm, lastName: '' });
      expect(errors.lastName).toBe('Last name must be at least 2 characters');
    });

    it('should error if lastName has only 1 character', () => {
      const errors = validateEmployeeForm({ ...validForm, lastName: 'D' });
      expect(errors.lastName).toBe('Last name must be at least 2 characters');
    });

    it('should not error if lastName has exactly 2 characters', () => {
      const errors = validateEmployeeForm({ ...validForm, lastName: 'Do' });
      expect(errors.lastName).toBeUndefined();
    });
  });

  describe('jobTitle validation', () => {
    it('should error if jobTitle is empty', () => {
      const errors = validateEmployeeForm({ ...validForm, jobTitle: '' });
      expect(errors.jobTitle).toBe('Job title is required');
    });

    it('should error if jobTitle has only 1 character', () => {
      const errors = validateEmployeeForm({ ...validForm, jobTitle: 'A' });
      expect(errors.jobTitle).toBe('Job title is required');
    });

    it('should not error if jobTitle has exactly 2 characters', () => {
      const errors = validateEmployeeForm({ ...validForm, jobTitle: 'SE' });
      expect(errors.jobTitle).toBeUndefined();
    });
  });

  describe('country validation', () => {
    it('should error if country is empty', () => {
      const errors = validateEmployeeForm({ ...validForm, country: '' });
      expect(errors.country).toBe('Country is required');
    });

    it('should error if country has only 1 character', () => {
      const errors = validateEmployeeForm({ ...validForm, country: 'U' });
      expect(errors.country).toBe('Country is required');
    });

    it('should not error if country has exactly 2 characters', () => {
      const errors = validateEmployeeForm({ ...validForm, country: 'US' });
      expect(errors.country).toBeUndefined();
    });
  });

  describe('salary validation', () => {
    it('should not error if salary is 0', () => {
      const errors = validateEmployeeForm({ ...validForm, salary: 0 });
      expect(errors.salary).toBeUndefined();
    });

    it('should not error if salary is positive', () => {
      const errors = validateEmployeeForm({ ...validForm, salary: 50000 });
      expect(errors.salary).toBeUndefined();
    });

    it('should error if salary is negative', () => {
      const errors = validateEmployeeForm({ ...validForm, salary: -1000 });
      expect(errors.salary).toBe('Salary cannot be negative');
    });
  });

  describe('hireDate validation', () => {
    it('should error if hireDate is empty', () => {
      const errors = validateEmployeeForm({ ...validForm, hireDate: '' });
      expect(errors.hireDate).toBe('Hire date is required');
    });

    it('should not error if hireDate is provided', () => {
      const errors = validateEmployeeForm({ ...validForm, hireDate: '2024-01-15' });
      expect(errors.hireDate).toBeUndefined();
    });
  });

  describe('employmentType validation', () => {
    it('should error if employmentType is empty', () => {
      const errors = validateEmployeeForm({ ...validForm, employmentType: '' });
      expect(errors.employmentType).toBe('Employment type is required');
    });

    it('should not error if employmentType is provided', () => {
      const errors = validateEmployeeForm({ ...validForm, employmentType: 'full-time' });
      expect(errors.employmentType).toBeUndefined();
    });
  });

  it('should return multiple errors if multiple fields are invalid', () => {
    const errors = validateEmployeeForm({
      ...validForm,
      firstName: '',
      salary: -500,
      hireDate: '',
    });

    expect(Object.keys(errors)).toHaveLength(3);
    expect(errors.firstName).toBe('First name must be at least 2 characters');
    expect(errors.salary).toBe('Salary cannot be negative');
    expect(errors.hireDate).toBe('Hire date is required');
  });

  it('should not error for department if it is empty (optional field)', () => {
    const errors = validateEmployeeForm({ ...validForm, department: '' });
    expect(errors.department).toBeUndefined();
  });
});
