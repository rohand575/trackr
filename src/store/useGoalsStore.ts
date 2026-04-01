import { create } from 'zustand';
import type { Goal } from '../types/goals';

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  setGoals: (goals: Goal[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  loading: true,
  setGoals: (goals) => set({ goals }),
  setLoading: (loading) => set({ loading }),
}));
