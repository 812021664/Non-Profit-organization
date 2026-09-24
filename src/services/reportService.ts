import { apiClient } from './apiClient';

export type ReportFormat = 'csv' | 'json' | 'pdf';

export const reportService = {
  generate: (type: 'giving' | 'donors' | 'campaigns' | 'financial', format: ReportFormat, from?: string, to?: string) => apiClient.post<{ downloadUrl: string }>('/reports/generate', { type, format, from, to }, { responseType: 'blob' }),
  schedule: (type: string, format: ReportFormat, cadence: string, recipients: string[]) => apiClient.post<{ id: string }>('/reports/schedules', { type, format, cadence, recipients }),
};
