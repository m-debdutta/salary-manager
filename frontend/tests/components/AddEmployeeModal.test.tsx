import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AddEmployeeModal from '../../src/components/AddEmployeeModal';
import { createEmployee, updateEmployee } from '../../src/api/employees';
import type { Employee } from '../../src/components/EmployeeCard';
import { MOCK_CREATED_EMPLOYEE, MOCK_EXISTING_EMPLOYEE } from '../fixtures/employees';

vi.mock('../../src/api/employees');

const onClose = vi.fn();

const renderModal = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AddEmployeeModal onClose={onClose} />
    </QueryClientProvider>,
  );
};

const renderEditModal = (employee: Employee = MOCK_EXISTING_EMPLOYEE) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AddEmployeeModal onClose={onClose} employee={employee} />
    </QueryClientProvider>,
  );
};

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } });
  fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText('Hire Date'), {
    target: { value: '2024-01-01' },
  });
  fireEvent.change(screen.getByLabelText('Salary (USD)'), {
    target: { value: '100000' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'Select job title…' }));
  fireEvent.mouseDown(screen.getByRole('option', { name: 'Software Engineer' }));

  fireEvent.click(screen.getByRole('button', { name: 'Select country…' }));
  fireEvent.mouseDown(screen.getByRole('option', { name: 'United States' }));

  fireEvent.click(screen.getByRole('button', { name: 'Select type…' }));
  fireEvent.mouseDown(screen.getByRole('option', { name: 'Full-time' }));
};

describe('AddEmployeeModal', () => {
  beforeEach(() => {
    vi.mocked(createEmployee).mockResolvedValue(MOCK_CREATED_EMPLOYEE);
    vi.mocked(updateEmployee).mockResolvedValue({
      ...MOCK_EXISTING_EMPLOYEE,
      salary: 130000,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Snapshot ──────────────────────────────────────────────────────────────────
  describe('snapshot', () => {
    it('matches initial snapshot', () => {
      const { asFragment } = renderModal();
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot with validation errors', () => {
      const { asFragment } = renderModal();
      fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Structure ──────────────────────────────────────────────────────────────────
  describe('structure', () => {
    it('renders the modal title', () => {
      renderModal();
      expect(screen.getByRole('heading', { name: 'Add Employee' })).toBeInTheDocument();
    });

    it('renders text inputs for first and last name', () => {
      renderModal();
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    });

    it('renders hire date and salary inputs', () => {
      renderModal();
      expect(screen.getByLabelText('Hire Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Salary (USD)')).toBeInTheDocument();
    });

    it('renders combobox triggers for all dropdown fields', () => {
      renderModal();
      expect(
        screen.getByRole('button', { name: 'Select job title…' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Select department…' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Select country…' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Select type…' })).toBeInTheDocument();
    });

    it('renders Cancel and Add Employee buttons', () => {
      renderModal();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Employee' })).toBeInTheDocument();
    });
  });

  // ── Close ──────────────────────────────────────────────────────────────────────
  describe('close actions', () => {
    it('calls onClose when Cancel is clicked', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose when the × button is clicked', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  // ── Validation ────────────────────────────────────────────────────────────────
  describe('validation', () => {
    it('shows errors for all required fields on empty submit', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));
      expect(
        screen.getByText('First name must be at least 2 characters'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Last name must be at least 2 characters'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Job title must be at least 2 characters'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Country must be at least 2 characters'),
      ).toBeInTheDocument();
      expect(screen.getByText('Hire date is required')).toBeInTheDocument();
      expect(screen.getByText('Employment type is required')).toBeInTheDocument();
    });

    it('does not call createEmployee when validation fails', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));
      expect(createEmployee).not.toHaveBeenCalled();
    });

    it('clears a text field error when the value changes', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));
      expect(
        screen.getByText('First name must be at least 2 characters'),
      ).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('First Name'), {
        target: { value: 'Jane' },
      });
      expect(
        screen.queryByText('First name must be at least 2 characters'),
      ).not.toBeInTheDocument();
    });

    it('clears a combobox error when a value is selected', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));
      expect(
        screen.getByText('Job title must be at least 2 characters'),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Select job title…' }));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'Software Engineer' }));
      expect(
        screen.queryByText('Job title must be at least 2 characters'),
      ).not.toBeInTheDocument();
    });
  });

  // ── Submission ────────────────────────────────────────────────────────────────
  describe('submission', () => {
    it('calls createEmployee with the correct payload', async () => {
      renderModal();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));

      await waitFor(() =>
        expect(vi.mocked(createEmployee)).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Jane',
            lastName: 'Doe',
            jobTitle: 'Software Engineer',
            country: 'United States',
            salary: 100000,
            hireDate: '2024-01-01',
            employmentType: 'Full-time',
          }),
        ),
      );
    });

    it('calls onClose after successful submission', async () => {
      renderModal();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));
      await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it('shows "Saving…" on the submit button while the request is in flight', async () => {
      vi.mocked(createEmployee).mockImplementation(() => new Promise(() => {}));
      renderModal();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));
      expect(await screen.findByRole('button', { name: 'Saving…' })).toBeInTheDocument();
    });

    it('shows an error message when createEmployee rejects', async () => {
      vi.mocked(createEmployee).mockRejectedValueOnce(new Error('Server Error'));
      renderModal();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));
      expect(
        await screen.findByText('Failed to create employee. Please try again.'),
      ).toBeInTheDocument();
    });
  });
});

