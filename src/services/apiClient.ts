import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: baseURL || '/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('kindred-session');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
);

export const isApiConfigured = Boolean(baseURL);
