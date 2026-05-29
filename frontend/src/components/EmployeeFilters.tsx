import { Combobox } from './Combobox';
import styles from './Dashboard.module.css';
import { DEPARTMENTS, EMPLOYMENT_TYPES, JOB_TITLES, COUNTRIES } from '../lib/masterData';
import type { EmployeeFilters } from '../hooks/useEmployeeFilters';

interface Props extends EmployeeFilters {
  total: number;
  isLoading: boolean;
}

export default function EmployeeFilters({
  search,
  setSearch,
  department,
  setDepartment,
  jobTitle,
  setJobTitle,
  country,
  setCountry,
  employmentType,
  setEmploymentType,
  clearFilters,
  total,
  isLoading,
}: Props) {
  return (
    <div className={styles.sectionHeader}>
      <p className={styles.sectionTitle}>Employees</p>
      {!isLoading && <span className={styles.sectionCount}>{total}</span>}
      <input
        type="search"
        className={styles.searchInput}
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search employees"
      />
      <Combobox
        value={department}
        onChange={(value) =>
          value === 'All Departments' ? setDepartment('') : setDepartment(value)
        }
        placeholder="All Departments"
        searchable
        options={['All Departments', ...DEPARTMENTS]}
        width="15%"
      />
      <Combobox
        value={jobTitle}
        onChange={(value) =>
          value === 'All Job Titles' ? setJobTitle('') : setJobTitle(value)
        }
        placeholder="All Job Titles"
        searchable
        options={['All Job Titles', ...JOB_TITLES]}
        width="15%"
      />
      <Combobox
        value={country}
        onChange={(value) =>
          value === 'All Countries' ? setCountry('') : setCountry(value)
        }
        placeholder="All Countries"
        searchable
        options={['All Countries', ...COUNTRIES]}
        width="15%"
      />
      <Combobox
        value={employmentType}
        onChange={(value) =>
          value === 'All Employment Types'
            ? setEmploymentType('')
            : setEmploymentType(value)
        }
        placeholder="All Employment Types"
        options={['All Employment Types', ...EMPLOYMENT_TYPES]}
        width="18%"
      />
      <button className={styles.clearFilters} onClick={clearFilters}>
        Clear filters
      </button>
    </div>
  );
}
