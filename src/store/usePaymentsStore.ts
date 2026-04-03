import { create } from 'zustand';
import type { PaymentItem, PaymentFilters } from '../types/payment';

interface PaymentsState {
  payments: PaymentItem[];
  filters: PaymentFilters;
  loading: boolean;
  setPayments: (payments: PaymentItem[]) => void;
  setLoading: (loading: boolean) => void;
  setFilter: <K extends keyof PaymentFilters>(key: K, value: PaymentFilters[K]) => void;
  resetFilters: () => void;
}

const defaultFilters: PaymentFilters = {
  search: '',
  type: 'All',
  category: 'All',
  status: 'All',
  billingCycle: 'All',
};

export const usePaymentsStore = create<PaymentsState>((set) => ({
  payments: [],
  filters: defaultFilters,
  loading: true,
  setPayments: (payments) => set({ payments }),
  setLoading: (loading) => set({ loading }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
