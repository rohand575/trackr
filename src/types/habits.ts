export type HabitFrequency = 'Daily' | 'Weekly' | 'Weekdays' | 'Weekends';
export type HabitCategory =
  | 'Health'
  | 'Fitness'
  | 'Learning'
  | 'Mindfulness'
  | 'Productivity'
  | 'Social'
  | 'Finance'
  | 'Other';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;  // e.g. 3 for "3x per week"
  color: string;              // hex color for the habit card
  icon: string;               // emoji
  completions: string[];      // array of ISO date strings "YYYY-MM-DD"
  isArchived: boolean;
  createdAt: string;
}

export type HabitFormData = Omit<Habit, 'id' | 'userId' | 'createdAt' | 'completions' | 'isArchived'>;
