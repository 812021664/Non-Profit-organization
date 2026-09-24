import { apiClient } from './apiClient';
import type { Donor } from '@/types';

export interface DonorListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  tier?: string;
}

export const donorService = {
  list: (params: DonorListParams = {}) => apiClient.get<Donor[]>('/donors', { params }),
  get: (id: string) => apiClient.get<Donor>(`/donors/${id}`),
  save: (donor: Donor) => apiClient.put<Donor>(`/donors/${donor.id}`, donor),
};
