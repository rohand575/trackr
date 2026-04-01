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
import type { Goal, GoalFormData, Milestone } from '../types/goals';

const ref = (userId: string) => collection(db, 'users', userId, 'goals');

const toGoal = (id: string, d: Record<string, unknown>): Goal => ({
  id,
  userId: d.userId as string,
  title: d.title as string,
  description: (d.description as string) ?? '',
  category: d.category as Goal['category'],
  targetValue: d.targetValue as number,
  currentValue: (d.currentValue as number) ?? 0,
  unit: (d.unit as string) ?? '',
  deadline: d.deadline as string,
  status: (d.status as Goal['status']) ?? 'Active',
  milestones: (d.milestones as Milestone[]) ?? [],
  createdAt:
    d.createdAt instanceof Timestamp
      ? d.createdAt.toDate().toISOString()
      : (d.createdAt as string) ?? new Date().toISOString(),
});

export const addGoal = async (userId: string, data: GoalFormData): Promise<string> => {
  const r = await addDoc(ref(userId), {
    ...data,
    currentValue: 0,
    milestones: [],
    userId,
    createdAt: serverTimestamp(),
  });
  return r.id;
};

export const updateGoal = async (
  userId: string,
  goalId: string,
  data: Partial<GoalFormData & { currentValue: number; status: Goal['status'] }>
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'goals', goalId), { ...data });
};

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'goals', goalId));
};

export const addMilestone = async (
  userId: string,
  goalId: string,
  milestone: Milestone
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'goals', goalId), {
    milestones: arrayUnion(milestone),
  });
};

export const updateMilestones = async (
  userId: string,
  goalId: string,
  milestones: Milestone[]
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'goals', goalId), { milestones });
};

export const removeMilestone = async (
  userId: string,
  goalId: string,
  milestone: Milestone
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'goals', goalId), {
    milestones: arrayRemove(milestone),
  });
};

export const subscribeToGoals = (
  userId: string,
  callback: (goals: Goal[]) => void
): Unsubscribe => {
  const q = query(ref(userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => toGoal(d.id, d.data() as Record<string, unknown>)))
  );
};
