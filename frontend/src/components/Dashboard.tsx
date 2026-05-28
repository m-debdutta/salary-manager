import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { fetchEmployees } from '../api/employees';
import { EmployeeCard } from './EmployeeCard';
import AddEmployeeModal from './AddEmployeeModal';

const PAGE_SIZE = 80;

export default function Dashboard() {
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);

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
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Salary Manager</h1>
          <p className="dashboard__subtitle">Employee Overview</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          + Add Employee
        </button>
      </header>

      {showModal && <AddEmployeeModal onClose={() => setShowModal(false)} />}

      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__value">{isLoading ? '—' : total}</span>
          <span className="stat-card__label">Total Employees</span>
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
        <div className="dashboard__grid" ref={gridRef}>
          {employees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
          <div ref={sentinelRef} className="dashboard__sentinel" />
          {isFetchingNextPage && (
            <p className="dashboard__loading dashboard__loading--paging">Loading more…</p>
          )}
        </div>
      )}
    </div>
  );
}
