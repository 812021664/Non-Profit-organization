import { apiClient } from './apiClient';
import type { Donation } from '@/types';

export interface DonationListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  campaignId?: string;
  donorId?: string;
  from?: string;
  to?: string;
}

export const donationService = {
  list: (params: DonationListParams = {}) => apiClient.get<Donation[]>('/donations', { params }),
  get: (id: string) => apiClient.get<Donation>(`/donations/${id}`),
  save: (donation: Donation) => apiClient.put<Donation>(`/donations/${donation.id}`, donation),
};
