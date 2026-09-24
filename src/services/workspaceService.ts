import { apiClient } from './apiClient';
import type { Campaign, Donation, Donor } from '@/types';

export interface WorkspaceStatus {
  initialized: boolean;
  integration: string;
  storage: string;
  donors: number;
  donations: number;
  campaigns: number;
  legacyCapabilities: string[];
  serverTime: string;
}

export interface BootstrapResponse {
  donors: Donor[];
  donations: Donation[];
  campaigns: Campaign[];
  status: WorkspaceStatus;
}

export interface ImportResult {
  donorsImported: number;
  donationsImported: number;
  campaignsImported: number;
}

export const workspaceService = {
  status: () => apiClient.get<WorkspaceStatus>('/status'),
  bootstrap: () => apiClient.get<BootstrapResponse>('/bootstrap'),
  importWorkspace: (data: { donors: Donor[]; donations: Donation[]; campaigns: Campaign[] }) => apiClient.post<ImportResult>('/import', data, { timeout: 30_000 }),
  legacyReport: () => apiClient.get<{ donors: { name: string; email: string; totalDonations: number }[]; grandTotal: number }>('/legacy/reports'),
};
