export type GoalCategory =
  | 'Finance'
  | 'Health'
  | 'Career'
  | 'Education'
  | 'Travel'
  | 'Personal'
  | 'Fitness'
  | 'Other';

export type GoalStatus = 'Active' | 'Completed' | 'Abandoned';

export interface Milestone {
  id: string;
  label: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetValue: number;       // e.g. 5000 (for savings), or 1 (for binary goals)
  currentValue: number;
  unit: string;              // e.g. "EUR", "km", "books", "%"
  deadline: string;          // ISO date YYYY-MM-DD
  status: GoalStatus;
  milestones: Milestone[];
  createdAt: string;
}

export type GoalFormData = Omit<Goal, 'id' | 'userId' | 'createdAt' | 'milestones' | 'currentValue'>;
