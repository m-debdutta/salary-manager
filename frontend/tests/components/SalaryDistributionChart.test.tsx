import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import SalaryDistributionChart from '../../src/components/SalaryDistributionChart';
import { fetchSalaryDistribution } from '../../src/api/analytics';
import type { SalaryDistributionRow } from '../../src/api/analytics';

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
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const MOCK_DATA: SalaryDistributionRow[] = [
  { range: '$50k–$75k', min: 50000, max: 75000, count: 5 },
  { range: '$75k–$100k', min: 75000, max: 100000, count: 18 },
  { range: '$100k–$125k', min: 100000, max: 125000, count: 24 },
  { range: '$125k–$150k', min: 125000, max: 150000, count: 12 },
];

const renderChart = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SalaryDistributionChart />
    </QueryClientProvider>,
  );
};

describe('SalaryDistributionChart', () => {
  beforeEach(() => {
    vi.mocked(fetchSalaryDistribution).mockResolvedValue(MOCK_DATA);
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
      await screen.findByText('4 ranges');
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches error snapshot', async () => {
      vi.mocked(fetchSalaryDistribution).mockRejectedValueOnce(
        new Error('Network Error'),
      );
      const { asFragment } = renderChart();
      await screen.findByText('Failed to load chart data.');
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Title ──────────────────────────────────────────────────────────────────
  describe('title', () => {
    it('always renders the section title', () => {
      renderChart();
      expect(screen.getByText('Salary Distribution')).toBeInTheDocument();
    });

    it('renders the title even while loading', () => {
      renderChart();
      expect(screen.getByText('Salary Distribution')).toBeInTheDocument();
      expect(screen.getByText('Loading chart…')).toBeInTheDocument();
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  describe('loading state', () => {
    it('shows a loading message while fetching', () => {
      renderChart();
      expect(screen.getByText('Loading chart…')).toBeInTheDocument();
    });

    it('does not show the range count badge while loading', () => {
      renderChart();
      expect(screen.queryByText(/ranges/)).not.toBeInTheDocument();
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
    it('shows the correct range count badge', async () => {
      renderChart();
      expect(await screen.findByText('4 ranges')).toBeInTheDocument();
    });

    it('renders the chart container', async () => {
      const { container } = renderChart();
      await waitFor(() =>
        expect(
          container.querySelector('[data-testid="responsive-container"]'),
        ).toBeInTheDocument(),
      );
    });

    it('passes all items to the BarChart without sorting', async () => {
      const { container } = renderChart();
      await waitFor(() =>
        expect(container.querySelector('[data-testid="bar-chart"]')).toBeInTheDocument(),
      );
      expect(container.querySelector('[data-testid="bar-chart"]')).toHaveAttribute(
        'data-length',
        '4',
      );
    });

    it('does not show the loading message after data loads', async () => {
      renderChart();
      await screen.findByText('4 ranges');
      expect(screen.queryByText('Loading chart…')).not.toBeInTheDocument();
    });

    it('does not show an error message when data loads successfully', async () => {
      renderChart();
      await screen.findByText('4 ranges');
      expect(screen.queryByText('Failed to load chart data.')).not.toBeInTheDocument();
    });

    it('calls fetchSalaryDistribution once on mount', async () => {
      renderChart();
      await screen.findByText('4 ranges');
      expect(vi.mocked(fetchSalaryDistribution)).toHaveBeenCalledTimes(1);
    });
  });

  // ── Empty data ─────────────────────────────────────────────────────────────
  describe('empty data', () => {
    it('does not render the chart container when data is an empty array', async () => {
      vi.mocked(fetchSalaryDistribution).mockResolvedValueOnce([]);
      const { container } = renderChart();
      // badge shows 0 ranges but no chart
      await screen.findByText('0 ranges');
      expect(
        container.querySelector('[data-testid="responsive-container"]'),
      ).not.toBeInTheDocument();
    });
  });

  // ── Error state ────────────────────────────────────────────────────────────
  describe('error state', () => {
    it('shows an error message when the fetch fails', async () => {
      vi.mocked(fetchSalaryDistribution).mockRejectedValueOnce(
        new Error('Network Error'),
      );
      renderChart();
      expect(await screen.findByText('Failed to load chart data.')).toBeInTheDocument();
    });

    it('does not render the chart container on error', async () => {
      vi.mocked(fetchSalaryDistribution).mockRejectedValueOnce(
        new Error('Network Error'),
      );
      const { container } = renderChart();
      await screen.findByText('Failed to load chart data.');
      expect(
        container.querySelector('[data-testid="responsive-container"]'),
      ).not.toBeInTheDocument();
    });

    it('does not show the loading message on error', async () => {
      vi.mocked(fetchSalaryDistribution).mockRejectedValueOnce(
        new Error('Network Error'),
      );
      renderChart();
      await screen.findByText('Failed to load chart data.');
      expect(screen.queryByText('Loading chart…')).not.toBeInTheDocument();
    });
  });
});