// ─── Edit mode ────────────────────────────────────────────────────────────────
describe('AddEmployeeModal – edit mode', () => {
  beforeEach(() => {
    vi.mocked(updateEmployee).mockResolvedValue({
      ...MOCK_EXISTING_EMPLOYEE,
      salary: 130000,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Snapshot ────────────────────────────────────────────────────────────────
  describe('snapshot', () => {
    it('matches initial edit mode snapshot', () => {
      const { asFragment } = renderEditModal();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Structure ────────────────────────────────────────────────────────────────
  describe('structure', () => {
    it('renders "Edit Employee" as the modal title', () => {
      renderEditModal();
      expect(screen.getByRole('heading', { name: 'Edit Employee' })).toBeInTheDocument();
    });

    it('renders "Save Changes" as the submit button', () => {
      renderEditModal();
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    it('does not render "Add Employee" submit button in edit mode', () => {
      renderEditModal();
      expect(
        screen.queryByRole('button', { name: 'Add Employee' }),
      ).not.toBeInTheDocument();
    });
  });

  // ── Pre-population ───────────────────────────────────────────────────────────
  describe('pre-population', () => {
    it('pre-populates the first name input', () => {
      renderEditModal();
      expect(screen.getByLabelText('First Name')).toHaveValue('Alice');
    });

    it('pre-populates the last name input', () => {
      renderEditModal();
      expect(screen.getByLabelText('Last Name')).toHaveValue('Johnson');
    });

    it('pre-populates the salary input', () => {
      renderEditModal();
      expect(screen.getByLabelText('Salary (USD)')).toHaveValue(120000);
    });

    it('pre-populates the hire date input', () => {
      renderEditModal();
      expect(screen.getByLabelText('Hire Date')).toHaveValue('2021-03-15');
    });

    it('pre-populates the job title combobox', () => {
      renderEditModal();
      expect(
        screen.getByRole('button', { name: 'Software Engineer' }),
      ).toBeInTheDocument();
    });

    it('pre-populates the country combobox', () => {
      renderEditModal();
      expect(screen.getByRole('button', { name: 'United States' })).toBeInTheDocument();
    });

    it('pre-populates the department combobox', () => {
      renderEditModal();
      expect(screen.getByRole('button', { name: 'Engineering' })).toBeInTheDocument();
    });

    it('pre-populates the employment type combobox', () => {
      renderEditModal();
      expect(screen.getByRole('button', { name: 'Full-time' })).toBeInTheDocument();
    });
  });

  // ── Submission ────────────────────────────────────────────────────────────────
  describe('submission', () => {
    it('calls updateEmployee instead of createEmployee', async () => {
      renderEditModal();
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
      await waitFor(() => expect(vi.mocked(updateEmployee)).toHaveBeenCalled());
      expect(vi.mocked(createEmployee)).not.toHaveBeenCalled();
    });

    it('calls updateEmployee with the employee id and form data', async () => {
      renderEditModal();
      fireEvent.change(screen.getByLabelText('Salary (USD)'), {
        target: { value: '130000' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() =>
        expect(vi.mocked(updateEmployee)).toHaveBeenCalledWith(
          MOCK_EXISTING_EMPLOYEE.id,
          expect.objectContaining({
            firstName: 'Alice',
            lastName: 'Johnson',
            salary: 130000,
          }),
        ),
      );
    });

    it('calls onClose after a successful update', async () => {
      renderEditModal();
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
      await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it('shows "Saving…" while the request is in flight', async () => {
      vi.mocked(updateEmployee).mockImplementation(() => new Promise(() => {}));
      renderEditModal();
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
      expect(await screen.findByRole('button', { name: 'Saving…' })).toBeInTheDocument();
    });

    it('shows an error message when updateEmployee rejects', async () => {
      vi.mocked(updateEmployee).mockRejectedValueOnce(new Error('Server Error'));
      renderEditModal();
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
      expect(
        await screen.findByText('Failed to update employee. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  // ── Validation ────────────────────────────────────────────────────────────────
  describe('validation', () => {
    it('validates the form before calling updateEmployee', () => {
      renderEditModal();
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'A' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
      expect(
        screen.getByText('First name must be at least 2 characters'),
      ).toBeInTheDocument();
      expect(vi.mocked(updateEmployee)).not.toHaveBeenCalled();
    });
  });
});
