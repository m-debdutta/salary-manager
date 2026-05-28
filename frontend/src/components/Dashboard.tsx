import { type Employee, EmployeeCard } from './EmployeeCard';

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1,
    firstName: 'Alice',
    lastName: 'Johnson',
    jobTitle: 'Software Engineer',
    country: 'USA',
    salary: 120000,
    department: 'Engineering',
    hireDate: '2021-03-15',
    employmentType: 'full-time',
  },
  {
    id: 2,
    firstName: 'Bob',
    lastName: 'Smith',
    jobTitle: 'Product Manager',
    country: 'UK',
    salary: 105000,
    department: 'Product',
    hireDate: '2020-07-01',
    employmentType: 'full-time',
  },
  {
    id: 3,
    firstName: 'Clara',
    lastName: 'Nguyen',
    jobTitle: 'UX Designer',
    country: 'Canada',
    salary: 90000,
    department: 'Design',
    hireDate: '2022-01-10',
    employmentType: 'full-time',
  },
  {
    id: 4,
    firstName: 'David',
    lastName: 'Müller',
    jobTitle: 'Backend Developer',
    country: 'Germany',
    salary: 98000,
    department: 'Engineering',
    hireDate: '2019-11-20',
    employmentType: 'contract',
  },
  {
    id: 5,
    firstName: 'Eva',
    lastName: 'Martinez',
    jobTitle: 'Data Analyst',
    country: 'Spain',
    salary: 75000,
    department: 'Analytics',
    hireDate: '2023-05-08',
    employmentType: 'part-time',
  },
  {
    id: 6,
    firstName: 'Frank',
    lastName: 'Lee',
    jobTitle: 'DevOps Engineer',
    country: 'Australia',
    salary: 115000,
    department: 'Infrastructure',
    hireDate: '2021-09-30',
    employmentType: 'full-time',
  },
  {
    id: 7,
    firstName: 'Grace',
    lastName: 'Patel',
    jobTitle: 'HR Manager',
    country: 'India',
    salary: 70000,
    department: 'Human Resources',
    hireDate: '2018-04-22',
    employmentType: 'full-time',
  },
  {
    id: 8,
    firstName: 'Henry',
    lastName: 'Dubois',
    jobTitle: 'Frontend Developer',
    country: 'France',
    salary: 88000,
    department: 'Engineering',
    hireDate: '2022-08-14',
    employmentType: 'contract',
  },
];

const departments = new Set(MOCK_EMPLOYEES.map((e) => e.department).filter(Boolean)).size;

export default function Dashboard() {
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
          <span className="stat-card__value">{MOCK_EMPLOYEES.length}</span>
          <span className="stat-card__label">Total Employees</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{departments}</span>
          <span className="stat-card__label">Departments</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">
            {MOCK_EMPLOYEES.filter((e) => e.employmentType === 'full-time').length}
          </span>
          <span className="stat-card__label">Full-time</span>
        </div>
      </div>
      <div className="dashboard__section-header">
        <p className="dashboard__section-title">Employees</p>
        <span className="dashboard__section-count">{MOCK_EMPLOYEES.length}</span>
      </div>
      <div className="dashboard__grid">
        {MOCK_EMPLOYEES.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
}
