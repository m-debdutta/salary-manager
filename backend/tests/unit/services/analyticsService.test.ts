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

  // ─── getSalaryByJobTitle ───────────────────────────────────────────────────

  describe('getSalaryByJobTitle', () => {
    it('should return salary stats grouped by job title without filter', async () => {
      const mockData = [
        {
          jobTitle: 'Software Engineer',
          count: 50,
          min: 80000,
          max: 180000,
          avg: 130000,
          median: 125000,
        },
      ];
      vi.mocked(analyticsRepository.getSalaryByJobTitle).mockResolvedValue(mockData);

      const result = await analyticsService.getSalaryByJobTitle();

      expect(result).toEqual(mockData);
      expect(analyticsRepository.getSalaryByJobTitle).toHaveBeenCalledWith(undefined);
    });

    it('should pass country filter to repository', async () => {
      vi.mocked(analyticsRepository.getSalaryByJobTitle).mockResolvedValue([]);

      await analyticsService.getSalaryByJobTitle('USA');

      expect(analyticsRepository.getSalaryByJobTitle).toHaveBeenCalledWith('USA');
    });

    it('should return empty array when no matching data', async () => {
      vi.mocked(analyticsRepository.getSalaryByJobTitle).mockResolvedValue([]);

      const result = await analyticsService.getSalaryByJobTitle('Unknown');

      expect(result).toEqual([]);
    });

    it('should propagate errors from repository', async () => {
      vi.mocked(analyticsRepository.getSalaryByJobTitle).mockRejectedValue(new Error('DB error'));

      await expect(analyticsService.getSalaryByJobTitle()).rejects.toThrow('DB error');
    });
  });
});
