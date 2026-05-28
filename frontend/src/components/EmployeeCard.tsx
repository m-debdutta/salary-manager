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
  onClick?: () => void;
  onEdit?: () => void;
}

const employmentTypeBadgeColor: Record<string, string> = {
  'full-time': 'badge badge--full-time',
  'part-time': 'badge badge--part-time',
  contract: 'badge badge--contract',
};

export const EmployeeCard = ({ employee, onClick, onEdit }: EmployeeCardProps) => {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const badgeClass =
    employmentTypeBadgeColor[employee.employmentType.toLowerCase()] ??
    'badge badge--default';

  return (
    <div
      className="employee-card"
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {onEdit && (
        <button
          type="button"
          className="employee-card__edit-btn"
          aria-label={`Edit ${fullName}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}
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
