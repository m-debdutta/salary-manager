import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import analyticsRouter from '../../../src/routes/analytics';
import { analyticsService } from '../../../src/services/analyticsService';

vi.mock('../../../src/services/analyticsService', () => ({
  analyticsService: {
    getSalaryByCountry: vi.fn()
  },
}));

const createApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use('/api/analytics', analyticsRouter);
  return app;
};

describe('Analytics Router', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
    vi.clearAllMocks();
  });

  // ─── GET /api/analytics/salary-by-country ─────────────────────────────────

  describe('GET /api/analytics/salary-by-country', () => {
    it('should return 200 with salary stats grouped by country', async () => {
      vi.mocked(analyticsService.getSalaryByCountry).mockResolvedValue([
        { country: 'USA', count: 100, min: 50000, max: 200000, avg: 120000, median: 110000 },
        { country: 'UK', count: 50, min: 40000, max: 160000, avg: 90000, median: 85000 },
      ]);

      const response = await request(app).get('/api/analytics/salary-by-country');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        country: 'USA',
        count: 100,
        min: 50000,
        max: 200000,
        avg: 120000,
        median: 110000,
      });
    });

    it('should return 200 with empty array when no employees exist', async () => {
      vi.mocked(analyticsService.getSalaryByCountry).mockResolvedValue([]);

      const response = await request(app).get('/api/analytics/salary-by-country');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 500 when service throws an error', async () => {
      vi.mocked(analyticsService.getSalaryByCountry).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/analytics/salary-by-country');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
