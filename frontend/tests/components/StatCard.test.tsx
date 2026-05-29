import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from '../../src/components/StatCard';

describe('StatCard', () => {
  // ── Snapshot ────────────────────────────────────────────────────────────────
  describe('snapshot', () => {
    it('matches snapshot with a string value', () => {
      const { asFragment } = render(<StatCard label="Avg Salary" value="$120,000" />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot in loading state', () => {
      const { asFragment } = render(
        <StatCard value={undefined} label="Avg Salary" loading={true} />,
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot with undefined value', () => {
      const { asFragment } = render(<StatCard label="Countries" value={undefined} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Label ────────────────────────────────────────────────────────────────────
  describe('label', () => {
    it('renders the label', () => {
      render(<StatCard label="Avg Salary" value="$120,000" />);
      expect(screen.getByText('Avg Salary')).toBeInTheDocument();
    });
  });

  // ── Value ────────────────────────────────────────────────────────────────────
  describe('value', () => {
    it('renders a string value', () => {
      render(<StatCard label="Avg Salary" value="$120,000" />);
      expect(screen.getByText('$120,000')).toBeInTheDocument();
    });

    it('renders a numeric value', () => {
      render(<StatCard label="Countries" value={42} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders — when value is undefined', () => {
      render(<StatCard label="Countries" value={undefined} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  // ── Loading ───────────────────────────────────────────────────────────────────
  describe('loading', () => {
    it('renders — when loading is true', () => {
      render(<StatCard label="Avg Salary" value="$120,000" loading />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('does not render the value when loading', () => {
      render(<StatCard label="Avg Salary" value="$120,000" loading />);
      expect(screen.queryByText('$120,000')).not.toBeInTheDocument();
    });

    it('renders the value when loading is false', () => {
      render(<StatCard label="Avg Salary" value="$120,000" loading={false} />);
      expect(screen.getByText('$120,000')).toBeInTheDocument();
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────
  describe('accessibility', () => {
    it('has the stat-card test id', () => {
      render(<StatCard label="Avg Salary" value="$120,000" />);
      expect(screen.getByTestId('stat-card')).toBeInTheDocument();
    });
  });
});
