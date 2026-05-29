import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchSalaryDistribution, type SalaryDistributionRow } from '../api/analytics';
import styles from './chart.module.css';

interface TooltipPayload {
  payload: SalaryDistributionRow;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
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

export default function SalaryDistributionChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics', 'salary-distribution'],
    queryFn: fetchSalaryDistribution,
  });

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionTitle}>Salary Distribution</p>
        {data && <span className={styles.sectionCount}>{data.length} ranges</span>}
      </div>

      {isError && <p className={styles.error}>Failed to load chart data.</p>}
      {isLoading && <p className={styles.loading}>Loading chart…</p>}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 4, right: 32, left: 8, bottom: 56 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11, fill: '#374151' }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                label={{
                  value: 'Employees',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 8,
                  style: { fontSize: 11, fill: '#6b7280' },
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(99,102,241,0.08)' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
