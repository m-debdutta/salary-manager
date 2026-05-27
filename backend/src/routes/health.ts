import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 * Returns the current status and uptime of the service
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
