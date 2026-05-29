import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnalyticsPanel from '../../src/components/AnalyticsPanel';

vi.mock('../../src/components/SalaryByCountryChart', () => ({
  default: () => <div data-testid="salary-by-country-chart" />,
}));
vi.mock('../../src/components/SalaryByJobTitleChart', () => ({
  default: () => <div data-testid="salary-by-job-title-chart" />,
}));
vi.mock('../../src/components/DepartmentSummaryChart', () => ({
  default: () => <div data-testid="department-summary-chart" />,
}));

describe('AnalyticsPanel', () => {
  // ── Snapshot ──────────────────────────────────────────────────────────────
  describe('snapshot', () => {
    it('matches default (By Country tab active) snapshot', () => {
      const { asFragment } = render(<AnalyticsPanel />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot after switching to By Job Title', () => {
      const { asFragment } = render(<AnalyticsPanel />);
      fireEvent.click(screen.getByRole('tab', { name: 'By Job Title' }));
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Tabs ───────────────────────────────────────────────────────────────────
  describe('tabs', () => {
    it('renders all four tab buttons', () => {
      render(<AnalyticsPanel />);
      expect(screen.getByRole('tab', { name: 'By Country' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'By Job Title' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'By Department' })).toBeInTheDocument();
    });

    it('marks "By Country" as selected by default', () => {
      render(<AnalyticsPanel />);
      expect(screen.getByRole('tab', { name: 'By Country' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('marks non-active tabs as not selected by default', () => {
      render(<AnalyticsPanel />);
      expect(screen.getByRole('tab', { name: 'By Job Title' })).toHaveAttribute(
        'aria-selected',
        'false',
      );
    });
  });

  // ── Default view ───────────────────────────────────────────────────────────
  describe('default view', () => {
    it('renders the SalaryByCountryChart on initial load', () => {
      render(<AnalyticsPanel />);
      expect(screen.getByTestId('salary-by-country-chart')).toBeInTheDocument();
    });

    it('does not render other charts on initial load', () => {
      render(<AnalyticsPanel />);
      expect(screen.queryByTestId('salary-by-job-title-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('department-summary-chart')).not.toBeInTheDocument();
    });
  });

  // ── Tab switching ──────────────────────────────────────────────────────────
  describe('tab switching', () => {
    it('switches to SalaryByJobTitleChart when "By Job Title" is clicked', () => {
      render(<AnalyticsPanel />);
      fireEvent.click(screen.getByRole('tab', { name: 'By Job Title' }));
      expect(screen.getByTestId('salary-by-job-title-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('salary-by-country-chart')).not.toBeInTheDocument();
    });

    it('marks "By Job Title" as selected after clicking it', () => {
      render(<AnalyticsPanel />);
      fireEvent.click(screen.getByRole('tab', { name: 'By Job Title' }));
      expect(screen.getByRole('tab', { name: 'By Job Title' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'By Country' })).toHaveAttribute(
        'aria-selected',
        'false',
      );
    });

    it('switches to DepartmentSummaryChart when "By Department" is clicked', () => {
      render(<AnalyticsPanel />);
      fireEvent.click(screen.getByRole('tab', { name: 'By Department' }));
      expect(screen.getByTestId('department-summary-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('salary-by-country-chart')).not.toBeInTheDocument();
    });

    it('can switch back to "By Country" after navigating away', () => {
      render(<AnalyticsPanel />);
      fireEvent.click(screen.getByRole('tab', { name: 'By Department' }));
      fireEvent.click(screen.getByRole('tab', { name: 'By Country' }));
      expect(screen.getByTestId('salary-by-country-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('salary-by-job-title-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('department-summary-chart')).not.toBeInTheDocument();
    });
  });
});
