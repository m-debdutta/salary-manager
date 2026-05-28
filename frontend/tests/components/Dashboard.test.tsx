import { render, screen, within, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Dashboard from '../../src/components/Dashboard';
import { fetchEmployees } from '../../src/api/employees';
import {
  MOCK_EMPLOYEES_RESPONSE,
  MOCK_EMPLOYEES,
  EMPLOYEE_NAMES,
} from '../fixtures/employees';

vi.mock('../../src/api/employees');

const contractCount = MOCK_EMPLOYEES.filter(
  (e) => e.employmentType === 'contract',
).length;
const partTimeCount = MOCK_EMPLOYEES.filter(
  (e) => e.employmentType === 'part-time',
).length;

const EXPECTED = {
  totalEmployees: MOCK_EMPLOYEES_RESPONSE.total,
  fullTime: MOCK_EMPLOYEES.filter((e) => e.employmentType === 'full-time').length,
};

const renderDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>,
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(fetchEmployees).mockResolvedValue(MOCK_EMPLOYEES_RESPONSE);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Snapshot ─────────────────────────────────────────────────────────────────
  describe('snapshot', () => {
    it('matches loading snapshot', () => {
      const { asFragment } = renderDashboard();
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches loaded snapshot', async () => {
      const { asFragment } = renderDashboard();
      await screen.findByText('Alice Johnson');
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Header ───────────────────────────────────────────────────────────────────
  describe('header', () => {
    it('renders the page title', () => {
      renderDashboard();
      expect(screen.getByRole('heading', { name: 'Salary Manager' })).toBeInTheDocument();
    });

    it('renders the subtitle', () => {
      renderDashboard();
      expect(screen.getByText('Employee Overview')).toBeInTheDocument();
    });
  });

  // ── Loading state ─────────────────────────────────────────────────────────────
  describe('loading state', () => {
    it('shows — placeholder in the stat card', () => {
      renderDashboard();
      expect(screen.getAllByText('—')).toHaveLength(1);
    });

    it('shows a loading message in place of the grid', () => {
      renderDashboard();
      expect(screen.getByText('Loading employees…')).toBeInTheDocument();
    });

    it('does not render the grid while loading', () => {
      const { container } = renderDashboard();
      expect(container.querySelector('.dashboard__grid')).not.toBeInTheDocument();
    });
  });

  // ── Summary stats ─────────────────────────────────────────────────────────────
  describe('summary stats', () => {
    it('shows the correct total employee count', async () => {
      renderDashboard();
      const totalCard = screen
        .getByText('Total Employees')
        .closest('.stat-card') as HTMLElement;
      await waitFor(() =>
        expect(
          within(totalCard).getByText(String(EXPECTED.totalEmployees)),
        ).toBeInTheDocument(),
      );
    });

    it('renders exactly one stat card', () => {
      const { container } = renderDashboard();
      expect(container.querySelectorAll('.stat-card')).toHaveLength(1);
    });
  });

  // ── Employee grid ─────────────────────────────────────────────────────────────
  describe('employee grid', () => {
    it('renders a card for every employee', async () => {
      const { container } = renderDashboard();
      await waitFor(() =>
        expect(container.querySelectorAll('.employee-card')).toHaveLength(
          EXPECTED.totalEmployees,
        ),
      );
    });

    it.each(EMPLOYEE_NAMES)('renders a card for %s', async (name) => {
      renderDashboard();
      expect(await screen.findByRole('heading', { name })).toBeInTheDocument();
    });

    it('renders the grid container after loading', async () => {
      const { container } = renderDashboard();
      await waitFor(() =>
        expect(container.querySelector('.dashboard__grid')).toBeInTheDocument(),
      );
    });
  });

  // ── Employment type badges ────────────────────────────────────────────────────
  describe('employment type badges', () => {
    it('renders full-time badges for the expected employees', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      const badges = screen
        .getAllByText('full-time')
        .filter((el) => el.classList.contains('badge--full-time'));
      expect(badges).toHaveLength(EXPECTED.fullTime);
    });

    it('renders contract badges', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      const badges = screen
        .getAllByText('contract')
        .filter((el) => el.classList.contains('badge--contract'));
      expect(badges).toHaveLength(contractCount);
    });

    it('renders a part-time badge', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      const badges = screen
        .getAllByText('part-time')
        .filter((el) => el.classList.contains('badge--part-time'));
      expect(badges).toHaveLength(partTimeCount);
    });
  });

  // ── Error state ───────────────────────────────────────────────────────────────
  describe('error state', () => {
    it('shows an error message when the fetch fails', async () => {
      vi.mocked(fetchEmployees).mockRejectedValueOnce(new Error('Network Error'));
      renderDashboard();
      expect(
        await screen.findByText('Failed to load employees. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  // ── Structure ─────────────────────────────────────────────────────────────────
  describe('structure', () => {
    it('renders the root dashboard element', () => {
      const { container } = renderDashboard();
      expect(container.firstChild).toHaveClass('dashboard');
    });

    it('renders the header section', () => {
      const { container } = renderDashboard();
      expect(container.querySelector('.dashboard__header')).toBeInTheDocument();
    });

    it('renders the stats section', () => {
      const { container } = renderDashboard();
      expect(container.querySelector('.dashboard__stats')).toBeInTheDocument();
    });
  });
});
