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
import type { Idea, IdeaFormData, ChecklistItem, IdeaKanbanStatus } from '../types/ideas';

const ref = (userId: string) => collection(db, 'users', userId, 'ideas');

const tsToIso = (val: unknown): string =>
  val instanceof Timestamp
    ? val.toDate().toISOString()
    : (val as string) ?? new Date().toISOString();

const toIdea = (id: string, d: Record<string, unknown>): Idea => ({
  id,
  userId: d.userId as string,
  title: (d.title as string) ?? '',
  body: (d.body as string) ?? '',
  color: (d.color as Idea['color']) ?? 'default',
  pinned: (d.pinned as boolean) ?? false,
  checklist: (d.checklist as ChecklistItem[]) ?? [],
  isArchived: (d.isArchived as boolean) ?? false,
  createdAt: tsToIso(d.createdAt),
  updatedAt: tsToIso(d.updatedAt),
  tags: (d.tags as string[]) ?? [],
  kanbanStatus: (d.kanbanStatus as IdeaKanbanStatus) ?? 'todo',
});

export const addIdea = async (userId: string, data: IdeaFormData): Promise<string> => {
  const r = await addDoc(ref(userId), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return r.id;
};

export const updateIdea = async (
  userId: string,
  ideaId: string,
  data: Partial<IdeaFormData>
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'ideas', ideaId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteIdea = async (userId: string, ideaId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'ideas', ideaId));
};

export const togglePin = async (
  userId: string,
  ideaId: string,
  pinned: boolean
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'ideas', ideaId), {
    pinned,
    updatedAt: serverTimestamp(),
  });
};

export const updateChecklist = async (
  userId: string,
  ideaId: string,
  checklist: ChecklistItem[]
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'ideas', ideaId), {
    checklist,
    updatedAt: serverTimestamp(),
  });
};

export const archiveIdea = async (
  userId: string,
  ideaId: string,
  isArchived: boolean
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'ideas', ideaId), {
    isArchived,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToIdeas = (
  userId: string,
  callback: (ideas: Idea[]) => void
): Unsubscribe => {
  const q = query(ref(userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const ideas = snap.docs.map((d) => toIdea(d.id, d.data() as Record<string, unknown>));
    // Sort: pinned first, then by createdAt desc (already from query)
    ideas.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return 0; // preserve Firestore order within same pin state
    });
    callback(ideas);
  });
};
