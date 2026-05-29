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

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

export const fetchEmployees = async (
  page = 1,
  pageSize = 50,
  search?: string,
  department?: string,
): Promise<EmployeesResponse> => {
  const { data } = await axios.get<EmployeesResponse>('/api/employees', {
    params: {
      page,
      pageSize,
      ...(search ? { search } : {}),
      ...(department ? { department } : {}),
    },
  });
  return data;
};

export const createEmployee = async (input: CreateEmployeeInput): Promise<Employee> => {
  const { data } = await axios.post<Employee>('/api/employees', input);
  return data;
};

export const updateEmployee = async (
  id: number,
  input: UpdateEmployeeInput,
): Promise<Employee> => {
  const { data } = await axios.put<Employee>(`/api/employees/${id}`, input);
  return data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  await axios.delete(`/api/employees/${id}`);
};
