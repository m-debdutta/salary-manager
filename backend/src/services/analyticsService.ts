import {
  getSalaryByCountry,
  SalaryByCountryRow,
} from '../db/analyticsRepository';

/**
 * Analytics Service - Business logic for salary analytics
 */
export class AnalyticsService {
  async getSalaryByCountry(): Promise<SalaryByCountryRow[]> {
    return getSalaryByCountry();
  }
}

export const analyticsService = new AnalyticsService();
