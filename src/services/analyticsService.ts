import { apiClient } from './apiClient';

export interface AnalyticsSummary {
  revenue: number;
  donations: number;
  averageGift: number;
  donorRetention: number;
  activeDonors: number;
}

export const analyticsService = {
  summary: (from: string, to: string) => apiClient.get<AnalyticsSummary>('/analytics/summary', { params: { from, to } }),
  trends: (months = 12) => apiClient.get<unknown[]>('/analytics/trends', { params: { months } }),
  campaignPerformance: (from: string, to: string) => apiClient.get<unknown[]>('/analytics/campaigns', { params: { from, to } }),
};
