import { useQuery } from '@tanstack/react-query';
import { fetchEmployees } from '../api/employees';
import { EmployeeCard } from './EmployeeCard';

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['employees'],
    queryFn: () => fetchEmployees(),
  });

  const employees = data?.employees ?? [];
  const total = data?.total ?? 0;
  const departments = new Set(employees.map((e) => e.department).filter(Boolean)).size;
  const fullTimeCount = employees.filter((e) => e.employmentType === 'full-time').length;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Salary Manager</h1>
          <p className="dashboard__subtitle">Employee Overview</p>
        </div>
      </header>

      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__value">{isLoading ? '—' : total}</span>
          <span className="stat-card__label">Total Employees</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{isLoading ? '—' : departments}</span>
          <span className="stat-card__label">Departments</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{isLoading ? '—' : fullTimeCount}</span>
          <span className="stat-card__label">Full-time</span>
        </div>
      </div>

      <div className="dashboard__section-header">
        <p className="dashboard__section-title">Employees</p>
        {!isLoading && <span className="dashboard__section-count">{total}</span>}
      </div>

      {isError && (
        <p className="dashboard__error">Failed to load employees. Please try again.</p>
      )}

      {isLoading ? (
        <p className="dashboard__loading">Loading employees…</p>
      ) : (
        <div className="dashboard__grid">
          {employees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}
    </div>
  );
}
