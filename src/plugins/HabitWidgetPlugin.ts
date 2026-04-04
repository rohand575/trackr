import { registerPlugin } from '@capacitor/core';

export interface WidgetHabitItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: string;
  completions: string[];
  isArchived: boolean;
}

export interface SyncHabitsOptions {
  habitsJson: string;
  userId: string;
  idToken: string;
  refreshToken: string;
  apiKey: string;
  projectId: string;
  tokenExpiry: number;
}

export interface HabitWidgetPlugin {
  syncHabits(options: SyncHabitsOptions): Promise<void>;
  triggerWidgetUpdate(): Promise<void>;
}

export const HabitWidgetPlugin = registerPlugin<HabitWidgetPlugin>('HabitWidgetPlugin');
