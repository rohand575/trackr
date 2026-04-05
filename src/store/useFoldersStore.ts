import { create } from 'zustand';
import type { DocumentFolder } from '../types/documents';

interface FoldersState {
  folders: DocumentFolder[];
  loading: boolean;
  setFolders: (folders: DocumentFolder[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useFoldersStore = create<FoldersState>((set) => ({
  folders: [],
  loading: true,
  setFolders: (folders) => set({ folders }),
  setLoading: (loading) => set({ loading }),
}));
