export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  country: string;
  salary: number;
  department: string | null;
  hireDate: string;
  employmentType: string;
}

interface EmployeeCardProps {
  employee: Employee;
}

const employmentTypeBadgeColor: Record<string, string> = {
  'full-time': 'badge badge--full-time',
  'part-time': 'badge badge--part-time',
  contract: 'badge badge--contract',
};

export const EmployeeCard = ({ employee }: EmployeeCardProps) => {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const badgeClass =
    employmentTypeBadgeColor[employee.employmentType] ?? 'badge badge--default';

  return (
    <div className="employee-card">
      <div className="employee-card__header">
        <div className="employee-card__avatar">{initials}</div>
        <div className="employee-card__header-info">
          <h3 className="employee-card__name">{fullName}</h3>
          <p className="employee-card__title">{employee.jobTitle}</p>
        </div>
        <div className="employee-card__footer">
          <span className={badgeClass}>{employee.employmentType}</span>
        </div>
      </div>
    </div>
  );
};
