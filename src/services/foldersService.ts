import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { DocumentFolder, DocumentFolderFormData } from '../types/documents';

const ref = (userId: string) => collection(db, 'users', userId, 'folders');

const toFolder = (id: string, d: Record<string, unknown>): DocumentFolder => ({
  id,
  userId: d.userId as string,
  name: d.name as string,
  parentId: (d.parentId as string | null) ?? null,
  createdAt:
    d.createdAt instanceof Timestamp
      ? d.createdAt.toDate().toISOString()
      : (d.createdAt as string) ?? new Date().toISOString(),
});

export const addFolder = async (userId: string, data: DocumentFolderFormData): Promise<string> => {
  const r = await addDoc(ref(userId), { ...data, userId, createdAt: serverTimestamp() });
  return r.id;
};

export const updateFolder = async (
  userId: string,
  folderId: string,
  data: Partial<DocumentFolderFormData>
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'folders', folderId), { ...data });
};

export const deleteFolder = async (userId: string, folderId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'folders', folderId));
};

export const subscribeToFolders = (
  userId: string,
  callback: (folders: DocumentFolder[]) => void
): Unsubscribe => {
  const q = query(ref(userId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => toFolder(d.id, d.data() as Record<string, unknown>)))
  );
};
