import { Router, Request, Response } from 'express';
import { createEmployeeSchema } from '../lib/validation';
import { employeeService } from '../services/employeeService';

const router = Router();

/**
 * POST /api/employees - Create a new employee
 * @param {Request} req - Express request with employee data in body
 * @param {Response} res - Express response
 */
router.post('/', async (req: Request, res: Response) => {
  // Validate input using Zod schema with safeParse
  const validationResult = createEmployeeSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`);

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

export default router;
