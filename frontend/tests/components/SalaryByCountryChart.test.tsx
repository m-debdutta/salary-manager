import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import SalaryByCountryChart from '../../src/components/SalaryByCountryChart';
import { fetchSalaryByCountry } from '../../src/api/analytics';
import type { SalaryByCountryRow } from '../../src/api/analytics';

vi.mock('../../src/api/analytics');

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
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

const MOCK_DATA: SalaryByCountryRow[] = [
  { country: 'USA', count: 10, min: 80000, max: 150000, avg: 120000, median: 115000 },
  { country: 'UK', count: 5, min: 70000, max: 130000, avg: 100000, median: 95000 },
  { country: 'Germany', count: 8, min: 75000, max: 140000, avg: 110000, median: 105000 },
];

const renderChart = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SalaryByCountryChart />
    </QueryClientProvider>,
  );
};

describe('SalaryByCountryChart', () => {
  beforeEach(() => {
    vi.mocked(fetchSalaryByCountry).mockResolvedValue(MOCK_DATA);
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
      await screen.findByText('3 countries');
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches error snapshot', async () => {
      vi.mocked(fetchSalaryByCountry).mockRejectedValueOnce(new Error('Network Error'));
      const { asFragment } = renderChart();
      await screen.findByText('Failed to load chart data.');
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Title ──────────────────────────────────────────────────────────────────
  describe('title', () => {
    it('always renders the section title', () => {
      renderChart();
      expect(screen.getByText('Avg. Salary by Country')).toBeInTheDocument();
    });

    it('renders the title even while loading', () => {
      renderChart();
      expect(screen.getByText('Avg. Salary by Country')).toBeInTheDocument();
      expect(screen.getByText('Loading chart…')).toBeInTheDocument();
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  describe('loading state', () => {
    it('shows a loading message while fetching', () => {
      renderChart();
      expect(screen.getByText('Loading chart…')).toBeInTheDocument();
    });

    it('does not show the country count badge while loading', () => {
      renderChart();
      expect(screen.queryByText(/countries/)).not.toBeInTheDocument();
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
    it('shows the correct country count badge', async () => {
      renderChart();
      expect(await screen.findByText('3 countries')).toBeInTheDocument();
    });

    it('renders the chart container', async () => {
      const { container } = renderChart();
      await waitFor(() =>
        expect(
          container.querySelector('[data-testid="responsive-container"]'),
        ).toBeInTheDocument(),
      );
    });

    it('does not show the loading message after data loads', async () => {
      renderChart();
      await screen.findByText('3 countries');
      expect(screen.queryByText('Loading chart…')).not.toBeInTheDocument();
    });

    it('does not show an error message when data loads successfully', async () => {
      renderChart();
      await screen.findByText('3 countries');
      expect(screen.queryByText('Failed to load chart data.')).not.toBeInTheDocument();
    });
  });

  // ── Error state ────────────────────────────────────────────────────────────
  describe('error state', () => {
    it('shows an error message when the fetch fails', async () => {
      vi.mocked(fetchSalaryByCountry).mockRejectedValueOnce(new Error('Network Error'));
      renderChart();
      expect(await screen.findByText('Failed to load chart data.')).toBeInTheDocument();
    });

    it('does not render the chart container on error', async () => {
      vi.mocked(fetchSalaryByCountry).mockRejectedValueOnce(new Error('Network Error'));
      const { container } = renderChart();
      await screen.findByText('Failed to load chart data.');
      expect(
        container.querySelector('[data-testid="responsive-container"]'),
      ).not.toBeInTheDocument();
    });

    it('does not show the loading message on error', async () => {
      vi.mocked(fetchSalaryByCountry).mockRejectedValueOnce(new Error('Network Error'));
      renderChart();
      await screen.findByText('Failed to load chart data.');
      expect(screen.queryByText('Loading chart…')).not.toBeInTheDocument();
    });
  });
});
