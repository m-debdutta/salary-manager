import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import EmployeeDetailsModal from '../../src/components/EmployeeDetailsModal';
import type { Employee } from '../../src/components/EmployeeCard';

const baseEmployee: Employee = {
  id: 42,
  firstName: 'Alice',
  lastName: 'Johnson',
  jobTitle: 'Software Engineer',
  country: 'USA',
  salary: 120000,
  department: 'Engineering',
  hireDate: '2021-03-15',
  employmentType: 'full-time',
};

const onClose = vi.fn();
const onEdit = vi.fn();

const renderModal = (overrides: Partial<Employee> = {}, { withEdit = true } = {}) =>
  render(
    <EmployeeDetailsModal
      employee={{ ...baseEmployee, ...overrides }}
      onClose={onClose}
      onEdit={withEdit ? onEdit : undefined}
    />,
  );

// Compute expected formatted values using the same logic as the component
// to remain timezone-agnostic.
const expectedSalary = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(baseEmployee.salary);

const expectedHireDate = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date(baseEmployee.hireDate));

describe('EmployeeDetailsModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  // ── Snapshot ─────────────────────────────────────────────────────────────────
  describe('snapshot', () => {
    it('matches snapshot for a full-time employee', () => {
      const { asFragment } = renderModal();
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot when department is null', () => {
      const { asFragment } = renderModal({ department: null });
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Structure ─────────────────────────────────────────────────────────────────
  describe('structure', () => {
    it('renders the modal dialog', () => {
      renderModal();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders the "Employee Details" heading', () => {
      renderModal();
      expect(
        screen.getByRole('heading', { name: 'Employee Details' }),
      ).toBeInTheDocument();
    });

    it('renders a close button', () => {
      renderModal();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  // ── Hero section ──────────────────────────────────────────────────────────────
  describe('hero section', () => {
    it('renders the correct avatar initials', () => {
      renderModal();
      expect(screen.getByText('AJ')).toBeInTheDocument();
    });

    it('uppercases initials regardless of input casing', () => {
      renderModal({ firstName: 'alice', lastName: 'johnson' });
      expect(screen.getByText('AJ')).toBeInTheDocument();
    });

    it('renders the full employee name', () => {
      renderModal();
      expect(screen.getByRole('heading', { name: 'Alice Johnson' })).toBeInTheDocument();
    });

    it('renders the job title', () => {
      renderModal();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('applies the correct badge class for full-time', () => {
      renderModal({ employmentType: 'full-time' });
      const badge = screen.getByText('full-time');
      expect(badge).toHaveClass('badge', 'badge--full-time');
    });

    it('applies the part-time badge class', () => {
      renderModal({ employmentType: 'part-time' });
      const badge = screen.getByText('part-time');
      expect(badge).toHaveClass('badge', 'badge--part-time');
    });

    it('applies the contract badge class', () => {
      renderModal({ employmentType: 'contract' });
      const badge = screen.getByText('contract');
      expect(badge).toHaveClass('badge', 'badge--contract');
    });

    it('falls back to default badge class for unknown employment type', () => {
      renderModal({ employmentType: 'intern' });
      const badge = screen.getByText('intern');
      expect(badge).toHaveClass('badge', 'badge--default');
    });
  });

  // ── Detail fields ─────────────────────────────────────────────────────────────
  describe('detail fields', () => {
    it('renders the department', () => {
      renderModal();
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    it('renders "—" when department is null', () => {
      renderModal({ department: null });
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('renders the country', () => {
      renderModal();
      expect(screen.getByText('USA')).toBeInTheDocument();
    });

    it('renders the salary formatted as USD currency', () => {
      renderModal();
      expect(screen.getByText(expectedSalary)).toBeInTheDocument();
    });

    it('renders the hire date in long format', () => {
      renderModal();
      expect(screen.getByText(expectedHireDate)).toBeInTheDocument();
    });

    it('renders the employee ID prefixed with #', () => {
      renderModal();
      expect(screen.getByText('#42')).toBeInTheDocument();
    });
  });

  // ── Close behaviour ───────────────────────────────────────────────────────────
  describe('close behaviour', () => {
    it('calls onClose when the × button is clicked', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the overlay backdrop is clicked', () => {
      renderModal();
      fireEvent.click(screen.getByRole('dialog'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inside the modal content', () => {
      renderModal();
      fireEvent.click(screen.getByRole('heading', { name: 'Employee Details' }));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ── Edit button ───────────────────────────────────────────────────────────────
  describe('edit button', () => {
    it('renders an "Edit Employee" button', () => {
      renderModal();
      expect(screen.getByRole('button', { name: 'Edit Employee' })).toBeInTheDocument();
    });

    it('calls onEdit when the "Edit Employee" button is clicked', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: 'Edit Employee' }));
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onEdit is not provided', () => {
      renderModal({}, { withEdit: false });
      expect(screen.getByRole('button', { name: 'Edit Employee' })).toBeInTheDocument();
      // Clicking should not throw
      expect(() =>
        fireEvent.click(screen.getByRole('button', { name: 'Edit Employee' })),
      ).not.toThrow();
    });
  });
});
