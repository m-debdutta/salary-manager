import { useState } from 'react';
import type { Employee } from './EmployeeCard';
import styles from './EmployeeDetailsModal.module.css';

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
      <div className={`modal ${styles.detailsModal}`}>
        <div className="modal__header">
          <h2 className="modal__title" id="employee-details-title">
            Employee Details
          </h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.hero}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <h3 className={styles.name}>{fullName}</h3>
            <p className={styles.jobTitle}>{employee.jobTitle}</p>
            <span className={badgeClass}>{employee.employmentType}</span>
          </div>
        </div>

        <dl className={styles.grid}>
          <div className={styles.field}>
            <dt className={styles.fieldLabel}>Department</dt>
            <dd className={styles.fieldValue}>{employee.department ?? '—'}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.fieldLabel}>Country</dt>
            <dd className={styles.fieldValue}>{employee.country}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.fieldLabel}>Salary</dt>
            <dd className={`${styles.fieldValue} ${styles.fieldValueSalary}`}>
              {formattedSalary}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.fieldLabel}>Hire Date</dt>
            <dd className={styles.fieldValue}>{formattedHireDate}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.fieldLabel}>Employee ID</dt>
            <dd className={styles.fieldValue}>#{employee.id}</dd>
          </div>
        </dl>

        <div className="modal__actions">
          {confirmingDelete ? (
            <>
              <p className={styles.confirmText}>
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
