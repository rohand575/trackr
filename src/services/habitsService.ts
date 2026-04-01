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
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Habit, HabitFormData } from '../types/habits';

const ref = (userId: string) => collection(db, 'users', userId, 'habits');

const toHabit = (id: string, d: Record<string, unknown>): Habit => ({
  id,
  userId: d.userId as string,
  name: d.name as string,
  description: (d.description as string) ?? '',
  category: d.category as Habit['category'],
  frequency: d.frequency as Habit['frequency'],
  targetDaysPerWeek: (d.targetDaysPerWeek as number) ?? 7,
  color: (d.color as string) ?? '#6366f1',
  icon: (d.icon as string) ?? '✅',
  completions: (d.completions as string[]) ?? [],
  isArchived: (d.isArchived as boolean) ?? false,
  createdAt:
    d.createdAt instanceof Timestamp
      ? d.createdAt.toDate().toISOString()
      : (d.createdAt as string) ?? new Date().toISOString(),
});

export const addHabit = async (userId: string, data: HabitFormData): Promise<string> => {
  const r = await addDoc(ref(userId), {
    ...data,
    completions: [],
    isArchived: false,
    userId,
    createdAt: serverTimestamp(),
  });
  return r.id;
};

export const updateHabit = async (
  userId: string,
  habitId: string,
  data: Partial<HabitFormData & { isArchived: boolean }>
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'habits', habitId), { ...data });
};

export const deleteHabit = async (userId: string, habitId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'habits', habitId));
};

export const markHabitComplete = async (
  userId: string,
  habitId: string,
  dateStr: string // YYYY-MM-DD
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'habits', habitId), {
    completions: arrayUnion(dateStr),
  });
};

export const markHabitIncomplete = async (
  userId: string,
  habitId: string,
  dateStr: string
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'habits', habitId), {
    completions: arrayRemove(dateStr),
  });
};

export const subscribeToHabits = (
  userId: string,
  callback: (habits: Habit[]) => void
): Unsubscribe => {
  const q = query(ref(userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => toHabit(d.id, d.data() as Record<string, unknown>)))
  );
};
