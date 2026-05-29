import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { fetchEmployees, deleteEmployee } from '../api/employees';
import { EmployeeCard, type Employee } from './EmployeeCard';
import AddEmployeeModal from './AddEmployeeModal';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import AnalyticsPanel from './AnalyticsPanel';
import styles from './Dashboard.module.css';

const PAGE_SIZE = 80;

export default function Dashboard() {
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setSelectedEmployee(null);
    },
  });

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['employees'],
      queryFn: ({ pageParam }) => fetchEmployees(pageParam, PAGE_SIZE),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.employees.length === lastPage.pageSize ? lastPage.page + 1 : undefined,
    });

  const employees = data?.pages.flatMap((p) => p.employees) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingNextPageRef = useRef(isFetchingNextPage);
  const fetchNextPageRef = useRef(fetchNextPage);
  hasNextPageRef.current = hasNextPage;
  isFetchingNextPageRef.current = isFetchingNextPage;
  fetchNextPageRef.current = fetchNextPage;

  useEffect(() => {
    if (isLoading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingNextPageRef.current
        ) {
          fetchNextPageRef.current();
        }
      },
      { root: gridRef.current, threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isLoading]);

  return (
    <div className={styles.dashboard} data-testid="dashboard">
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Salary Manager</h1>
          <p className={styles.subtitle}>Employee Overview</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          + Add Employee
        </button>
      </header>

      {showModal && <AddEmployeeModal onClose={() => setShowModal(false)} />}
      {employeeToEdit && (
        <AddEmployeeModal
          employee={employeeToEdit}
          onClose={() => setEmployeeToEdit(null)}
        />
      )}
      {selectedEmployee && (
        <EmployeeDetailsModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onEdit={() => {
            setEmployeeToEdit(selectedEmployee);
            setSelectedEmployee(null);
          }}
          onDelete={() => deleteMutation.mutate(selectedEmployee.id)}
        />
      )}

      <div className={styles.stats} data-testid="stats-section">
        <div className={styles.statCard} data-testid="stat-card">
          <span className={styles.statValue}>{isLoading ? '—' : total}</span>
          <span className={styles.statLabel}>Total Employees</span>
        </div>
      </div>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionTitle}>Employees</p>
        {!isLoading && <span className={styles.sectionCount}>{total}</span>}
      </div>

      {isError && (
        <p className={styles.error}>Failed to load employees. Please try again.</p>
      )}

      {isLoading ? (
        <p className={styles.loading}>Loading employees…</p>
      ) : (
        <div className={styles.grid} data-testid="employee-grid" ref={gridRef}>
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onClick={() => setSelectedEmployee(employee)}
              onEdit={() => setEmployeeToEdit(employee)}
            />
          ))}
          <div ref={sentinelRef} className={styles.sentinel} />
          {isFetchingNextPage && (
            <p className={`${styles.loading} ${styles.loadingPaging}`}>Loading more…</p>
          )}
        </div>
      )}

      <AnalyticsPanel />
    </div>
  );
}
