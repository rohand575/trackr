export interface ProgressLog {
  id: string;
  date: string;      // YYYY-MM-DD (logical weigh-in date)
  value: number;     // weight in kg
  note?: string;
  createdAt: string; // ISO timestamp
}

export type ProgressLogInput = Omit<ProgressLog, 'id' | 'createdAt'>;
