import { Router, Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';

const router = Router();

/**
 * GET /api/analytics/salary-by-country
 * Returns min/max/avg/median salary and employee count grouped by country.
 */
router.get('/salary-by-country', async (_req: Request, res: Response) => {
  try {
    const data = await analyticsService.getSalaryByCountry();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching salary-by-country:', error);
    return res.status(500).json({ error: 'Failed to fetch salary by country' });
  }
});

/**
 * GET /api/analytics/salary-by-job-title
 * Returns salary stats grouped by job title.
 * Optional query param: country (string) — filters employees by country first.
 */
router.get('/salary-by-job-title', async (req: Request, res: Response) => {
  const country = req.query.country as string | undefined;

  try {
    const data = await analyticsService.getSalaryByJobTitle(country);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching salary-by-job-title:', error);
    return res.status(500).json({ error: 'Failed to fetch salary by job title' });
  }
});

/**
 * GET /api/analytics/salary-distribution
 * Returns employee counts bucketed into salary ranges.
 */
router.get('/salary-distribution', async (_req: Request, res: Response) => {
  try {
    const data = await analyticsService.getSalaryDistribution();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching salary-distribution:', error);
    return res.status(500).json({ error: 'Failed to fetch salary distribution' });
  }
});

/**
 * GET /api/analytics/department-summary
 * Returns salary stats grouped by department.
 */
router.get('/department-summary', async (_req: Request, res: Response) => {
  try {
    const data = await analyticsService.getDepartmentSummary();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching department-summary:', error);
    return res.status(500).json({ error: 'Failed to fetch department summary' });
  }
});

export default router;
