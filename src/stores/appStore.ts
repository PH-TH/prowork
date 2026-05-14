import { create } from 'zustand';
import type { PageKey } from '../types/dashboard';
import { uid } from '../lib/utils';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning';
}

interface AppState {
  activePage: PageKey;
  searchQuery: string;
  dateFilter: string;
  themeMode: 'light' | 'dark';
  financeUnlocked: boolean;
  toasts: ToastMessage[];
  setActivePage: (page: PageKey) => void;
  setSearchQuery: (value: string) => void;
  setDateFilter: (value: string) => void;
  toggleThemeMode: () => void;
  unlockFinance: () => void;
  lockFinance: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activePage: 'dashboard',
  searchQuery: '',
  dateFilter: '2026-05-04',
  themeMode: 'light',
  financeUnlocked: false,
  toasts: [],
  setActivePage: (page) => set({ activePage: page }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setDateFilter: (dateFilter) => set({ dateFilter }),
  toggleThemeMode: () => set((state) => ({ themeMode: state.themeMode === 'dark' ? 'light' : 'dark' })),
  unlockFinance: () => set({ financeUnlocked: true }),
  lockFinance: () => set({ financeUnlocked: false }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: uid('toast'), type: 'success', ...toast }],
    })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
