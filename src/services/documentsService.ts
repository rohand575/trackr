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
import type { Document, DocumentFormData, DocumentStatus } from '../types/documents';

const ref = (userId: string) => collection(db, 'users', userId, 'documents');

const getStatus = (expiryDate: string): DocumentStatus => {
  if (!expiryDate) return 'No Expiry';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate + 'T00:00:00');
  const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Expired';
  if (diff <= 60) return 'Expiring Soon';
  return 'Valid';
};

const toDocument = (id: string, d: Record<string, unknown>): Document => ({
  id,
  userId: d.userId as string,
  name: d.name as string,
  category: d.category as Document['category'],
  issuer: (d.issuer as string) ?? '',
  country: (d.country as string) ?? '',
  documentNumber: (d.documentNumber as string) ?? '',
  issueDate: (d.issueDate as string) ?? '',
  expiryDate: (d.expiryDate as string) ?? '',
  reminderDaysBefore: (d.reminderDaysBefore as number) ?? 30,
  storageLocation: (d.storageLocation as string) ?? '',
  notes: (d.notes as string) ?? '',
  createdAt:
    d.createdAt instanceof Timestamp
      ? d.createdAt.toDate().toISOString()
      : (d.createdAt as string) ?? new Date().toISOString(),
});

export { getStatus as getDocumentStatus };

export const addDocument = async (userId: string, data: DocumentFormData): Promise<string> => {
  const r = await addDoc(ref(userId), { ...data, userId, createdAt: serverTimestamp() });
  return r.id;
};

export const updateDocument = async (
  userId: string,
  documentId: string,
  data: Partial<DocumentFormData>
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'documents', documentId), { ...data });
};

export const deleteDocument = async (userId: string, documentId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'documents', documentId));
};

export const subscribeToDocuments = (
  userId: string,
  callback: (documents: Document[]) => void
): Unsubscribe => {
  const q = query(ref(userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => toDocument(d.id, d.data() as Record<string, unknown>)))
  );
};
