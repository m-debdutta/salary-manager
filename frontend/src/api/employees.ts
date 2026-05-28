import axios from 'axios';
import type { Employee } from '../components/EmployeeCard';

export interface EmployeesResponse {
  employees: Employee[];
  total: number;
  page: number;
  pageSize: number;
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
