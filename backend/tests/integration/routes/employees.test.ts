import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { setupMiddleware } from '../../../src/middleware';
import employeeRouter from '../../../src/routes/employees';
import { prisma } from '../../../src/db/client';

// Create a test app with the employees endpoint
const createTestApp = (): Express => {
  const app = express();
  setupMiddleware(app);
  app.use('/api/employees', employeeRouter);
  return app;
};

describe('POST /api/employees - Create Employee', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  afterEach(async () => {
    // Clean up created employees after each test
    await prisma.employee.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Valid Input', () => {
    it('should create a new employee with valid data', async () => {
      const validEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Software Engineer',
        country: 'USA',
        salary: 100000,
        department: 'Engineering',
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app)
        .post('/api/employees')
        .send(validEmployee)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe(validEmployee.firstName);
      expect(response.body.lastName).toBe(validEmployee.lastName);
      expect(response.body.jobTitle).toBe(validEmployee.jobTitle);
      expect(response.body.country).toBe(validEmployee.country);
      expect(response.body.salary).toBe(validEmployee.salary);
      expect(response.body.department).toBe(validEmployee.department);
      expect(response.body.employmentType).toBe(validEmployee.employmentType);
    });

    it('should create employee with minimal required fields', async () => {
      const minimalEmployee = {
        firstName: 'Jane',
        lastName: 'Smith',
        jobTitle: 'Product Manager',
        country: 'India',
        salary: 80000,
        hireDate: '2024-02-01',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(minimalEmployee);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.firstName).toBe(minimalEmployee.firstName);
    });

    it('should store employee in database correctly', async () => {
      const employeeData = {
        firstName: 'Alice',
        lastName: 'Johnson',
        jobTitle: 'Data Analyst',
        country: 'Canada',
        salary: 75000,
        department: 'Analytics',
        hireDate: '2023-06-10',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(employeeData);

      expect(response.status).toBe(201);

      // Verify data in database
      const savedEmployee = await prisma.employee.findUnique({
        where: { id: response.body.id },
      });

      expect(savedEmployee).toBeDefined();
      expect(savedEmployee?.firstName).toBe(employeeData.firstName);
      expect(savedEmployee?.lastName).toBe(employeeData.lastName);
      expect(savedEmployee?.salary).toBe(employeeData.salary);
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      const employeeData = {
        firstName: 'Bob',
        lastName: 'Brown',
        jobTitle: 'QA Engineer',
        country: 'UK',
        salary: 70000,
        hireDate: '2023-09-20',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(employeeData);

      expect(response.status).toBe(201);
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });
  });

  describe('Invalid Input - Missing Fields', () => {
    it('should return 400 when firstName is missing', async () => {
      const invalidEmployee = {
        lastName: 'Doe',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 100000,
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when lastName is missing', async () => {
      const invalidEmployee = {
        firstName: 'John',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 100000,
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when jobTitle is missing', async () => {
      const invalidEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        country: 'USA',
        salary: 100000,
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when country is missing', async () => {
      const invalidEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Engineer',
        salary: 100000,
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when salary is missing', async () => {
      const invalidEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Engineer',
        country: 'USA',
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when hireDate is missing', async () => {
      const invalidEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 100000,
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when employmentType is missing', async () => {
      const invalidEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 100000,
        hireDate: '2024-01-15',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Invalid Input - Invalid Data Types', () => {
    it('should return 400 when salary is not a number', async () => {
      const invalidEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 'not-a-number',
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when salary is negative', async () => {
      const invalidEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: -5000,
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when hireDate is invalid format', async () => {
      const invalidEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 100000,
        hireDate: 'invalid-date',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when firstName is empty string', async () => {
      const invalidEmployee = {
        firstName: '',
        lastName: 'Doe',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 100000,
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when firstName is not a string', async () => {
      const invalidEmployee = {
        firstName: 123,
        lastName: 'Doe',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 100000,
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long names', async () => {
      const longName = 'A'.repeat(100);
      const employeeData = {
        firstName: longName,
        lastName: longName,
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 100000,
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(employeeData);

      expect(response.status).toBe(201);
      expect(response.body.firstName).toBe(longName);
    });

    it('should handle very high salary', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'CEO',
        country: 'USA',
        salary: 999999999.99,
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(employeeData);

      expect(response.status).toBe(201);
      expect(response.body.salary).toBe(employeeData.salary);
    });

    it('should handle salary of 0 (unpaid)', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Intern',
        country: 'USA',
        salary: 0,
        hireDate: '2024-01-15',
        employmentType: 'Internship',
      };

      const response = await request(app).post('/api/employees').send(employeeData);

      expect(response.status).toBe(201);
      expect(response.body.salary).toBe(0);
    });

    it('should handle optional department field', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 100000,
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
        department: null,
      };

      const response = await request(app).post('/api/employees').send(employeeData);

      expect(response.status).toBe(201);
    });
  });

  describe('Error Responses', () => {
    it('should return error with message in response', async () => {
      const invalidEmployee = {
        firstName: '',
        lastName: 'Doe',
        jobTitle: 'Engineer',
        country: 'USA',
        salary: 100000,
        hireDate: '2024-01-15',
        employmentType: 'Full-time',
      };

      const response = await request(app).post('/api/employees').send(invalidEmployee);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(typeof response.body.error).toBe('object');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/employees')
        .set('Content-Type', 'application/json')
        .send('{invalid json}');

      expect(response.status).toBe(400);
    });
  });
});
