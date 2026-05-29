import { describe, it, expect, afterEach } from 'vitest';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  deleteEmployee,
  EmployeeCreateInput,
} from '../../../src/db/employeeRepository';
import { prisma } from '../../../src/db/client';

describe('EmployeeRepository', () => {
  // Clean up after each test
  afterEach(async () => {
    await prisma.employee.deleteMany({});
  });

  describe('createEmployee', () => {
    it('should create an employee with all fields', async () => {
      const employeeData: EmployeeCreateInput = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Software Engineer',
        country: 'USA',
        salary: 100000,
        department: 'Engineering',
        hireDate: new Date('2024-01-15'),
        employmentType: 'Full-time',
      };

      const employee = await createEmployee(employeeData);

      expect(employee).toBeDefined();
      expect(employee.id).toBeGreaterThan(0);
      expect(employee.firstName).toBe(employeeData.firstName);
      expect(employee.lastName).toBe(employeeData.lastName);
      expect(employee.jobTitle).toBe(employeeData.jobTitle);
      expect(employee.country).toBe(employeeData.country);
      expect(employee.salary).toBe(employeeData.salary);
      expect(employee.department).toBe(employeeData.department);
      expect(employee.employmentType).toBe(employeeData.employmentType);
      expect(employee.hireDate).toBeInstanceOf(Date);
      expect(employee.createdAt).toBeInstanceOf(Date);
      expect(employee.updatedAt).toBeInstanceOf(Date);
    });

    it('should create an employee without optional department', async () => {
      const employeeData: EmployeeCreateInput = {
        firstName: 'Jane',
        lastName: 'Smith',
        jobTitle: 'Product Manager',
        country: 'Canada',
        salary: 90000,
        hireDate: new Date('2024-02-01'),
        employmentType: 'Full-time',
      };

      const employee = await createEmployee(employeeData);

      expect(employee).toBeDefined();
      expect(employee.id).toBeGreaterThan(0);
      expect(employee.firstName).toBe(employeeData.firstName);
      expect(employee.department).toBeNull();
    });

    it('should handle Date objects for hireDate', async () => {
      const hireDate = new Date('2023-06-15');
      const employeeData: EmployeeCreateInput = {
        firstName: 'Bob',
        lastName: 'Wilson',
        jobTitle: 'Designer',
        country: 'Australia',
        salary: 85000,
        hireDate: hireDate,
        employmentType: 'Full-time',
      };

      const employee = await createEmployee(employeeData);

      expect(employee.hireDate).toBeInstanceOf(Date);
      expect(employee.hireDate.getTime()).toBe(hireDate.getTime());
    });

    it('should allow salary of 0', async () => {
      const employeeData: EmployeeCreateInput = {
        firstName: 'Charlie',
        lastName: 'Brown',
        jobTitle: 'Intern',
        country: 'USA',
        salary: 0,
        hireDate: new Date('2024-01-01'),
        employmentType: 'Internship',
      };

      const employee = await createEmployee(employeeData);

      expect(employee).toBeDefined();
      expect(employee.salary).toBe(0);
    });

    it('should handle very high salary values', async () => {
      const employeeData: EmployeeCreateInput = {
        firstName: 'David',
        lastName: 'Executive',
        jobTitle: 'CEO',
        country: 'USA',
        salary: 5000000,
        department: 'Executive',
        hireDate: new Date('2020-01-01'),
        employmentType: 'Full-time',
      };

      const employee = await createEmployee(employeeData);

      expect(employee).toBeDefined();
      expect(employee.salary).toBe(5000000);
    });

    it('should handle special characters in text fields', async () => {
      const employeeData: EmployeeCreateInput = {
        firstName: "O'Connor",
        lastName: 'Müller-Schmidt',
        jobTitle: 'Software Engineer & Architect',
        country: 'Germany',
        salary: 95000,
        department: 'R&D',
        hireDate: new Date('2024-03-01'),
        employmentType: 'Full-time',
      };

      const employee = await createEmployee(employeeData);

      expect(employee).toBeDefined();
      expect(employee.firstName).toBe("O'Connor");
      expect(employee.lastName).toBe('Müller-Schmidt');
      expect(employee.jobTitle).toBe('Software Engineer & Architect');
      expect(employee.department).toBe('R&D');
    });

    it('should create multiple employees independently', async () => {
      const employee1Data: EmployeeCreateInput = {
        firstName: 'Emma',
        lastName: 'Taylor',
        jobTitle: 'Developer',
        country: 'USA',
        salary: 80000,
        hireDate: new Date('2024-01-01'),
        employmentType: 'Full-time',
      };

      const employee2Data: EmployeeCreateInput = {
        firstName: 'Frank',
        lastName: 'Harris',
        jobTitle: 'Designer',
        country: 'Canada',
        salary: 75000,
        hireDate: new Date('2024-01-02'),
        employmentType: 'Full-time',
      };

      const employee1 = await createEmployee(employee1Data);
      const employee2 = await createEmployee(employee2Data);

      expect(employee1.id).not.toBe(employee2.id);
      expect(employee1.firstName).toBe('Emma');
      expect(employee2.firstName).toBe('Frank');

      // Verify both are in database by looking them up individually
      const found1 = await prisma.employee.findUnique({ where: { id: employee1.id } });
      const found2 = await prisma.employee.findUnique({ where: { id: employee2.id } });
      expect(found1).toBeDefined();
      expect(found2).toBeDefined();
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      const beforeCreation = new Date();

      const employeeData: EmployeeCreateInput = {
        firstName: 'Grace',
        lastName: 'Lee',
        jobTitle: 'Analyst',
        country: 'Singapore',
        salary: 70000,
        hireDate: new Date('2024-01-01'),
        employmentType: 'Full-time',
      };

      const employee = await createEmployee(employeeData);
      const afterCreation = new Date();

      expect(employee.createdAt).toBeInstanceOf(Date);
      expect(employee.updatedAt).toBeInstanceOf(Date);
      expect(employee.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(employee.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      expect(employee.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(employee.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });

    it('should handle various employment types', async () => {
      const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];

      for (const employmentType of employmentTypes) {
        const employeeData: EmployeeCreateInput = {
          firstName: 'Test',
          lastName: employmentType,
          jobTitle: 'Employee',
          country: 'USA',
          salary: 50000,
          hireDate: new Date('2024-01-01'),
          employmentType: employmentType,
        };

        const employee = await createEmployee(employeeData);
        expect(employee.employmentType).toBe(employmentType);
      }
    });

    it('should handle long text values', async () => {
      const longDepartmentName =
        'Department of Advanced Research and Development for Future Technologies';
      const employeeData: EmployeeCreateInput = {
        firstName: 'Henry',
        lastName: 'Martinez',
        jobTitle: 'Senior Principal Staff Engineer Architect',
        country: 'United States of America',
        salary: 150000,
        department: longDepartmentName,
        hireDate: new Date('2024-01-01'),
        employmentType: 'Full-time',
      };

      const employee = await createEmployee(employeeData);

      expect(employee).toBeDefined();
      expect(employee.department).toBe(longDepartmentName);
      expect(employee.jobTitle).toBe('Senior Principal Staff Engineer Architect');
    });

    it('should handle different date formats correctly', async () => {
      const testDates = [
        new Date('2024-01-01'),
        new Date('2023-12-31T23:59:59'),
        new Date(2024, 0, 15), // January 15, 2024
      ];

      for (let i = 0; i < testDates.length; i++) {
        const employeeData: EmployeeCreateInput = {
          firstName: `Test${i}`,
          lastName: 'DateTest',
          jobTitle: 'Tester',
          country: 'USA',
          salary: 60000,
          hireDate: testDates[i],
          employmentType: 'Full-time',
        };

        const employee = await createEmployee(employeeData);
        expect(employee.hireDate).toBeInstanceOf(Date);
      }
    });
  });

  describe('getEmployees', () => {
    const makeEmployeeData = (
      overrides: Partial<EmployeeCreateInput> = {}
    ): EmployeeCreateInput => ({
      firstName: 'Jane',
      lastName: 'Smith',
      jobTitle: 'Engineer',
      country: 'USA',
      salary: 80000,
      hireDate: new Date('2024-01-15'),
      employmentType: 'Full-time',
      ...overrides,
    });

    it('should return empty array and total 0 when no employees exist', async () => {
      const result = await getEmployees();

      expect(result.employees).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should return all employees and correct total', async () => {
      await createEmployee(makeEmployeeData({ firstName: 'Alice' }));
      await createEmployee(makeEmployeeData({ firstName: 'Bob' }));

      const result = await getEmployees();

      expect(result.employees).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should apply skip to offset results', async () => {
      await createEmployee(makeEmployeeData({ firstName: 'First' }));
      await createEmployee(makeEmployeeData({ firstName: 'Second' }));
      await createEmployee(makeEmployeeData({ firstName: 'Third' }));

      const result = await getEmployees(1, 10);

      expect(result.employees).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.employees[0].firstName).toBe('Second');
    });

    it('should apply take to limit results', async () => {
      await createEmployee(makeEmployeeData({ firstName: 'Alice' }));
      await createEmployee(makeEmployeeData({ firstName: 'Bob' }));
      await createEmployee(makeEmployeeData({ firstName: 'Carol' }));

      const result = await getEmployees(0, 2);

      expect(result.employees).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    it('should return total reflecting full count regardless of pagination', async () => {
      await createEmployee(makeEmployeeData({ firstName: 'Alice' }));
      await createEmployee(makeEmployeeData({ firstName: 'Bob' }));
      await createEmployee(makeEmployeeData({ firstName: 'Carol' }));
      await createEmployee(makeEmployeeData({ firstName: 'Dave' }));
      await createEmployee(makeEmployeeData({ firstName: 'Eve' }));

      const result = await getEmployees(0, 2);

      expect(result.total).toBe(5);
      expect(result.employees).toHaveLength(2);
    });

    it('should order results by id ascending', async () => {
      await createEmployee(makeEmployeeData({ firstName: 'Alice' }));
      await createEmployee(makeEmployeeData({ firstName: 'Bob' }));
      await createEmployee(makeEmployeeData({ firstName: 'Carol' }));

      const result = await getEmployees();

      const ids = result.employees.map((e) => e.id);
      expect(ids).toEqual([...ids].sort((a, b) => a - b));
    });

    it('should return empty array when skip exceeds total count', async () => {
      await createEmployee(makeEmployeeData());

      const result = await getEmployees(10, 50);

      expect(result.employees).toHaveLength(0);
      expect(result.total).toBe(1);
    });

    it('should use defaults of skip=0 and take=50', async () => {
      await createEmployee(makeEmployeeData());

      const result = await getEmployees();

      expect(result.employees).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    describe('search', () => {
      it('should return employees whose firstName matches the search term', async () => {
        await createEmployee(makeEmployeeData({ firstName: 'Alice', lastName: 'Smith' }));
        await createEmployee(makeEmployeeData({ firstName: 'Bob', lastName: 'Jones' }));

        const result = await getEmployees(0, 50, 'alice');

        expect(result.employees).toHaveLength(1);
        expect(result.employees[0].firstName).toBe('Alice');
      });

      it('should return employees whose lastName matches the search term', async () => {
        await createEmployee(makeEmployeeData({ firstName: 'Alice', lastName: 'Smith' }));
        await createEmployee(makeEmployeeData({ firstName: 'Bob', lastName: 'Jones' }));

        const result = await getEmployees(0, 50, 'jones');

        expect(result.employees).toHaveLength(1);
        expect(result.employees[0].lastName).toBe('Jones');
      });

      it('should match regardless of case', async () => {
        await createEmployee(makeEmployeeData({ firstName: 'Alice', lastName: 'Smith' }));

        const result = await getEmployees(0, 50, 'ALICE');

        expect(result.employees).toHaveLength(1);
        expect(result.employees[0].firstName).toBe('Alice');
      });

      it('should match partial names', async () => {
        await createEmployee(makeEmployeeData({ firstName: 'Alexander', lastName: 'Smith' }));
        await createEmployee(makeEmployeeData({ firstName: 'Alex', lastName: 'Jones' }));
        await createEmployee(makeEmployeeData({ firstName: 'Bob', lastName: 'Taylor' }));

        const result = await getEmployees(0, 50, 'alex');

        expect(result.employees).toHaveLength(2);
      });

      it('should return empty array when no employee matches', async () => {
        await createEmployee(makeEmployeeData({ firstName: 'Alice', lastName: 'Smith' }));

        const result = await getEmployees(0, 50, 'xyz_no_match');

        expect(result.employees).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should return accurate total reflecting only matching records', async () => {
        await createEmployee(makeEmployeeData({ firstName: 'Alice', lastName: 'Smith' }));
        await createEmployee(makeEmployeeData({ firstName: 'Alice', lastName: 'Jones' }));
        await createEmployee(makeEmployeeData({ firstName: 'Bob', lastName: 'Taylor' }));

        const result = await getEmployees(0, 1, 'alice');

        expect(result.employees).toHaveLength(1);
        expect(result.total).toBe(2);
      });

      it('should return all employees when search is undefined', async () => {
        await createEmployee(makeEmployeeData({ firstName: 'Alice' }));
        await createEmployee(makeEmployeeData({ firstName: 'Bob' }));

        const result = await getEmployees(0, 50, undefined);

        expect(result.employees).toHaveLength(2);
        expect(result.total).toBe(2);
      });
    });

    describe('department filter', () => {
      it('should return only employees in the specified department', async () => {
        await createEmployee(makeEmployeeData({ firstName: 'Alice', department: 'Engineering' }));
        await createEmployee(makeEmployeeData({ firstName: 'Bob', department: 'Marketing' }));

        const result = await getEmployees(0, 50, undefined, 'Engineering');

        expect(result.employees).toHaveLength(1);
        expect(result.employees[0].firstName).toBe('Alice');
      });

      it('should return all employees when department is undefined', async () => {
        await createEmployee(makeEmployeeData({ firstName: 'Alice', department: 'Engineering' }));
        await createEmployee(makeEmployeeData({ firstName: 'Bob', department: 'Marketing' }));

        const result = await getEmployees(0, 50, undefined, undefined);

        expect(result.employees).toHaveLength(2);
      });

      it('should return accurate total reflecting only matching department', async () => {
        await createEmployee(makeEmployeeData({ firstName: 'Alice', department: 'Engineering' }));
        await createEmployee(makeEmployeeData({ firstName: 'Bob', department: 'Engineering' }));
        await createEmployee(makeEmployeeData({ firstName: 'Carol', department: 'Marketing' }));

        const result = await getEmployees(0, 1, undefined, 'Engineering');

        expect(result.employees).toHaveLength(1);
        expect(result.total).toBe(2);
      });

      it('should return empty array when no employees match the department', async () => {
        await createEmployee(makeEmployeeData({ firstName: 'Alice', department: 'Engineering' }));

        const result = await getEmployees(0, 50, undefined, 'HR');

        expect(result.employees).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should combine department filter with search term', async () => {
        await createEmployee(
          makeEmployeeData({ firstName: 'Alice', lastName: 'Smith', department: 'Engineering' })
        );
        await createEmployee(
          makeEmployeeData({ firstName: 'Alice', lastName: 'Jones', department: 'Marketing' })
        );
        await createEmployee(
          makeEmployeeData({ firstName: 'Bob', lastName: 'Taylor', department: 'Engineering' })
        );

        const result = await getEmployees(0, 50, 'alice', 'Engineering');

        expect(result.employees).toHaveLength(1);
        expect(result.employees[0].department).toBe('Engineering');
        expect(result.employees[0].firstName).toBe('Alice');
      });
    });
  });

  describe('getEmployeeById', () => {
    const makeEmployeeData = (): EmployeeCreateInput => ({
      firstName: 'Jane',
      lastName: 'Smith',
      jobTitle: 'Engineer',
      country: 'USA',
      salary: 80000,
      hireDate: new Date('2024-01-15'),
      employmentType: 'Full-time',
    });

    it('should return the employee when found', async () => {
      const created = await createEmployee(makeEmployeeData());

      const result = await getEmployeeById(created.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(created.id);
    });

    it('should return employee with all correct fields', async () => {
      const data = makeEmployeeData();
      const created = await createEmployee(data);

      const result = await getEmployeeById(created.id);

      expect(result!.firstName).toBe(data.firstName);
      expect(result!.lastName).toBe(data.lastName);
      expect(result!.jobTitle).toBe(data.jobTitle);
      expect(result!.country).toBe(data.country);
      expect(result!.salary).toBe(data.salary);
      expect(result!.employmentType).toBe(data.employmentType);
      expect(result!.hireDate).toBeInstanceOf(Date);
      expect(result!.createdAt).toBeInstanceOf(Date);
      expect(result!.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null when employee does not exist', async () => {
      const result = await getEmployeeById(999999);

      expect(result).toBeNull();
    });

    it('should not return a different employee', async () => {
      const emp1 = await createEmployee({ ...makeEmployeeData(), firstName: 'Alice' });
      const emp2 = await createEmployee({ ...makeEmployeeData(), firstName: 'Bob' });

      const result = await getEmployeeById(emp1.id);

      expect(result!.id).toBe(emp1.id);
      expect(result!.firstName).toBe('Alice');
      expect(result!.id).not.toBe(emp2.id);
    });
  });

  describe('deleteEmployee', () => {
    const makeEmployeeData = (): EmployeeCreateInput => ({
      firstName: 'Jane',
      lastName: 'Smith',
      jobTitle: 'Engineer',
      country: 'USA',
      salary: 80000,
      hireDate: new Date('2024-01-15'),
      employmentType: 'Full-time',
    });

    it('should delete an existing employee and return the deleted record', async () => {
      const created = await createEmployee(makeEmployeeData());

      const result = await deleteEmployee(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(created.id);
    });

    it('should remove the employee from the database', async () => {
      const created = await createEmployee(makeEmployeeData());

      await deleteEmployee(created.id);

      const found = await prisma.employee.findUnique({ where: { id: created.id } });
      expect(found).toBeNull();
    });

    it('should return null when employee does not exist', async () => {
      const result = await deleteEmployee(999999);

      expect(result).toBeNull();
    });

    it('should only delete the targeted employee', async () => {
      const target = await createEmployee({ ...makeEmployeeData(), firstName: 'Alice' });
      const other = await createEmployee({ ...makeEmployeeData(), firstName: 'Bob' });

      await deleteEmployee(target.id);

      const remaining = await prisma.employee.findUnique({ where: { id: other.id } });
      expect(remaining).not.toBeNull();
      expect(remaining!.firstName).toBe('Bob');
    });

    it('should return null on second delete of same id', async () => {
      const created = await createEmployee(makeEmployeeData());
      await deleteEmployee(created.id);

      const result = await deleteEmployee(created.id);

      expect(result).toBeNull();
    });

    it('should return deleted employee with all correct fields', async () => {
      const data = makeEmployeeData();
      const created = await createEmployee(data);

      const result = await deleteEmployee(created.id);

      expect(result!.firstName).toBe(data.firstName);
      expect(result!.lastName).toBe(data.lastName);
      expect(result!.jobTitle).toBe(data.jobTitle);
      expect(result!.country).toBe(data.country);
      expect(result!.salary).toBe(data.salary);
      expect(result!.employmentType).toBe(data.employmentType);
    });
  });
});
