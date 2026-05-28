import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { fetchSalaryByCountry, type SalaryByCountryRow } from '../api/analytics';
import styles from './SalaryByCountryChart.module.css';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

interface TooltipPayload {
  payload: SalaryByCountryRow;
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
      <p className={styles.tooltipTitle}>{row.country}</p>
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

export default function SalaryByCountryChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics', 'salary-by-country'],
    queryFn: fetchSalaryByCountry,
  });

  const sorted = data ? [...data].sort((a, b) => b.avg - a.avg) : [];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionTitle}>Avg. Salary by Country</p>
        {data && <span className={styles.sectionCount}>{data.length} countries</span>}
      </div>

      {isError && <p className={styles.error}>Failed to load chart data.</p>}
      {isLoading && <p className={styles.loading}>Loading chart…</p>}

      {!isLoading && !isError && sorted.length > 0 && (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={Math.max(320, sorted.length * 36)}>
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis
                type="category"
                dataKey="country"
                width={130}
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(99,102,241,0.08)' }}
              />
              <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                {sorted.map((entry, index) => (
                  <Cell
                    key={entry.country}
                    fill={`hsl(${230 + index * (60 / Math.max(sorted.length, 1))}, 70%, ${58 - index * (12 / Math.max(sorted.length, 1))}%)`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
