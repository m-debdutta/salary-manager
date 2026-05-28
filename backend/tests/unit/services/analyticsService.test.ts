import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from '../../../src/services/analyticsService';
import * as analyticsRepository from '../../../src/db/analyticsRepository';

vi.mock('../../../src/db/analyticsRepository');

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── getSalaryByCountry ────────────────────────────────────────────────────

  describe('getSalaryByCountry', () => {
    it('should return salary stats grouped by country', async () => {
      const mockData = [
        { country: 'USA', count: 100, min: 50000, max: 200000, avg: 120000, median: 110000 },
        { country: 'UK', count: 50, min: 40000, max: 160000, avg: 90000, median: 85000 },
      ];
      vi.mocked(analyticsRepository.getSalaryByCountry).mockResolvedValue(mockData);

      const result = await analyticsService.getSalaryByCountry();

      expect(result).toEqual(mockData);
      expect(analyticsRepository.getSalaryByCountry).toHaveBeenCalledOnce();
    });

    it('should return empty array when no data exists', async () => {
      vi.mocked(analyticsRepository.getSalaryByCountry).mockResolvedValue([]);

      const result = await analyticsService.getSalaryByCountry();

      expect(result).toEqual([]);
    });

    it('should propagate errors from repository', async () => {
      vi.mocked(analyticsRepository.getSalaryByCountry).mockRejectedValue(new Error('DB error'));

      await expect(analyticsService.getSalaryByCountry()).rejects.toThrow('DB error');
    });
  });
});
