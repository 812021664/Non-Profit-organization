import { apiClient } from './apiClient';
import type { SentCommunication } from '@/types';

export const communicationService = {
  list: () => apiClient.get<SentCommunication[]>('/communications'),
  send: (message: Omit<SentCommunication, 'id' | 'sentAt' | 'status'>) => apiClient.post<SentCommunication>('/communications/send', message),
  schedule: (message: Omit<SentCommunication, 'id' | 'sentAt' | 'status'>, sendAt: string) => apiClient.post<SentCommunication>('/communications/schedule', { ...message, sendAt }),
};
