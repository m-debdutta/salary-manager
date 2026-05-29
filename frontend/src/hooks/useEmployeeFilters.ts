import { useEffect, useState } from 'react';

export interface EmployeeFilters {
  search: string;
  setSearch: (v: string) => void;
  debouncedSearch: string;
  department: string;
  setDepartment: (v: string) => void;
  jobTitle: string;
  setJobTitle: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  employmentType: string;
  setEmploymentType: (v: string) => void;
  clearFilters: () => void;
}

export function useEmployeeFilters(): EmployeeFilters {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [country, setCountry] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const clearFilters = () => {
    setSearch('');
    setDepartment('');
    setJobTitle('');
    setCountry('');
    setEmploymentType('');
  };

  return {
    search,
    setSearch,
    debouncedSearch,
    department,
    setDepartment,
    jobTitle,
    setJobTitle,
    country,
    setCountry,
    employmentType,
    setEmploymentType,
    clearFilters,
  };
}
