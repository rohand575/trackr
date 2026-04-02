import { create } from 'zustand';
import type { Bill, BillFilters } from '../types/bills';

interface BillsState {
  bills: Bill[];
  filters: BillFilters;
  loading: boolean;
  setBills: (bills: Bill[]) => void;
  setLoading: (loading: boolean) => void;
  setFilter: <K extends keyof BillFilters>(key: K, value: BillFilters[K]) => void;
  resetFilters: () => void;
}

const defaultFilters: BillFilters = {
  search: '',
  category: 'All',
  status: 'All',
  billingCycle: 'All',
};

export const useBillsStore = create<BillsState>((set) => ({
  bills: [],
  filters: defaultFilters,
  loading: true,
  setBills: (bills) => set({ bills }),
  setLoading: (loading) => set({ loading }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
