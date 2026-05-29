import { Router, Request, Response } from 'express';
import { createEmployeeSchema, updateEmployeeSchema } from '../lib/validation';
import { employeeService } from '../services/employeeService';

const router = Router();

/**
 * GET /api/employees - Get all employees with optional pagination
 * Query params: page (default 1), pageSize (default 50)
 */
router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 50));
  const skip = (page - 1) * pageSize;
  const search = (req.query.search as string)?.trim() || undefined;
  const department = (req.query.department as string)?.trim() || undefined;
  const jobTitle = (req.query.jobTitle as string)?.trim() || undefined;
  const country = (req.query.country as string)?.trim() || undefined;

  try {
    const result = await employeeService.getEmployees(
      skip,
      pageSize,
      search,
      department,
      jobTitle,
      country
    );

    return res.status(200).json({
      employees: result.employees.map((e) => ({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        jobTitle: e.jobTitle,
        country: e.country,
        salary: e.salary,
        department: e.department,
        hireDate: e.hireDate.toISOString().split('T')[0],
        employmentType: e.employmentType,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

/**
 * GET /api/employees/:id - Get a single employee by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  const raw = req.params.id;
  const id = /^\d+$/.test(raw as string) ? parseInt(raw as string, 10) : NaN;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid employee ID' });
  }

  try {
    const employee = await employeeService.getEmployeeById(id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    return res.status(200).json({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      jobTitle: employee.jobTitle,
      country: employee.country,
      salary: employee.salary,
      department: employee.department,
      hireDate: employee.hireDate.toISOString().split('T')[0],
      employmentType: employee.employmentType,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

/**
 * POST /api/employees - Create a new employee
 * @param {Request} req - Express request with employee data in body
 * @param {Response} res - Express response
 */
router.post('/', async (req: Request, res: Response) => {
  // Validate input using Zod schema with safeParse
  const validationResult = createEmployeeSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );

    return res.status(400).json({
      error: errorMessages,
    });
  }

  try {
    // Create employee using service
    const employee = await employeeService.createEmployee(validationResult.data);

    // Return created employee with 201 status
    return res.status(201).json({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      jobTitle: employee.jobTitle,
      country: employee.country,
      salary: employee.salary,
      department: employee.department,
      hireDate: employee.hireDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      employmentType: employee.employmentType,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    });
  } catch (error: any) {
    // Handle other errors
    console.error('Error creating employee:', error);
    return res.status(500).json({
      error: 'Failed to create employee',
    });
  }
});

/**
 * PUT /api/employees/:id - Update an existing employee
 */
router.put('/:id', async (req: Request, res: Response) => {
  const raw = req.params.id;
  const id = /^\d+$/.test(raw as string) ? parseInt(raw as string, 10) : NaN;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid employee ID' });
  }

  const validationResult = updateEmployeeSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    return res.status(400).json({ error: errorMessages });
  }

  try {
    const employee = await employeeService.updateEmployee(id, validationResult.data);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    return res.status(200).json({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      jobTitle: employee.jobTitle,
      country: employee.country,
      salary: employee.salary,
      department: employee.department,
      hireDate: employee.hireDate.toISOString().split('T')[0],
      employmentType: employee.employmentType,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return res.status(500).json({ error: 'Failed to update employee' });
  }
});

/**
 * DELETE /api/employees/:id - Delete an employee by ID
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const raw = req.params.id;
  const id = /^\d+$/.test(raw as string) ? parseInt(raw as string, 10) : NaN;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid employee ID' });
  }

  try {
    const deleted = await employeeService.deleteEmployee(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    return res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;
