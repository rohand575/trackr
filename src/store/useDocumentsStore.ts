import { create } from 'zustand';
import type { Document } from '../types/documents';

interface DocumentsState {
  documents: Document[];
  loading: boolean;
  setDocuments: (documents: Document[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  documents: [],
  loading: true,
  setDocuments: (documents) => set({ documents }),
  setLoading: (loading) => set({ loading }),
}));
