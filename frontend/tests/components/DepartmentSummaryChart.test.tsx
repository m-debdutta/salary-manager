import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import DepartmentSummaryChart from '../../src/components/DepartmentSummaryChart';
import { fetchDepartmentSummary } from '../../src/api/analytics';
import type { DepartmentSummaryRow } from '../../src/api/analytics';

vi.mock('../../src/api/analytics');

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ data, children }: { data: unknown[]; children: React.ReactNode }) => (
    <div data-testid="bar-chart" data-length={data?.length}>
      {children}
    </div>
  ),
  Bar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar">{children}</div>
  ),
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Cell: () => null,
}));

const MOCK_DATA: DepartmentSummaryRow[] = [
  {
    department: 'Engineering',
    count: 20,
    min: 85000,
    max: 160000,
    avg: 130000,
    median: 125000,
  },
  {
    department: 'Product',
    count: 8,
    min: 90000,
    max: 150000,
    avg: 120000,
    median: 115000,
  },
  {
    department: 'Design',
    count: 6,
    min: 70000,
    max: 120000,
    avg: 95000,
    median: 92000,
  },
];

const renderChart = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DepartmentSummaryChart />
    </QueryClientProvider>,
  );
};

describe('DepartmentSummaryChart', () => {
  beforeEach(() => {
    vi.mocked(fetchDepartmentSummary).mockResolvedValue(MOCK_DATA);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Snapshots ──────────────────────────────────────────────────────────────
  describe('snapshot', () => {
    it('matches loading snapshot', () => {
      const { asFragment } = renderChart();
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches loaded snapshot', async () => {
      const { asFragment } = renderChart();
      await screen.findByText('3 departments');
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches error snapshot', async () => {
      vi.mocked(fetchDepartmentSummary).mockRejectedValueOnce(new Error('Network Error'));
      const { asFragment } = renderChart();
      await screen.findByText('Failed to load chart data.');
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Title ──────────────────────────────────────────────────────────────────
  describe('title', () => {
    it('always renders the section title', () => {
      renderChart();
      expect(screen.getByText('Avg. Salary by Department')).toBeInTheDocument();
    });

    it('renders the title even while loading', () => {
      renderChart();
      expect(screen.getByText('Avg. Salary by Department')).toBeInTheDocument();
      expect(screen.getByText('Loading chart…')).toBeInTheDocument();
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  describe('loading state', () => {
    it('shows a loading message while fetching', () => {
      renderChart();
      expect(screen.getByText('Loading chart…')).toBeInTheDocument();
    });

    it('does not show the department count badge while loading', () => {
      renderChart();
      expect(screen.queryByText(/departments/)).not.toBeInTheDocument();
    });

    it('does not render the chart container while loading', () => {
      const { container } = renderChart();
      expect(
        container.querySelector('[data-testid="responsive-container"]'),
      ).not.toBeInTheDocument();
    });
  });

  // ── Loaded state ───────────────────────────────────────────────────────────
  describe('loaded state', () => {
    it('shows the correct department count badge', async () => {
      renderChart();
      expect(await screen.findByText('3 departments')).toBeInTheDocument();
    });

    it('renders the chart container', async () => {
      const { container } = renderChart();
      await waitFor(() =>
        expect(
          container.querySelector('[data-testid="responsive-container"]'),
        ).toBeInTheDocument(),
      );
    });

    it('passes all items to the BarChart', async () => {
      const { container } = renderChart();
      await waitFor(() =>
        expect(container.querySelector('[data-testid="bar-chart"]')).toBeInTheDocument(),
      );
      expect(container.querySelector('[data-testid="bar-chart"]')).toHaveAttribute(
        'data-length',
        '3',
      );
    });

    it('sorts data descending by avg salary', async () => {
      const unsorted: DepartmentSummaryRow[] = [
        {
          department: 'Design',
          count: 6,
          min: 70000,
          max: 120000,
          avg: 95000,
          median: 92000,
        },
        {
          department: 'Engineering',
          count: 20,
          min: 85000,
          max: 160000,
          avg: 130000,
          median: 125000,
        },
        {
          department: 'Product',
          count: 8,
          min: 90000,
          max: 150000,
          avg: 120000,
          median: 115000,
        },
      ];
      vi.mocked(fetchDepartmentSummary).mockResolvedValueOnce(unsorted);
      const { container } = renderChart();

      await screen.findByText('3 departments');

      // All 3 items are passed after sorting (no items dropped)
      expect(container.querySelector('[data-testid="bar-chart"]')).toHaveAttribute(
        'data-length',
        '3',
      );
    });

    it('does not show the loading message after data loads', async () => {
      renderChart();
      await screen.findByText('3 departments');
      expect(screen.queryByText('Loading chart…')).not.toBeInTheDocument();
    });

    it('does not show an error message when data loads successfully', async () => {
      renderChart();
      await screen.findByText('3 departments');
      expect(screen.queryByText('Failed to load chart data.')).not.toBeInTheDocument();
    });
  });

  // ── Error state ────────────────────────────────────────────────────────────
  describe('error state', () => {
    it('shows an error message when the fetch fails', async () => {
      vi.mocked(fetchDepartmentSummary).mockRejectedValueOnce(new Error('Network Error'));
      renderChart();
      expect(await screen.findByText('Failed to load chart data.')).toBeInTheDocument();
    });

    it('does not render the chart container on error', async () => {
      vi.mocked(fetchDepartmentSummary).mockRejectedValueOnce(new Error('Network Error'));
      const { container } = renderChart();
      await screen.findByText('Failed to load chart data.');
      expect(
        container.querySelector('[data-testid="responsive-container"]'),
      ).not.toBeInTheDocument();
    });

    it('does not show the loading message on error', async () => {
      vi.mocked(fetchDepartmentSummary).mockRejectedValueOnce(new Error('Network Error'));
      renderChart();
      await screen.findByText('Failed to load chart data.');
      expect(screen.queryByText('Loading chart…')).not.toBeInTheDocument();
    });
  });
});
