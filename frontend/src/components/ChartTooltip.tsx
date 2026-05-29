import styles from './chart.module.css';

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

// ── Salary breakdown tooltip (Country / Job Title / Department charts) ────────

interface SalaryPayloadRow {
  avg: number;
  median: number;
  min: number;
  max: number;
  count: number;
  [key: string]: unknown;
}

interface SalaryBreakdownTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: SalaryPayloadRow }>;
  /** Key on the payload row to use as the tooltip title (e.g. "country", "jobTitle") */
  titleKey: string;
}

export function SalaryBreakdownTooltip({
  active,
  payload,
  titleKey,
}: SalaryBreakdownTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{String(row[titleKey])}</p>
      <p>
        <span className={styles.tooltipLabel}>Avg:</span> {formatCurrency(row.avg)}
      </p>
      <p>
        <span className={styles.tooltipLabel}>Median:</span> {formatCurrency(row.median)}
      </p>
      <p>
        <span className={styles.tooltipLabel}>Min:</span> {formatCurrency(row.min)}
      </p>
      <p>
        <span className={styles.tooltipLabel}>Max:</span> {formatCurrency(row.max)}
      </p>
      <p>
        <span className={styles.tooltipLabel}>Employees:</span> {row.count}
      </p>
    </div>
  );
}

// ── Distribution tooltip (Salary Distribution chart) ─────────────────────────

interface DistributionPayloadRow {
  range: string;
  count: number;
}

interface DistributionTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DistributionPayloadRow }>;
}

export function DistributionTooltip({ active, payload }: DistributionTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{row.range}</p>
      <p>
        <span className={styles.tooltipLabel}>Employees:</span> {row.count}
      </p>
    </div>
  );
}
