import { Capacitor } from '@capacitor/core';
import { auth } from './firebase';
import { HabitWidgetPlugin } from '../plugins/HabitWidgetPlugin';
import type { Habit } from '../types/habits';

const prepareHabitsPayload = (habits: Habit[]) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return habits
    .filter((h) => !h.isArchived)
    .map((h) => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      frequency: h.frequency,
      completions: h.completions.filter((d) => d >= cutoffStr),
      isArchived: false,
    }));
};

export const syncHabitsToWidget = async (habits: Habit[]): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  const user = auth.currentUser;
  if (!user) return;

  try {
    const idToken = await user.getIdToken(false);
    const refreshToken = user.refreshToken;
    const tokenExpiry = JSON.parse(atob(idToken.split('.')[1])).exp as number;

    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string;

    await HabitWidgetPlugin.syncHabits({
      habitsJson: JSON.stringify(prepareHabitsPayload(habits)),
      userId: user.uid,
      idToken,
      refreshToken,
      apiKey,
      projectId,
      tokenExpiry,
    });
  } catch (err) {
    console.warn('[widgetSync] Failed to sync habits to widget:', err);
  }
};

export const clearWidgetData = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await HabitWidgetPlugin.syncHabits({
      habitsJson: '[]',
      userId: '',
      idToken: '',
      refreshToken: '',
      apiKey: '',
      projectId: '',
      tokenExpiry: 0,
    });
  } catch {
    // ignore
  }
};
