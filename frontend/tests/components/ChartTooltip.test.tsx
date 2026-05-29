import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  SalaryBreakdownTooltip,
  DistributionTooltip,
} from '../../src/components/ChartTooltip';

const salaryRow = {
  country: 'USA',
  avg: 120000,
  median: 115000,
  min: 80000,
  max: 150000,
  count: 10,
};

const salaryPayload = [{ payload: salaryRow }];

describe('SalaryBreakdownTooltip', () => {
  // ── Null cases ───────────────────────────────────────────────────────────────
  describe('null cases', () => {
    it('renders nothing when active is false', () => {
      const { container } = render(
        <SalaryBreakdownTooltip
          active={false}
          payload={salaryPayload}
          titleKey="country"
        />,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when payload is empty', () => {
      const { container } = render(
        <SalaryBreakdownTooltip active={true} payload={[]} titleKey="country" />,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when payload is undefined', () => {
      const { container } = render(
        <SalaryBreakdownTooltip active={true} titleKey="country" />,
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  // ── Title ────────────────────────────────────────────────────────────────────
  describe('title', () => {
    it('renders the value from titleKey="country"', () => {
      render(
        <SalaryBreakdownTooltip
          active={true}
          payload={salaryPayload}
          titleKey="country"
        />,
      );
      expect(screen.getByText('USA')).toBeInTheDocument();
    });

    it('renders the value from titleKey="jobTitle"', () => {
      const payload = [{ payload: { ...salaryRow, jobTitle: 'Software Engineer' } }];
      render(
        <SalaryBreakdownTooltip active={true} payload={payload} titleKey="jobTitle" />,
      );
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('renders the value from titleKey="department"', () => {
      const payload = [{ payload: { ...salaryRow, department: 'Engineering' } }];
      render(
        <SalaryBreakdownTooltip active={true} payload={payload} titleKey="department" />,
      );
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });
  });

  // ── Currency formatting ──────────────────────────────────────────────────────
  describe('currency formatting', () => {
    it('formats and renders the avg salary', () => {
      render(
        <SalaryBreakdownTooltip
          active={true}
          payload={salaryPayload}
          titleKey="country"
        />,
      );
      expect(screen.getByText('$120,000')).toBeInTheDocument();
    });

    it('formats and renders the median salary', () => {
      render(
        <SalaryBreakdownTooltip
          active={true}
          payload={salaryPayload}
          titleKey="country"
        />,
      );
      expect(screen.getByText('$115,000')).toBeInTheDocument();
    });

    it('formats and renders the min salary', () => {
      render(
        <SalaryBreakdownTooltip
          active={true}
          payload={salaryPayload}
          titleKey="country"
        />,
      );
      expect(screen.getByText('$80,000')).toBeInTheDocument();
    });

    it('formats and renders the max salary', () => {
      render(
        <SalaryBreakdownTooltip
          active={true}
          payload={salaryPayload}
          titleKey="country"
        />,
      );
      expect(screen.getByText('$150,000')).toBeInTheDocument();
    });
  });

  // ── Labels and count ─────────────────────────────────────────────────────────
  describe('labels and count', () => {
    it('renders all five labels', () => {
      render(
        <SalaryBreakdownTooltip
          active={true}
          payload={salaryPayload}
          titleKey="country"
        />,
      );
      expect(screen.getByText('Avg:')).toBeInTheDocument();
      expect(screen.getByText('Median:')).toBeInTheDocument();
      expect(screen.getByText('Min:')).toBeInTheDocument();
      expect(screen.getByText('Max:')).toBeInTheDocument();
      expect(screen.getByText('Employees:')).toBeInTheDocument();
    });

    it('renders the employee count', () => {
      render(
        <SalaryBreakdownTooltip
          active={true}
          payload={salaryPayload}
          titleKey="country"
        />,
      );
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });
});

describe('DistributionTooltip', () => {
  const distRow = { range: '$80k–$100k', count: 25 };
  const distPayload = [{ payload: distRow }];

  // ── Null cases ───────────────────────────────────────────────────────────────
  describe('null cases', () => {
    it('renders nothing when active is false', () => {
      const { container } = render(
        <DistributionTooltip active={false} payload={distPayload} />,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when payload is empty', () => {
      const { container } = render(<DistributionTooltip active={true} payload={[]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when payload is undefined', () => {
      const { container } = render(<DistributionTooltip active={true} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  // ── Content ──────────────────────────────────────────────────────────────────
  describe('content', () => {
    it('renders the salary range as the title', () => {
      render(<DistributionTooltip active={true} payload={distPayload} />);
      expect(screen.getByText('$80k–$100k')).toBeInTheDocument();
    });

    it('renders the Employees label', () => {
      render(<DistributionTooltip active={true} payload={distPayload} />);
      expect(screen.getByText('Employees:')).toBeInTheDocument();
    });

    it('renders the employee count', () => {
      render(<DistributionTooltip active={true} payload={distPayload} />);
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });
});
