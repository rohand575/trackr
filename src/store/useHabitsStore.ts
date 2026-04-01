import { create } from 'zustand';
import type { Habit } from '../types/habits';

interface HabitsState {
  habits: Habit[];
  loading: boolean;
  setHabits: (habits: Habit[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useHabitsStore = create<HabitsState>((set) => ({
  habits: [],
  loading: true,
  setHabits: (habits) => set({ habits }),
  setLoading: (loading) => set({ loading }),
}));
