import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from '../../src/components/Dashboard';

// Derived from MOCK_EMPLOYEES in Dashboard.tsx:
//   8 employees, 6 unique departments, avg salary $95,125, 5 full-time
const EXPECTED = {
  totalEmployees: 8,
  departments: 6,
  avgSalary: '$95,125',
  fullTime: 5,
} as const;

const EMPLOYEE_NAMES = [
  'Alice Johnson',
  'Bob Smith',
  'Clara Nguyen',
  'David Müller',
  'Eva Martinez',
  'Frank Lee',
  'Grace Patel',
  'Henry Dubois',
];

describe('Dashboard', () => {
  // ── Snapshot ─────────────────────────────────────────────────────────────────
  describe('snapshot', () => {
    it('matches snapshot', () => {
      const { asFragment } = render(<Dashboard />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Header ───────────────────────────────────────────────────────────────────
  describe('header', () => {
    it('renders the page title', () => {
      render(<Dashboard />);
      expect(screen.getByRole('heading', { name: 'Salary Manager' })).toBeInTheDocument();
    });

    it('renders the subtitle', () => {
      render(<Dashboard />);
      expect(screen.getByText('Employee Overview')).toBeInTheDocument();
    });
  });

  // ── Summary stats ─────────────────────────────────────────────────────────────
  describe('summary stats', () => {
    it('shows the correct total employee count', () => {
      render(<Dashboard />);
      const totalCard = screen
        .getByText('Total Employees')
        .closest('.stat-card') as HTMLElement;
      expect(
        within(totalCard).getByText(String(EXPECTED.totalEmployees)),
      ).toBeInTheDocument();
    });

    it('shows the correct department count', () => {
      render(<Dashboard />);
      const deptCard = screen
        .getByText('Departments')
        .closest('.stat-card') as HTMLElement;
      expect(
        within(deptCard).getByText(String(EXPECTED.departments)),
      ).toBeInTheDocument();
    });

    it('shows the correct full-time employee count', () => {
      render(<Dashboard />);
      const ftCard = screen.getByText('Full-time').closest('.stat-card') as HTMLElement;
      expect(within(ftCard).getByText(String(EXPECTED.fullTime))).toBeInTheDocument();
    });

    it('renders exactly three stat cards', () => {
      const { container } = render(<Dashboard />);
      expect(container.querySelectorAll('.stat-card')).toHaveLength(3);
    });
  });

  // ── Employee grid ─────────────────────────────────────────────────────────────
  describe('employee grid', () => {
    it('renders a card for every employee', () => {
      const { container } = render(<Dashboard />);
      expect(container.querySelectorAll('.employee-card')).toHaveLength(
        EXPECTED.totalEmployees,
      );
    });

    it.each(EMPLOYEE_NAMES)('renders a card for %s', (name) => {
      render(<Dashboard />);
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    });

    it('renders the grid container', () => {
      const { container } = render(<Dashboard />);
      expect(container.querySelector('.dashboard__grid')).toBeInTheDocument();
    });
  });

  // ── Employment type representation ────────────────────────────────────────────
  describe('employment type badges', () => {
    it('renders full-time badges for the expected employees', () => {
      render(<Dashboard />);
      const fullTimeBadges = screen
        .getAllByText('full-time')
        .filter((el) => el.classList.contains('badge--full-time'));
      expect(fullTimeBadges).toHaveLength(EXPECTED.fullTime);
    });

    it('renders contract badges', () => {
      render(<Dashboard />);
      const contractBadges = screen
        .getAllByText('contract')
        .filter((el) => el.classList.contains('badge--contract'));
      expect(contractBadges).toHaveLength(2);
    });

    it('renders a part-time badge', () => {
      render(<Dashboard />);
      const partTimeBadges = screen
        .getAllByText('part-time')
        .filter((el) => el.classList.contains('badge--part-time'));
      expect(partTimeBadges).toHaveLength(1);
    });
  });

  // ── Structure ─────────────────────────────────────────────────────────────────
  describe('structure', () => {
    it('renders the root dashboard element', () => {
      const { container } = render(<Dashboard />);
      expect(container.firstChild).toHaveClass('dashboard');
    });

    it('renders the header section', () => {
      const { container } = render(<Dashboard />);
      expect(container.querySelector('.dashboard__header')).toBeInTheDocument();
    });

    it('renders the stats section', () => {
      const { container } = render(<Dashboard />);
      expect(container.querySelector('.dashboard__stats')).toBeInTheDocument();
    });
  });
});
