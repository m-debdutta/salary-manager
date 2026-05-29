import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import employeeRouter from '../../../src/routes/employees';
import { employeeService } from '../../../src/services/employeeService';

vi.mock('../../../src/services/employeeService', () => ({
  employeeService: {
    getEmployees: vi.fn(),
    createEmployee: vi.fn(),
    getEmployeeById: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
  },
}));

const createApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use('/api/employees', employeeRouter);
  return app;
};

const makeEmployee = (overrides = {}) => ({
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  jobTitle: 'Software Engineer',
  country: 'USA',
  salary: 100000,
  department: 'Engineering',
  hireDate: new Date('2024-01-15'),
  employmentType: 'Full-time',
  createdAt: new Date('2024-01-15T00:00:00Z'),
  updatedAt: new Date('2024-01-15T00:00:00Z'),
  ...overrides,
});

const validEmployeeData = {
  firstName: 'John',
  lastName: 'Doe',
  jobTitle: 'Software Engineer',
  country: 'USA',
  salary: 100000,
  department: 'Engineering',
  hireDate: '2024-01-15',
  employmentType: 'Full-time',
};

describe('Employees Router', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
    vi.clearAllMocks();
  });

  describe('GET /api/employees', () => {
    it('should return 200 with employees list', async () => {
      const employee = makeEmployee();
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [employee],
        total: 1,
        page: 1,
        pageSize: 50,
      });

      const response = await request(app).get('/api/employees');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body.employees).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(50);
    });

    it('should return employees with correct shape', async () => {
      const employee = makeEmployee();
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [employee],
        total: 1,
        page: 1,
        pageSize: 50,
      });

      const response = await request(app).get('/api/employees');
      const result = response.body.employees[0];

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('firstName', 'John');
      expect(result).toHaveProperty('lastName', 'Doe');
      expect(result).toHaveProperty('jobTitle', 'Software Engineer');
      expect(result).toHaveProperty('country', 'USA');
      expect(result).toHaveProperty('salary', 100000);
      expect(result).toHaveProperty('department', 'Engineering');
      expect(result).toHaveProperty('hireDate', '2024-01-15');
      expect(result).toHaveProperty('employmentType', 'Full-time');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should return empty list when no employees exist', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      const response = await request(app).get('/api/employees');

      expect(response.status).toBe(200);
      expect(response.body.employees).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should pass page and pageSize to service', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 2,
        pageSize: 10,
      });

      await request(app).get('/api/employees?page=2&pageSize=10');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        10,
        10,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      ); // skip=(2-1)*10=10
    });

    it('should default to page 1 and pageSize 50 when not specified', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should format hireDate as YYYY-MM-DD string', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [makeEmployee({ hireDate: new Date('2023-06-15T12:00:00Z') })],
        total: 1,
        page: 1,
        pageSize: 50,
      });

      const response = await request(app).get('/api/employees');

      expect(response.body.employees[0].hireDate).toBe('2023-06-15');
    });

    it('should handle null department', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [makeEmployee({ department: null })],
        total: 1,
        page: 1,
        pageSize: 50,
      });

      const response = await request(app).get('/api/employees');

      expect(response.body.employees[0].department).toBeNull();
    });

    it('should return 500 when service throws', async () => {
      vi.mocked(employeeService.getEmployees).mockRejectedValue(new Error('DB connection failed'));

      const response = await request(app).get('/api/employees');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch employees' });
    });

    it('should ignore invalid page/pageSize and fall back to defaults', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?page=abc&pageSize=xyz');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should cap pageSize at 100 when pageSize exceeds maximum', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 100,
      });

      await request(app).get('/api/employees?pageSize=200');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        100,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should default page to 1 when page is 0 or negative', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?page=-5');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should default pageSize to 1 when pageSize is negative', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 1,
      });

      await request(app).get('/api/employees?pageSize=-10');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        1,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass search query param to service', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?search=alice');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        'alice',
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass search together with pagination params', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 2,
        pageSize: 10,
      });

      await request(app).get('/api/employees?search=smith&page=2&pageSize=10');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        10,
        10,
        'smith',
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass undefined to service when search is an empty string', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?search=');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass undefined to service when search is not provided', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass department query param to service', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?department=Engineering');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        'Engineering',
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass undefined to service when department is not provided', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass both search and department to service', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?search=alice&department=Engineering');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        'alice',
        'Engineering',
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass jobTitle query param to service', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?jobTitle=Software%20Engineer');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        'Software Engineer',
        undefined,
        undefined
      );
    });

    it('should pass undefined to service when jobTitle is not provided', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass undefined to service when jobTitle is an empty string', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?jobTitle=');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass jobTitle together with search and department to service', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get(
        '/api/employees?search=alice&department=Engineering&jobTitle=Software%20Engineer'
      );

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        'alice',
        'Engineering',
        'Software Engineer',
        undefined,
        undefined
      );
    });

    it('should pass country query param to service', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?country=USA');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        'USA',
        undefined
      );
    });

    it('should pass undefined to service when country is not provided', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass undefined to service when country is an empty string', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?country=');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass country together with search, department and jobTitle to service', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get(
        '/api/employees?search=alice&department=Engineering&jobTitle=Software%20Engineer&country=USA'
      );

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        'alice',
        'Engineering',
        'Software Engineer',
        'USA',
        undefined
      );
    });

    it('should pass employmentType query param to service', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?employmentType=Full-time');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        'Full-time'
      );
    });

    it('should pass undefined to service when employmentType is not provided', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass undefined to service when employmentType is an empty string', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get('/api/employees?employmentType=');

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should pass employmentType together with all other filters to service', async () => {
      vi.mocked(employeeService.getEmployees).mockResolvedValue({
        employees: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });

      await request(app).get(
        '/api/employees?search=alice&department=Engineering&jobTitle=Software%20Engineer&country=USA&employmentType=Full-time'
      );

      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        0,
        50,
        'alice',
        'Engineering',
        'Software Engineer',
        'USA',
        'Full-time'
      );
    });
  });

  describe('POST /api/employees', () => {
    describe('Valid Input', () => {
      it('should return 201 for valid employee data', async () => {
        vi.mocked(employeeService.createEmployee).mockResolvedValue(makeEmployee());

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.status).toBe(201);
      });

      it('should return JSON content type', async () => {
        vi.mocked(employeeService.createEmployee).mockResolvedValue(makeEmployee());

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.headers['content-type']).toMatch(/application\/json/);
      });

      it('should return all required fields in response', async () => {
        vi.mocked(employeeService.createEmployee).mockResolvedValue(makeEmployee());

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('firstName');
        expect(response.body).toHaveProperty('lastName');
        expect(response.body).toHaveProperty('jobTitle');
        expect(response.body).toHaveProperty('country');
        expect(response.body).toHaveProperty('salary');
        expect(response.body).toHaveProperty('department');
        expect(response.body).toHaveProperty('hireDate');
        expect(response.body).toHaveProperty('employmentType');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('updatedAt');
      });

      it('should return correct employee data', async () => {
        vi.mocked(employeeService.createEmployee).mockResolvedValue(makeEmployee());

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.body.id).toBe(1);
        expect(response.body.firstName).toBe('John');
        expect(response.body.lastName).toBe('Doe');
        expect(response.body.jobTitle).toBe('Software Engineer');
        expect(response.body.country).toBe('USA');
        expect(response.body.salary).toBe(100000);
        expect(response.body.department).toBe('Engineering');
        expect(response.body.employmentType).toBe('Full-time');
      });

      it('should format hireDate as YYYY-MM-DD string', async () => {
        vi.mocked(employeeService.createEmployee).mockResolvedValue(makeEmployee());

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.body.hireDate).toBe('2024-01-15');
      });

      it('should call employeeService.createEmployee with validated data', async () => {
        vi.mocked(employeeService.createEmployee).mockResolvedValue(makeEmployee());

        await request(app).post('/api/employees').send(validEmployeeData);

        expect(employeeService.createEmployee).toHaveBeenCalledTimes(1);
        expect(employeeService.createEmployee).toHaveBeenCalledWith(validEmployeeData);
      });

      it('should accept employee without optional department field', async () => {
        const { department: _, ...dataWithoutDepartment } = validEmployeeData;
        vi.mocked(employeeService.createEmployee).mockResolvedValue(
          makeEmployee({ department: null })
        );

        const response = await request(app).post('/api/employees').send(dataWithoutDepartment);

        expect(response.status).toBe(201);
      });

      it('should accept null department value', async () => {
        const dataWithNullDept = { ...validEmployeeData, department: null };
        vi.mocked(employeeService.createEmployee).mockResolvedValue(
          makeEmployee({ department: null })
        );

        const response = await request(app).post('/api/employees').send(dataWithNullDept);

        expect(response.status).toBe(201);
      });

      it('should accept zero salary', async () => {
        const dataWithZeroSalary = { ...validEmployeeData, salary: 0 };
        vi.mocked(employeeService.createEmployee).mockResolvedValue(makeEmployee({ salary: 0 }));

        const response = await request(app).post('/api/employees').send(dataWithZeroSalary);

        expect(response.status).toBe(201);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing firstName', async () => {
        const { firstName: _, ...data } = validEmployeeData;
        const response = await request(app).post('/api/employees').send(data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(Array.isArray(response.body.error)).toBe(true);
      });

      it('should return 400 for firstName shorter than 2 characters', async () => {
        const response = await request(app)
          .post('/api/employees')
          .send({ ...validEmployeeData, firstName: 'J' });

        expect(response.status).toBe(400);
        expect(Array.isArray(response.body.error)).toBe(true);
      });

      it('should return 400 for missing lastName', async () => {
        const { lastName: _, ...data } = validEmployeeData;
        const response = await request(app).post('/api/employees').send(data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 for lastName shorter than 2 characters', async () => {
        const response = await request(app)
          .post('/api/employees')
          .send({ ...validEmployeeData, lastName: 'D' });

        expect(response.status).toBe(400);
        expect(Array.isArray(response.body.error)).toBe(true);
      });

      it('should return 400 for missing jobTitle', async () => {
        const { jobTitle: _, ...data } = validEmployeeData;
        const response = await request(app).post('/api/employees').send(data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 for missing country', async () => {
        const { country: _, ...data } = validEmployeeData;
        const response = await request(app).post('/api/employees').send(data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 for missing salary', async () => {
        const { salary: _, ...data } = validEmployeeData;
        const response = await request(app).post('/api/employees').send(data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 for negative salary', async () => {
        const response = await request(app)
          .post('/api/employees')
          .send({ ...validEmployeeData, salary: -1 });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 for invalid hireDate format', async () => {
        const response = await request(app)
          .post('/api/employees')
          .send({ ...validEmployeeData, hireDate: '01/15/2024' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 for missing hireDate', async () => {
        const { hireDate: _, ...data } = validEmployeeData;
        const response = await request(app).post('/api/employees').send(data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 for missing employmentType', async () => {
        const { employmentType: _, ...data } = validEmployeeData;
        const response = await request(app).post('/api/employees').send(data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should return validation error messages as array of strings', async () => {
        const response = await request(app)
          .post('/api/employees')
          .send({ firstName: 'J', lastName: 'D' });

        expect(response.status).toBe(400);
        expect(Array.isArray(response.body.error)).toBe(true);
        expect(response.body.error.length).toBeGreaterThan(0);
        expect(typeof response.body.error[0]).toBe('string');
      });

      it('should not call employeeService when validation fails', async () => {
        await request(app).post('/api/employees').send({ firstName: 'J' });

        expect(employeeService.createEmployee).not.toHaveBeenCalled();
      });
    });

    describe('Service Error Handling', () => {
      it('should return 500 when service throws an error', async () => {
        vi.mocked(employeeService.createEmployee).mockRejectedValue(new Error('Database error'));

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.status).toBe(500);
      });

      it('should return "Failed to create employee" error message on service failure', async () => {
        vi.mocked(employeeService.createEmployee).mockRejectedValue(new Error('Connection failed'));

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Failed to create employee');
      });
    });
  });

  describe('GET /api/employees/:id', () => {
    describe('Valid ID', () => {
      it('should return 200 with the employee when found', async () => {
        vi.mocked(employeeService.getEmployeeById).mockResolvedValue(makeEmployee());

        const response = await request(app).get('/api/employees/1');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
      });

      it('should return employee with correct shape', async () => {
        vi.mocked(employeeService.getEmployeeById).mockResolvedValue(makeEmployee());

        const response = await request(app).get('/api/employees/1');
        const result = response.body;

        expect(result).toHaveProperty('id', 1);
        expect(result).toHaveProperty('firstName', 'John');
        expect(result).toHaveProperty('lastName', 'Doe');
        expect(result).toHaveProperty('jobTitle', 'Software Engineer');
        expect(result).toHaveProperty('country', 'USA');
        expect(result).toHaveProperty('salary', 100000);
        expect(result).toHaveProperty('department', 'Engineering');
        expect(result).toHaveProperty('hireDate', '2024-01-15');
        expect(result).toHaveProperty('employmentType', 'Full-time');
        expect(result).toHaveProperty('createdAt');
        expect(result).toHaveProperty('updatedAt');
      });

      it('should format hireDate as YYYY-MM-DD string', async () => {
        vi.mocked(employeeService.getEmployeeById).mockResolvedValue(
          makeEmployee({ hireDate: new Date('2023-06-15T12:00:00Z') })
        );

        const response = await request(app).get('/api/employees/1');

        expect(response.body.hireDate).toBe('2023-06-15');
      });

      it('should call service with parsed numeric id', async () => {
        vi.mocked(employeeService.getEmployeeById).mockResolvedValue(makeEmployee({ id: 42 }));

        await request(app).get('/api/employees/42');

        expect(employeeService.getEmployeeById).toHaveBeenCalledWith(42);
      });

      it('should handle null department', async () => {
        vi.mocked(employeeService.getEmployeeById).mockResolvedValue(
          makeEmployee({ department: null })
        );

        const response = await request(app).get('/api/employees/1');

        expect(response.body.department).toBeNull();
      });
    });

    describe('Not Found', () => {
      it('should return 404 when employee does not exist', async () => {
        vi.mocked(employeeService.getEmployeeById).mockResolvedValue(null);

        const response = await request(app).get('/api/employees/999');

        expect(response.status).toBe(404);
      });

      it('should return error message when employee not found', async () => {
        vi.mocked(employeeService.getEmployeeById).mockResolvedValue(null);

        const response = await request(app).get('/api/employees/999');

        expect(response.body).toEqual({ error: 'Employee not found' });
      });
    });

    describe('Invalid ID', () => {
      it('should return 400 for non-numeric id', async () => {
        const response = await request(app).get('/api/employees/abc');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid employee ID' });
      });

      it('should return 400 for mixed numeric-alpha id', async () => {
        const response = await request(app).get('/api/employees/123abc');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid employee ID' });
      });

      it('should not call service for non-numeric id', async () => {
        await request(app).get('/api/employees/abc');

        expect(employeeService.getEmployeeById).not.toHaveBeenCalled();
      });
    });

    describe('Service Error', () => {
      it('should return 500 when service throws', async () => {
        vi.mocked(employeeService.getEmployeeById).mockRejectedValue(new Error('DB error'));

        const response = await request(app).get('/api/employees/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed to fetch employee' });
      });
    });
  });

  describe('PUT /api/employees/:id', () => {
    const updateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      jobTitle: 'Senior Engineer',
      country: 'Canada',
      salary: 120000,
      department: 'Product',
      hireDate: '2023-03-20',
      employmentType: 'Full-time',
    };

    describe('Valid Update', () => {
      it('should return 200 with updated employee', async () => {
        vi.mocked(employeeService.updateEmployee).mockResolvedValue(
          makeEmployee({ ...updateData, hireDate: new Date('2023-03-20') })
        );

        const response = await request(app).put('/api/employees/1').send(updateData);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
      });

      it('should return all required fields in response', async () => {
        vi.mocked(employeeService.updateEmployee).mockResolvedValue(
          makeEmployee({ ...updateData, hireDate: new Date('2023-03-20') })
        );

        const response = await request(app).put('/api/employees/1').send(updateData);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('firstName');
        expect(response.body).toHaveProperty('lastName');
        expect(response.body).toHaveProperty('jobTitle');
        expect(response.body).toHaveProperty('country');
        expect(response.body).toHaveProperty('salary');
        expect(response.body).toHaveProperty('department');
        expect(response.body).toHaveProperty('hireDate');
        expect(response.body).toHaveProperty('employmentType');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('updatedAt');
      });

      it('should return updated employee data', async () => {
        vi.mocked(employeeService.updateEmployee).mockResolvedValue(
          makeEmployee({
            id: 1,
            firstName: 'Jane',
            lastName: 'Smith',
            jobTitle: 'Senior Engineer',
            country: 'Canada',
            salary: 120000,
            department: 'Product',
            hireDate: new Date('2023-03-20'),
            employmentType: 'Full-time',
          })
        );

        const response = await request(app).put('/api/employees/1').send(updateData);

        expect(response.body.id).toBe(1);
        expect(response.body.firstName).toBe('Jane');
        expect(response.body.lastName).toBe('Smith');
        expect(response.body.jobTitle).toBe('Senior Engineer');
        expect(response.body.country).toBe('Canada');
        expect(response.body.salary).toBe(120000);
        expect(response.body.department).toBe('Product');
        expect(response.body.employmentType).toBe('Full-time');
      });

      it('should format hireDate as YYYY-MM-DD string', async () => {
        vi.mocked(employeeService.updateEmployee).mockResolvedValue(
          makeEmployee({ hireDate: new Date('2023-03-20T00:00:00Z') })
        );

        const response = await request(app).put('/api/employees/1').send(updateData);

        expect(response.body.hireDate).toBe('2023-03-20');
      });

      it('should call service with parsed numeric id and validated data', async () => {
        vi.mocked(employeeService.updateEmployee).mockResolvedValue(
          makeEmployee({ ...updateData, hireDate: new Date('2023-03-20') })
        );

        await request(app).put('/api/employees/42').send(updateData);

        expect(employeeService.updateEmployee).toHaveBeenCalledWith(42, updateData);
      });

      it('should accept partial update with only some fields', async () => {
        vi.mocked(employeeService.updateEmployee).mockResolvedValue(makeEmployee());

        const response = await request(app).put('/api/employees/1').send({ salary: 95000 });

        expect(response.status).toBe(200);
        expect(employeeService.updateEmployee).toHaveBeenCalledWith(1, { salary: 95000 });
      });

      it('should accept null department to clear it', async () => {
        vi.mocked(employeeService.updateEmployee).mockResolvedValue(
          makeEmployee({ department: null })
        );

        const response = await request(app).put('/api/employees/1').send({ department: null });

        expect(response.status).toBe(200);
        expect(response.body.department).toBeNull();
      });
    });

    describe('Invalid ID', () => {
      it('should return 400 for non-numeric id', async () => {
        const response = await request(app).put('/api/employees/abc').send(updateData);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid employee ID' });
      });

      it('should return 400 for mixed numeric-alpha id', async () => {
        const response = await request(app).put('/api/employees/1abc').send(updateData);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid employee ID' });
      });

      it('should not call service for non-numeric id', async () => {
        await request(app).put('/api/employees/abc').send(updateData);

        expect(employeeService.updateEmployee).not.toHaveBeenCalled();
      });
    });

    describe('Invalid Input', () => {
      it('should return 400 when salary is negative', async () => {
        const response = await request(app).put('/api/employees/1').send({ salary: -1000 });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 when firstName is too short', async () => {
        const response = await request(app).put('/api/employees/1').send({ firstName: 'A' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 when hireDate has invalid format', async () => {
        const response = await request(app)
          .put('/api/employees/1')
          .send({ hireDate: 'not-a-date' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should not call service when validation fails', async () => {
        await request(app).put('/api/employees/1').send({ salary: -500 });

        expect(employeeService.updateEmployee).not.toHaveBeenCalled();
      });
    });

    describe('Not Found', () => {
      it('should return 404 when employee does not exist', async () => {
        vi.mocked(employeeService.updateEmployee).mockResolvedValue(null);

        const response = await request(app).put('/api/employees/999').send(updateData);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Employee not found' });
      });
    });

    describe('Service Error', () => {
      it('should return 500 when service throws', async () => {
        vi.mocked(employeeService.updateEmployee).mockRejectedValue(new Error('DB error'));

        const response = await request(app).put('/api/employees/1').send(updateData);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed to update employee' });
      });
    });
  });

  describe('DELETE /api/employees/:id', () => {
    describe('Valid Delete', () => {
      it('should return 204 when employee is deleted', async () => {
        vi.mocked(employeeService.deleteEmployee).mockResolvedValue(makeEmployee());

        const response = await request(app).delete('/api/employees/1');

        expect(response.status).toBe(204);
      });

      it('should return no body on successful delete', async () => {
        vi.mocked(employeeService.deleteEmployee).mockResolvedValue(makeEmployee());

        const response = await request(app).delete('/api/employees/1');

        expect(response.body).toEqual({});
      });

      it('should call service with parsed numeric id', async () => {
        vi.mocked(employeeService.deleteEmployee).mockResolvedValue(makeEmployee({ id: 42 }));

        await request(app).delete('/api/employees/42');

        expect(employeeService.deleteEmployee).toHaveBeenCalledWith(42);
      });
    });

    describe('Not Found', () => {
      it('should return 404 when employee does not exist', async () => {
        vi.mocked(employeeService.deleteEmployee).mockResolvedValue(null);

        const response = await request(app).delete('/api/employees/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Employee not found' });
      });
    });

    describe('Invalid ID', () => {
      it('should return 400 for non-numeric id', async () => {
        const response = await request(app).delete('/api/employees/abc');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid employee ID' });
      });

      it('should return 400 for mixed numeric-alpha id', async () => {
        const response = await request(app).delete('/api/employees/1abc');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid employee ID' });
      });

      it('should not call service for non-numeric id', async () => {
        await request(app).delete('/api/employees/abc');

        expect(employeeService.deleteEmployee).not.toHaveBeenCalled();
      });
    });

    describe('Service Error', () => {
      it('should return 500 when service throws', async () => {
        vi.mocked(employeeService.deleteEmployee).mockRejectedValue(new Error('DB error'));

        const response = await request(app).delete('/api/employees/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed to delete employee' });
      });
    });
  });
});
