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

  describe('Invalid Input', () => {
    it('should return 400 when a required field is missing', async () => {
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

describe('GET /api/employees - List Employees', () => {
  let app: Express;

  const seedEmployee = (overrides: Record<string, unknown> = {}) =>
    prisma.employee.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Software Engineer',
        country: 'USA',
        salary: 100000,
        department: 'Engineering',
        hireDate: new Date('2024-01-15'),
        employmentType: 'Full-time',
        ...overrides,
      },
    });

  beforeAll(() => {
    app = createTestApp();
  });

  afterEach(async () => {
    await prisma.employee.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return 200 with empty list when no employees exist', async () => {
    const response = await request(app).get('/api/employees');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body.employees).toEqual([]);
    expect(response.body.total).toBe(0);
    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(50);
  });

  it('should return 200 with created employees', async () => {
    await seedEmployee({ firstName: 'Alice' });
    await seedEmployee({ firstName: 'Bob' });

    const response = await request(app).get('/api/employees');

    expect(response.status).toBe(200);
    expect(response.body.employees).toHaveLength(2);
    expect(response.body.total).toBe(2);
  });

  it('should return employees with correct shape', async () => {
    await seedEmployee();

    const response = await request(app).get('/api/employees');

    const employee = response.body.employees[0];
    expect(employee).toHaveProperty('id');
    expect(employee).toHaveProperty('firstName', 'John');
    expect(employee).toHaveProperty('lastName', 'Doe');
    expect(employee).toHaveProperty('jobTitle', 'Software Engineer');
    expect(employee).toHaveProperty('country', 'USA');
    expect(employee).toHaveProperty('salary', 100000);
    expect(employee).toHaveProperty('department', 'Engineering');
    expect(employee).toHaveProperty('employmentType', 'Full-time');
    expect(employee).toHaveProperty('createdAt');
    expect(employee).toHaveProperty('updatedAt');
  });

  it('should format hireDate as YYYY-MM-DD string', async () => {
    await seedEmployee({ hireDate: new Date('2024-01-15') });

    const response = await request(app).get('/api/employees');

    expect(response.body.employees[0].hireDate).toBe('2024-01-15');
  });

  it('should default to page=1 and pageSize=50 when not specified', async () => {
    const response = await request(app).get('/api/employees');

    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(50);
  });

  it('should return second page of results with correct pagination metadata', async () => {
    await Promise.all([
      seedEmployee({ firstName: 'Alice' }),
      seedEmployee({ firstName: 'Bob' }),
      seedEmployee({ firstName: 'Carol' }),
    ]);

    const response = await request(app).get('/api/employees?page=2&pageSize=2');

    expect(response.status).toBe(200);
    expect(response.body.employees).toHaveLength(1);
    expect(response.body.total).toBe(3);
    expect(response.body.page).toBe(2);
    expect(response.body.pageSize).toBe(2);
  });

  it('should return null department when department is not set', async () => {
    await seedEmployee({ department: undefined });

    const response = await request(app).get('/api/employees');

    expect(response.body.employees[0].department).toBeNull();
  });

  it('should persist and return total count across pages', async () => {
    await Promise.all([
      seedEmployee({ firstName: 'Alice' }),
      seedEmployee({ firstName: 'Bob' }),
      seedEmployee({ firstName: 'Carol' }),
      seedEmployee({ firstName: 'Dave' }),
    ]);

    const page1 = await request(app).get('/api/employees?page=1&pageSize=2');
    const page2 = await request(app).get('/api/employees?page=2&pageSize=2');

    expect(page1.body.total).toBe(4);
    expect(page2.body.total).toBe(4);
    expect(page1.body.employees).toHaveLength(2);
    expect(page2.body.employees).toHaveLength(2);
  });
});
