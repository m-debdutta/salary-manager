import {
  getSalaryByCountry,
  getSalaryByJobTitle,
  SalaryByCountryRow,
  SalaryByJobTitleRow,
} from '../db/analyticsRepository';

/**
 * Analytics Service - Business logic for salary analytics
 */
export class AnalyticsService {
  async getSalaryByCountry(): Promise<SalaryByCountryRow[]> {
    return getSalaryByCountry();
  }

  async getSalaryByJobTitle(country?: string): Promise<SalaryByJobTitleRow[]> {
    return getSalaryByJobTitle(country);
  }
}

export const analyticsService = new AnalyticsService();
