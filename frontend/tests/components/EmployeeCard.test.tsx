import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmployeeCard, type Employee } from '../../src/components/EmployeeCard';

const baseEmployee: Employee = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Johnson',
  jobTitle: 'Software Engineer',
  country: 'USA',
  salary: 120000,
  department: 'Engineering',
  hireDate: '2021-03-15',
  employmentType: 'full-time',
};

const renderCard = (overrides: Partial<Employee> = {}) =>
  render(<EmployeeCard employee={{ ...baseEmployee, ...overrides }} />);

describe('EmployeeCard', () => {
  // ── Snapshot ────────────────────────────────────────────────────────────────
  describe('snapshot', () => {
    it('matches snapshot for a full-time employee', () => {
      const { asFragment } = renderCard();
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot for a part-time employee with null department', () => {
      const { asFragment } = renderCard({
        employmentType: 'part-time',
        department: null,
      });
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot for a contract employee', () => {
      const { asFragment } = renderCard({ employmentType: 'contract' });
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Header ──────────────────────────────────────────────────────────────────
  describe('header', () => {
    it('renders the correct avatar initials', () => {
      renderCard();
      expect(screen.getByText('AJ')).toBeInTheDocument();
    });

    it('uppercases initials regardless of input casing', () => {
      renderCard({ firstName: 'alice', lastName: 'johnson' });
      expect(screen.getByText('AJ')).toBeInTheDocument();
    });

    it('renders the full name', () => {
      renderCard();
      expect(screen.getByRole('heading', { name: 'Alice Johnson' })).toBeInTheDocument();
    });

    it('renders the job title', () => {
      renderCard();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
  });

  // ── Employment type badge ────────────────────────────────────────────────────
  describe('employment type badge', () => {
    it('renders the employment type text in the badge', () => {
      renderCard();
      expect(screen.getByText('full-time')).toBeInTheDocument();
    });

    it('applies the full-time badge class', () => {
      renderCard({ employmentType: 'full-time' });
      const badge = screen.getByText('full-time');
      expect(badge).toHaveClass('badge', 'badge--full-time');
    });

    it('applies the part-time badge class', () => {
      renderCard({ employmentType: 'part-time' });
      const badge = screen.getByText('part-time');
      expect(badge).toHaveClass('badge', 'badge--part-time');
    });

    it('applies the contract badge class', () => {
      renderCard({ employmentType: 'contract' });
      const badge = screen.getByText('contract');
      expect(badge).toHaveClass('badge', 'badge--contract');
    });

    it('falls back to the default badge class for unknown employment types', () => {
      renderCard({ employmentType: 'intern' });
      const badge = screen.getByText('intern');
      expect(badge).toHaveClass('badge', 'badge--default');
    });
  });

  // ── Structure ────────────────────────────────────────────────────────────────
  describe('structure', () => {
    it('renders the root card element with the correct class', () => {
      const { container } = renderCard();
      expect(container.firstChild).toHaveClass('employee-card');
    });

    it('renders the header and footer sections', () => {
      const { container } = renderCard();
      expect(container.querySelector('.employee-card__header')).toBeInTheDocument();
      expect(container.querySelector('.employee-card__footer')).toBeInTheDocument();
    });
  });

  // ── onClick ───────────────────────────────────────────────────────────────────
  describe('onClick', () => {
    it('calls onClick when the card is clicked', () => {
      const onClick = vi.fn();
      render(<EmployeeCard employee={baseEmployee} onClick={onClick} />);
      fireEvent.click(screen.getByRole('heading', { name: 'Alice Johnson' }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('applies cursor: pointer style when onClick is provided', () => {
      const onClick = vi.fn();
      const { container } = render(
        <EmployeeCard employee={baseEmployee} onClick={onClick} />,
      );
      expect(container.firstChild).toHaveStyle({ cursor: 'pointer' });
    });

    it('does not apply a cursor style when onClick is not provided', () => {
      const { container } = renderCard();
      expect(container.firstChild).not.toHaveStyle({ cursor: 'pointer' });
    });

    it('matches snapshot with onClick handler', () => {
      const { asFragment } = render(
        <EmployeeCard employee={baseEmployee} onClick={vi.fn()} />,
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
