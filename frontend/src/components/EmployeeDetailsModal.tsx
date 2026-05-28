import { useState } from 'react';
import type { Employee } from './EmployeeCard';

interface EmployeeDetailsModalProps {
  employee: Employee;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const employmentTypeBadgeColor: Record<string, string> = {
  'full-time': 'badge badge--full-time',
  'part-time': 'badge badge--part-time',
  contract: 'badge badge--contract',
};

export default function EmployeeDetailsModal({
  employee,
  onClose,
  onEdit,
  onDelete,
}: EmployeeDetailsModalProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const badgeClass =
    employmentTypeBadgeColor[employee.employmentType.toLowerCase()] ??
    'badge badge--default';

  const formattedSalary = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(employee.salary);

  const formattedHireDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(employee.hireDate));

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-details-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal employee-details-modal">
        <div className="modal__header">
          <h2 className="modal__title" id="employee-details-title">
            Employee Details
          </h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="employee-details__hero">
          <div className="employee-details__avatar">{initials}</div>
          <div>
            <h3 className="employee-details__name">{fullName}</h3>
            <p className="employee-details__job-title">{employee.jobTitle}</p>
            <span className={badgeClass}>{employee.employmentType}</span>
          </div>
        </div>

        <dl className="employee-details__grid">
          <div className="employee-details__field">
            <dt className="employee-details__label">Department</dt>
            <dd className="employee-details__value">{employee.department ?? '—'}</dd>
          </div>
          <div className="employee-details__field">
            <dt className="employee-details__label">Country</dt>
            <dd className="employee-details__value">{employee.country}</dd>
          </div>
          <div className="employee-details__field">
            <dt className="employee-details__label">Salary</dt>
            <dd className="employee-details__value employee-details__value--salary">
              {formattedSalary}
            </dd>
          </div>
          <div className="employee-details__field">
            <dt className="employee-details__label">Hire Date</dt>
            <dd className="employee-details__value">{formattedHireDate}</dd>
          </div>
          <div className="employee-details__field">
            <dt className="employee-details__label">Employee ID</dt>
            <dd className="employee-details__value">#{employee.id}</dd>
          </div>
        </dl>

        <div className="modal__actions">
          {confirmingDelete ? (
            <>
              <p className="modal__confirm-text">
                Delete {fullName}? This cannot be undone.
              </p>
              <button type="button" className="btn btn--danger" onClick={onDelete}>
                Confirm Delete
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => onEdit?.()}
              >
                Edit Employee
              </button>
              {onDelete && (
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => setConfirmingDelete(true)}
                >
                  Delete Employee
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
