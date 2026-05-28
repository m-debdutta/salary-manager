import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import employeeRouter from '../../../src/routes/employees';
import * as employeeServiceModule from '../../../src/services/employeeService';

vi.mock('../../../src/services/employeeService');

const createApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use('/api/employees', employeeRouter);
  return app;
};

describe('Employees Router', () => {
  let app: Express;

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

  const mockEmployeeResponse = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'Software Engineer',
    country: 'USA',
    salary: 100000,
    department: 'Engineering',
    hireDate: new Date('2024-01-15'),
    employmentType: 'Full-time',
    createdAt: new Date('2024-01-15T10:00:00.000Z'),
    updatedAt: new Date('2024-01-15T10:00:00.000Z'),
  };

  beforeEach(() => {
    app = createApp();
    vi.clearAllMocks();
  });

  it('should export a router instance', () => {
    expect(employeeRouter).toBeDefined();
    expect(typeof employeeRouter).toBe('function');
  });

  describe('POST /api/employees', () => {
    describe('Valid Input', () => {
      it('should return 201 for valid employee data', async () => {
        vi.spyOn(employeeServiceModule.employeeService, 'createEmployee').mockResolvedValue(
          mockEmployeeResponse
        );

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.status).toBe(201);
      });

      it('should return JSON content type', async () => {
        vi.spyOn(employeeServiceModule.employeeService, 'createEmployee').mockResolvedValue(
          mockEmployeeResponse
        );

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.headers['content-type']).toMatch(/application\/json/);
      });

      it('should return all required fields in response', async () => {
        vi.spyOn(employeeServiceModule.employeeService, 'createEmployee').mockResolvedValue(
          mockEmployeeResponse
        );

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
        vi.spyOn(employeeServiceModule.employeeService, 'createEmployee').mockResolvedValue(
          mockEmployeeResponse
        );

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
        vi.spyOn(employeeServiceModule.employeeService, 'createEmployee').mockResolvedValue(
          mockEmployeeResponse
        );

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.body.hireDate).toBe('2024-01-15');
      });

      it('should call employeeService.createEmployee with validated data', async () => {
        const createEmployeeSpy = vi
          .spyOn(employeeServiceModule.employeeService, 'createEmployee')
          .mockResolvedValue(mockEmployeeResponse);

        await request(app).post('/api/employees').send(validEmployeeData);

        expect(createEmployeeSpy).toHaveBeenCalledTimes(1);
        expect(createEmployeeSpy).toHaveBeenCalledWith(validEmployeeData);
      });

      it('should accept employee without optional department field', async () => {
        const { department: _, ...dataWithoutDepartment } = validEmployeeData;
        const mockWithoutDept = { ...mockEmployeeResponse, department: null };

        vi.spyOn(employeeServiceModule.employeeService, 'createEmployee').mockResolvedValue(
          mockWithoutDept
        );

        const response = await request(app).post('/api/employees').send(dataWithoutDepartment);

        expect(response.status).toBe(201);
      });

      it('should accept null department value', async () => {
        const dataWithNullDept = { ...validEmployeeData, department: null };
        const mockWithNullDept = { ...mockEmployeeResponse, department: null };

        vi.spyOn(employeeServiceModule.employeeService, 'createEmployee').mockResolvedValue(
          mockWithNullDept
        );

        const response = await request(app).post('/api/employees').send(dataWithNullDept);

        expect(response.status).toBe(201);
      });

      it('should accept zero salary', async () => {
        const dataWithZeroSalary = { ...validEmployeeData, salary: 0 };
        const mockZeroSalary = { ...mockEmployeeResponse, salary: 0 };

        vi.spyOn(employeeServiceModule.employeeService, 'createEmployee').mockResolvedValue(
          mockZeroSalary
        );

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
        const createEmployeeSpy = vi.spyOn(employeeServiceModule.employeeService, 'createEmployee');

        await request(app).post('/api/employees').send({ firstName: 'J' });

        expect(createEmployeeSpy).not.toHaveBeenCalled();
      });
    });

    describe('Service Error Handling', () => {
      it('should return 500 when service throws an error', async () => {
        vi.spyOn(employeeServiceModule.employeeService, 'createEmployee').mockRejectedValue(
          new Error('Database error')
        );

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.status).toBe(500);
      });

      it('should return "Failed to create employee" error message on service failure', async () => {
        vi.spyOn(employeeServiceModule.employeeService, 'createEmployee').mockRejectedValue(
          new Error('Connection failed')
        );

        const response = await request(app).post('/api/employees').send(validEmployeeData);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Failed to create employee');
      });
    });
  });
});
