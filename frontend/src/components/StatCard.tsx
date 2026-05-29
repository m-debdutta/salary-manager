import styles from './Dashboard.module.css';

interface StatCardProps {
  label: string;
  value: string | number | undefined;
  loading?: boolean;
}

export default function StatCard({ label, value, loading = false }: StatCardProps) {
  return (
    <div className={styles.statCard} data-testid="stat-card">
      <span className={styles.statValue}>{loading ? '—' : (value ?? '—')}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
