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


export default router;
