import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createEmployee,
  updateEmployee,
  type CreateEmployeeInput,
} from '../api/employees';
import { Combobox } from './Combobox';
import type { Employee } from './EmployeeCard';
import countriesData from '../../../data/countries.json';
import departmentsData from '../../../data/departments.json';
import employmentTypesData from '../../../data/employment_types.json';
import styles from './AddEmployeeModal.module.css';

const EMPLOYMENT_TYPES = employmentTypesData;
const COUNTRIES = countriesData.map((c) => c.name);
const DEPARTMENTS = departmentsData.map((d) => d.name);
const JOB_TITLE_GROUPS = departmentsData.map((d) => ({
  label: d.name,
  options: d.jobTitles,
}));

const INITIAL_FORM: CreateEmployeeInput = {
  firstName: '',
  lastName: '',
  jobTitle: '',
  country: '',
  salary: 0,
  department: '',
  hireDate: '',
  employmentType: '',
};

interface AddEmployeeModalProps {
  onClose: () => void;
  employee?: Employee;
}

export default function AddEmployeeModal({ onClose, employee }: AddEmployeeModalProps) {
  const isEditMode = !!employee;

  const [form, setForm] = useState<CreateEmployeeInput>(
    isEditMode
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          jobTitle: employee.jobTitle,
          country: employee.country,
          salary: employee.salary,
          department: employee.department ?? '',
          hireDate: employee.hireDate,
          employmentType: employee.employmentType,
        }
      : INITIAL_FORM,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateEmployeeInput) =>
      isEditMode ? updateEmployee(employee.id, payload) : createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'salary' ? parseFloat(value) || 0 : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleComboChange = (name: keyof CreateEmployeeInput) => (val: string) => {
    setForm((prev) => ({ ...prev, [name]: val }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.firstName || form.firstName.length < 2)
      errors.firstName = 'First name must be at least 2 characters';
    if (!form.lastName || form.lastName.length < 2)
      errors.lastName = 'Last name must be at least 2 characters';
    if (!form.jobTitle || form.jobTitle.length < 2)
      errors.jobTitle = 'Job title must be at least 2 characters';
    if (!form.country || form.country.length < 2)
      errors.country = 'Country must be at least 2 characters';
    if (form.salary < 0) errors.salary = 'Salary cannot be negative';
    if (!form.hireDate) errors.hireDate = 'Hire date is required';
    if (!form.employmentType) errors.employmentType = 'Employment type is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: CreateEmployeeInput = {
      ...form,
      department: form.department || null,
    };
    mutation.mutate(payload);
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title" id="modal-title">
            {isEditMode ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                className={`form-input${fieldErrors.firstName ? ' form-input--error' : ''}`}
                type="text"
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
              />
              {fieldErrors.firstName && (
                <span className={styles.fieldError}>{fieldErrors.firstName}</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                className={`form-input${fieldErrors.lastName ? ' form-input--error' : ''}`}
                type="text"
                value={form.lastName}
                onChange={handleChange}
                autoComplete="family-name"
              />
              {fieldErrors.lastName && (
                <span className={styles.fieldError}>{fieldErrors.lastName}</span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="jobTitle">
              Job Title
            </label>
            <Combobox
              value={form.jobTitle}
              onChange={handleComboChange('jobTitle')}
              placeholder="Select job title…"
              searchPlaceholder="Search job titles…"
              groups={JOB_TITLE_GROUPS}
              searchable
              hasError={!!fieldErrors.jobTitle}
            />
            {fieldErrors.jobTitle && (
              <span className={styles.fieldError}>{fieldErrors.jobTitle}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="department">
              Department <span className={styles.optional}>(optional)</span>
            </label>
            <Combobox
              value={form.department ?? ''}
              onChange={handleComboChange('department')}
              placeholder="Select department…"
              options={DEPARTMENTS}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="country">
                Country
              </label>
              <Combobox
                value={form.country}
                onChange={handleComboChange('country')}
                placeholder="Select country…"
                searchPlaceholder="Search countries…"
                options={COUNTRIES}
                searchable
                hasError={!!fieldErrors.country}
              />
              {fieldErrors.country && (
                <span className={styles.fieldError}>{fieldErrors.country}</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="salary">
                Salary (USD)
              </label>
              <input
                id="salary"
                name="salary"
                className={`form-input${fieldErrors.salary ? ' form-input--error' : ''}`}
                type="number"
                min="0"
                step="1"
                value={form.salary}
                onChange={handleChange}
              />
              {fieldErrors.salary && (
                <span className={styles.fieldError}>{fieldErrors.salary}</span>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="hireDate">
                Hire Date
              </label>
              <input
                id="hireDate"
                name="hireDate"
                className={`form-input${fieldErrors.hireDate ? ' form-input--error' : ''}`}
                type="date"
                value={form.hireDate}
                onChange={handleChange}
              />
              {fieldErrors.hireDate && (
                <span className={styles.fieldError}>{fieldErrors.hireDate}</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="employmentType">
                Employment Type
              </label>
              <Combobox
                value={form.employmentType}
                onChange={handleComboChange('employmentType')}
                placeholder="Select type…"
                options={EMPLOYMENT_TYPES}
                hasError={!!fieldErrors.employmentType}
              />
              {fieldErrors.employmentType && (
                <span className={styles.fieldError}>{fieldErrors.employmentType}</span>
              )}
            </div>
          </div>

          {mutation.isError && (
            <p className={styles.submitError}>
              {isEditMode
                ? 'Failed to update employee. Please try again.'
                : 'Failed to create employee. Please try again.'}
            </p>
          )}

          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? 'Saving…'
                : isEditMode
                  ? 'Save Changes'
                  : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
