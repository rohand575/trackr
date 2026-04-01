import { create } from 'zustand';
import type { Subscription, SubscriptionFilters } from '../types/subscription';

interface SubscriptionState {
  subscriptions: Subscription[];
  filters: SubscriptionFilters;
  loading: boolean;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setLoading: (loading: boolean) => void;
  setFilter: <K extends keyof SubscriptionFilters>(key: K, value: SubscriptionFilters[K]) => void;
  resetFilters: () => void;
}

const defaultFilters: SubscriptionFilters = {
  search: '',
  category: 'All',
  status: 'All',
  billingCycle: 'All',
};

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscriptions: [],
  filters: defaultFilters,
  loading: true,
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setLoading: (loading) => set({ loading }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
