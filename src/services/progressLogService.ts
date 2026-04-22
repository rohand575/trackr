import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ProgressLog, ProgressLogInput } from '../types/progressLog';
import { updateGoal } from './goalsService';

const ref = (userId: string, goalId: string) =>
  collection(db, 'users', userId, 'goals', goalId, 'progressLogs');

const toLog = (id: string, d: Record<string, unknown>): ProgressLog => ({
  id,
  date: d.date as string,
  value: d.value as number,
  note: (d.note as string) ?? undefined,
  createdAt: (d.createdAt as string) ?? new Date().toISOString(),
});

export const addProgressLog = async (
  userId: string,
  goalId: string,
  input: ProgressLogInput
): Promise<void> => {
  await addDoc(ref(userId, goalId), {
    ...input,
    createdAt: new Date().toISOString(),
  });
  // Keep goal.currentValue in sync so dashboard + progress ring stay accurate
  await updateGoal(userId, goalId, { currentValue: input.value });
};

export const deleteProgressLog = async (
  userId: string,
  goalId: string,
  logId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'goals', goalId, 'progressLogs', logId));
};

export const subscribeToProgressLogs = (
  userId: string,
  goalId: string,
  callback: (logs: ProgressLog[]) => void
): Unsubscribe => {
  const q = query(ref(userId, goalId), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => toLog(d.id, d.data() as Record<string, unknown>)))
  );
};
