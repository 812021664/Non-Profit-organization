import { apiClient } from './apiClient';

export interface AssistantAnswer {
  answer: string;
  suggestions: string[];
  source: 'local' | 'api';
}

export async function askAssistant(question: string, signal?: AbortSignal): Promise<AssistantAnswer> {
  const endpoint = import.meta.env.VITE_ASSISTANT_ENDPOINT;
  if (endpoint) {
    const { data } = await apiClient.post<AssistantAnswer>(endpoint, { question }, { signal });
    return data;
  }
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, 450);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
  return { answer: '', suggestions: [], source: 'local' };
}
