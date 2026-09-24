import { create } from 'zustand';
import { uid } from '@/lib/utils';

export type ToastKind = 'success' | 'info' | 'error';
export type DataMode = 'local' | 'syncing' | 'connected' | 'offline';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  kind: ToastKind;
}

interface UIState {
  mobileNavOpen: boolean;
  donationModalOpen: boolean;
  globalSearchOpen: boolean;
  notificationsOpen: boolean;
  dataMode: DataMode;
  backendStatus: {
    storage: string;
    donors: number;
    donations: number;
    campaigns: number;
    lastSyncedAt: string | null;
  } | null;
  syncNow: () => void;
  toasts: ToastMessage[];
  setMobileNavOpen: (open: boolean) => void;
  setDonationModalOpen: (open: boolean) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setDataMode: (mode: DataMode) => void;
  setBackendStatus: (status: UIState['backendStatus']) => void;
  setSyncNow: (sync: () => void) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  donationModalOpen: false,
  globalSearchOpen: false,
  notificationsOpen: false,
  dataMode: 'local',
  backendStatus: null,
  syncNow: () => undefined,
  toasts: [],
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setDonationModalOpen: (donationModalOpen) => set({ donationModalOpen }),
  setGlobalSearchOpen: (globalSearchOpen) => set({ globalSearchOpen }),
  setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
  setDataMode: (dataMode) => set({ dataMode }),
  setBackendStatus: (backendStatus) => set({ backendStatus }),
  setSyncNow: (syncNow) => set({ syncNow }),
  addToast: (toast) => set((state) => ({ toasts: [...state.toasts, { ...toast, id: uid('toast') }] })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
