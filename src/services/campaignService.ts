import { apiClient } from './apiClient';
import type { Campaign } from '@/types';

export const campaignService = {
  list: () => apiClient.get<Campaign[]>('/campaigns'),
  get: (id: string) => apiClient.get<Campaign>(`/campaigns/${id}`),
  save: (campaign: Campaign) => apiClient.put<Campaign>(`/campaigns/${campaign.id}`, campaign),
};
