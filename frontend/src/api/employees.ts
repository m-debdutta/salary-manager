import axios from 'axios';
import type { Employee } from '../components/EmployeeCard';

export interface EmployeesResponse {
  employees: Employee[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  jobTitle: string;
  country: string;
  salary: number;
  department?: string | null;
  hireDate: string;
  employmentType: string;
}

export const fetchEmployees = async (
  page = 1,
  pageSize = 50,
): Promise<EmployeesResponse> => {
  const { data } = await axios.get<EmployeesResponse>('/api/employees', {
    params: { page, pageSize },
  });
  return data;
};

export const createEmployee = async (input: CreateEmployeeInput): Promise<Employee> => {
  const { data } = await axios.post<Employee>('/api/employees', input);
  return data;
};
