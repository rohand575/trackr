import { create } from 'zustand';
import type { Idea } from '../types/ideas';

interface IdeasState {
  ideas: Idea[];
  loading: boolean;
  setIdeas: (ideas: Idea[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useIdeasStore = create<IdeasState>((set) => ({
  ideas: [],
  loading: true,
  setIdeas: (ideas) => set({ ideas }),
  setLoading: (loading) => set({ loading }),
}));
