import {
  getSalaryByCountry,
  getSalaryByJobTitle,
  getSalaryDistribution,
  getDepartmentSummary,
  SalaryByCountryRow,
  SalaryByJobTitleRow,
  SalaryDistributionRow,
  DepartmentSummaryRow,
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

  async getSalaryDistribution(): Promise<SalaryDistributionRow[]> {
    return getSalaryDistribution();
  }

  async getDepartmentSummary(): Promise<DepartmentSummaryRow[]> {
    return getDepartmentSummary();
  }
}

export const analyticsService = new AnalyticsService();
