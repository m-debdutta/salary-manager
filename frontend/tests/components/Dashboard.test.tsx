import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Dashboard from '../../src/components/Dashboard';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../src/api/employees';
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
    vi.mocked(createEmployee).mockResolvedValue(MOCK_EMPLOYEES[0]);
    vi.mocked(updateEmployee).mockResolvedValue(MOCK_EMPLOYEES[0]);
    vi.mocked(deleteEmployee).mockResolvedValue(undefined);
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

  // ── Add employee ──────────────────────────────────────────────────────────────
  describe('add employee', () => {
    it('renders the "+ Add Employee" button', () => {
      renderDashboard();
      expect(screen.getByRole('button', { name: '+ Add Employee' })).toBeInTheDocument();
    });

    it('opens the modal when the button is clicked', () => {
      renderDashboard();
      fireEvent.click(screen.getByRole('button', { name: '+ Add Employee' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Add Employee' })).toBeInTheDocument();
    });

    it('closes the modal when the × button is clicked', () => {
      renderDashboard();
      fireEvent.click(screen.getByRole('button', { name: '+ Add Employee' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes the modal when Cancel is clicked', () => {
      renderDashboard();
      fireEvent.click(screen.getByRole('button', { name: '+ Add Employee' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // ── Employee details modal ─────────────────────────────────────────────────────
  describe('employee details modal', () => {
    it('opens the details modal when an employee card is clicked', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('heading', { name: 'Alice Johnson' }));
      expect(
        screen.getByRole('heading', { name: 'Employee Details' }),
      ).toBeInTheDocument();
    });

    it('shows the selected employee details in the modal', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('heading', { name: 'Alice Johnson' }));
      const dialog = screen.getByRole('dialog', { name: 'Employee Details' });
      expect(within(dialog).getByText('$120,000')).toBeInTheDocument();
    });

    it('closes the details modal when the × button is clicked', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('heading', { name: 'Alice Johnson' }));
      expect(
        screen.getByRole('heading', { name: 'Employee Details' }),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(
        screen.queryByRole('heading', { name: 'Employee Details' }),
      ).not.toBeInTheDocument();
    });

    it('updates the modal when a different employee card is clicked', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('heading', { name: 'Alice Johnson' }));
      expect(screen.getByText('$120,000')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      fireEvent.click(screen.getByRole('heading', { name: 'Bob Smith' }));
      expect(screen.getByText('$105,000')).toBeInTheDocument();
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

  // ── Edit employee ─────────────────────────────────────────────────────────────
  describe('edit employee', () => {
    it('opens the edit form when "Edit Employee" is clicked in the details modal', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('heading', { name: 'Alice Johnson' }));
      expect(
        screen.getByRole('heading', { name: 'Employee Details' }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Edit Employee' }));

      expect(screen.getByRole('heading', { name: 'Edit Employee' })).toBeInTheDocument();
    });

    it('closes the details modal when the edit form opens', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('heading', { name: 'Alice Johnson' }));
      fireEvent.click(screen.getByRole('button', { name: 'Edit Employee' }));

      expect(
        screen.queryByRole('heading', { name: 'Employee Details' }),
      ).not.toBeInTheDocument();
    });

    it('pre-populates the edit form with the selected employee', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('heading', { name: 'Alice Johnson' }));
      fireEvent.click(screen.getByRole('button', { name: 'Edit Employee' }));

      expect(screen.getByLabelText('First Name')).toHaveValue('Alice');
      expect(screen.getByLabelText('Last Name')).toHaveValue('Johnson');
    });

    it('calls updateEmployee when the edit form is submitted', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('heading', { name: 'Alice Johnson' }));
      fireEvent.click(screen.getByRole('button', { name: 'Edit Employee' }));
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => expect(vi.mocked(updateEmployee)).toHaveBeenCalled());
    });

    it('closes the edit form after a successful update', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('heading', { name: 'Alice Johnson' }));
      fireEvent.click(screen.getByRole('button', { name: 'Edit Employee' }));
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() =>
        expect(
          screen.queryByRole('heading', { name: 'Edit Employee' }),
        ).not.toBeInTheDocument(),
      );
    });

    it('opens the edit form when the edit button on a card is clicked', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('button', { name: 'Edit Alice Johnson' }));

      expect(screen.getByRole('heading', { name: 'Edit Employee' })).toBeInTheDocument();
      expect(screen.getByLabelText('First Name')).toHaveValue('Alice');
    });

    it('does not open the details modal when the card edit button is clicked', async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('button', { name: 'Edit Alice Johnson' }));

      expect(
        screen.queryByRole('heading', { name: 'Employee Details' }),
      ).not.toBeInTheDocument();
    });
  });

  // ── Delete employee ───────────────────────────────────────────────────────────
  describe('delete employee', () => {
    const openDetailsModal = async () => {
      renderDashboard();
      await screen.findByText('Alice Johnson');
      fireEvent.click(screen.getByRole('heading', { name: 'Alice Johnson' }));
      expect(
        screen.getByRole('heading', { name: 'Employee Details' }),
      ).toBeInTheDocument();
    };

    it('renders a "Delete Employee" button in the details modal', async () => {
      await openDetailsModal();
      expect(screen.getByRole('button', { name: 'Delete Employee' })).toBeInTheDocument();
    });

    it('shows confirmation prompt when "Delete Employee" is clicked', async () => {
      await openDetailsModal();
      fireEvent.click(screen.getByRole('button', { name: 'Delete Employee' }));
      expect(
        screen.getByText(/Delete Alice Johnson\? This cannot be undone\./),
      ).toBeInTheDocument();
    });

    it('calls deleteEmployee with the correct id on confirm', async () => {
      await openDetailsModal();
      fireEvent.click(screen.getByRole('button', { name: 'Delete Employee' }));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm Delete' }));

      await waitFor(() =>
        expect(vi.mocked(deleteEmployee)).toHaveBeenCalledWith(MOCK_EMPLOYEES[0].id),
      );
    });

    it('closes the details modal after successful delete', async () => {
      await openDetailsModal();
      fireEvent.click(screen.getByRole('button', { name: 'Delete Employee' }));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm Delete' }));

      await waitFor(() =>
        expect(
          screen.queryByRole('heading', { name: 'Employee Details' }),
        ).not.toBeInTheDocument(),
      );
    });

    it('does not call deleteEmployee when "Cancel" is clicked', async () => {
      await openDetailsModal();
      fireEvent.click(screen.getByRole('button', { name: 'Delete Employee' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(vi.mocked(deleteEmployee)).not.toHaveBeenCalled();
    });

    it('keeps the modal open when "Cancel" is clicked', async () => {
      await openDetailsModal();
      fireEvent.click(screen.getByRole('button', { name: 'Delete Employee' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(
        screen.getByRole('heading', { name: 'Employee Details' }),
      ).toBeInTheDocument();
    });

    it('refetches employees after successful delete', async () => {
      await openDetailsModal();
      fireEvent.click(screen.getByRole('button', { name: 'Delete Employee' }));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm Delete' }));

      await waitFor(() => expect(vi.mocked(fetchEmployees)).toHaveBeenCalledTimes(2));
    });
  });
});
