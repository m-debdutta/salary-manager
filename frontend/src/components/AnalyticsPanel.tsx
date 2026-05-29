import { useState } from 'react';
import SalaryByCountryChart from './SalaryByCountryChart';
import SalaryByJobTitleChart from './SalaryByJobTitleChart';
import DepartmentSummaryChart from './DepartmentSummaryChart';
import styles from './AnalyticsPanel.module.css';

type ChartId = 'country' | 'job-title' |'department';

const TABS: { id: ChartId; label: string }[] = [
  { id: 'country', label: 'By Country' },
  { id: 'job-title', label: 'By Job Title' },
  { id: 'department', label: 'By Department' },
];

export default function AnalyticsPanel() {
  const [active, setActive] = useState<ChartId>('country');

  return (
    <div className={styles.panel}>
      <nav className={styles.tabs} role="tablist" aria-label="Analytics charts">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            className={`${styles.tab} ${active === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div role="tabpanel">
        {active === 'country' && <SalaryByCountryChart />}
        {active === 'job-title' && <SalaryByJobTitleChart />}
        {active === 'department' && <DepartmentSummaryChart />}
      </div>
    </div>
  );
}
