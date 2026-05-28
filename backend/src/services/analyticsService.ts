import {
  getSalaryByCountry,
  getSalaryByJobTitle,
  getSalaryDistribution,
  getDepartmentSummary,
  getOverview,
  SalaryByCountryRow,
  SalaryByJobTitleRow,
  SalaryDistributionRow,
  DepartmentSummaryRow,
  OverviewStats,
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

  async getOverview(): Promise<OverviewStats> {
    return getOverview();
  }
}

export const analyticsService = new AnalyticsService();
