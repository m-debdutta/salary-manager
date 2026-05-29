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
import { fetchDepartmentSummary } from '../api/analytics';
import { SalaryBreakdownTooltip } from './ChartTooltip';
import styles from './chart.module.css';

export default function DepartmentSummaryChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics', 'department-summary'],
    queryFn: fetchDepartmentSummary,
  });

  const sorted = data ? [...data].sort((a, b) => b.avg - a.avg) : [];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionTitle}>Avg. Salary by Department</p>
        {data && <span className={styles.sectionCount}>{data.length} departments</span>}
      </div>

      {isError && <p className={styles.error}>Failed to load chart data.</p>}
      {isLoading && <p className={styles.loading}>Loading chart…</p>}

      {!isLoading && !isError && sorted.length > 0 && (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={Math.max(320, sorted.length * 40)}>
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
                dataKey="department"
                width={150}
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <Tooltip
                content={(props: any) => (
                  <SalaryBreakdownTooltip {...props} titleKey="department" />
                )}
                cursor={{ fill: 'rgba(245,158,11,0.08)' }}
              />
              <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                {sorted.map((entry, index) => (
                  <Cell
                    key={entry.department}
                    fill={`hsl(${35 + index * (30 / Math.max(sorted.length, 1))}, 85%, ${58 - index * (12 / Math.max(sorted.length, 1))}%)`}
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
