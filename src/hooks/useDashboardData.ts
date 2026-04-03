import { useMemo } from 'react';
import { usePayments } from './usePayments';
import { useGoals } from './useGoals';
import { useHabits } from './useHabits';
import { useDocuments } from './useDocuments';
import { getMonthlyAmount } from '../utils/formatters';
import type { Category, Currency } from '../types/subscription';
import type { Habit } from '../types/habits';
import type { Goal } from '../types/goals';
import type { Document as AppDocument } from '../types/documents';

export interface UpcomingPayment {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  daysUntil: number;
  date: string;
  source: 'subscription' | 'bill';
  category: Category;
}

export interface CategorySpend {
  category: Category;
  amount: number;
  percentage: number;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  link: string;
  icon: string;
}

export interface HabitWithStreak {
  habit: Habit;
  streak: number;
}

export interface DashboardData {
  isLoading: boolean;
  monthlyBurnEUR: number;
  monthlyBurnINR: number;
  yearlyBurnEUR: number;
  yearlyBurnINR: number;
  subMonthlyEUR: number;
  subMonthlyINR: number;
  billMonthlyEUR: number;
  billMonthlyINR: number;
  upcomingPayments: UpcomingPayment[];
  categoryBreakdownEUR: CategorySpend[];
  categoryBreakdownINR: CategorySpend[];
  activeGoals: Goal[];
  goalsOnTrack: number;
  goalsOffTrack: number;
  goalsNearDeadline: Goal[];
  activeHabits: Habit[];
  habitsScheduledToday: Habit[];
  habitsCompletedToday: number;
  habitStreaks: HabitWithStreak[];
  expiredDocs: AppDocument[];
  expiringSoonDocs: AppDocument[];
  totalValidDocs: number;
  alerts: Alert[];
}

// ---- Pure helpers ----

const getDaysUntil = (dateStr: string): number => {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getStreak = (completions: string[]): number => {
  const sorted = [...completions].sort().reverse();
  if (!sorted.length) return 0;
  let streak = 0;
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const dateStr = cur.toISOString().split('T')[0];
    if (sorted.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
};

const isHabitDueToday = (habit: Habit): boolean => {
  const day = new Date().getDay();
  switch (habit.frequency) {
    case 'Daily': return true;
    case 'Weekdays': return day >= 1 && day <= 5;
    case 'Weekends': return day === 0 || day === 6;
    case 'Weekly': return true;
    default: return true;
  }
};

export const useDashboardData = (): DashboardData => {
  const { payments, loading: paymentsLoading } = usePayments();
  const { goals, loading: goalsLoading } = useGoals();
  const { habits, loading: habitsLoading } = useHabits();
  const { documents, loading: docsLoading } = useDocuments();

  const isLoading = paymentsLoading || goalsLoading || habitsLoading || docsLoading;

  const computed = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = Date.now();

    // ---- Financial ----
    const activePayments = payments.filter((p) => p.status === 'Active');
    const activeSubs = activePayments.filter((p) => p.type === 'subscription');
    const activeBills = activePayments.filter((p) => p.type === 'bill');

    const subMonthlyEUR = activeSubs
      .filter((s) => s.currency === 'EUR')
      .reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.billingCycle), 0);
    const subMonthlyINR = activeSubs
      .filter((s) => s.currency === 'INR')
      .reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.billingCycle), 0);
    const billMonthlyEUR = activeBills
      .filter((b) => b.currency === 'EUR')
      .reduce((sum, b) => sum + getMonthlyAmount(b.amount, b.billingCycle), 0);
    const billMonthlyINR = activeBills
      .filter((b) => b.currency === 'INR')
      .reduce((sum, b) => sum + getMonthlyAmount(b.amount, b.billingCycle), 0);

    const monthlyBurnEUR = subMonthlyEUR + billMonthlyEUR;
    const monthlyBurnINR = subMonthlyINR + billMonthlyINR;

    // ---- Upcoming payments (next 7 days) ----
    const upcomingPayments: UpcomingPayment[] = activePayments
      .map((p) => ({
        id: p.id,
        name: p.name,
        amount: p.amount,
        currency: p.currency as Currency,
        daysUntil: getDaysUntil(p.nextPaymentDate),
        date: p.nextPaymentDate,
        source: p.type as 'subscription' | 'bill',
        category: p.category,
      }))
      .filter((p) => p.daysUntil >= 0 && p.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    // ---- Category breakdown ----
    const buildCategoryBreakdown = (currency: 'EUR' | 'INR'): CategorySpend[] => {
      const map = new Map<Category, number>();
      activePayments
        .filter((p) => p.currency === currency)
        .forEach((item) => {
          const monthly = getMonthlyAmount(item.amount, item.billingCycle);
          map.set(item.category, (map.get(item.category) ?? 0) + monthly);
        });
      const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
      return Array.from(map.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);
    };
    const categoryBreakdownEUR = buildCategoryBreakdown('EUR');
    const categoryBreakdownINR = buildCategoryBreakdown('INR');

    // ---- Goals ----
    const activeGoals = goals.filter((g) => g.status === 'Active');
    const isGoalOnTrack = (goal: Goal): boolean => {
      const created = new Date(goal.createdAt).getTime();
      const deadline = new Date(goal.deadline + 'T00:00:00').getTime();
      if (now >= deadline) return false;
      const duration = deadline - created;
      if (duration <= 0) return false;
      const timeRatio = (now - created) / duration;
      const progressRatio = goal.targetValue > 0 ? goal.currentValue / goal.targetValue : 0;
      return progressRatio >= timeRatio - 0.15;
    };
    const goalsOnTrack = activeGoals.filter(isGoalOnTrack).length;
    const goalsOffTrack = activeGoals.length - goalsOnTrack;
    const goalsNearDeadline = activeGoals.filter((g) => {
      const d = getDaysUntil(g.deadline);
      return d >= 0 && d <= 14;
    });

    // ---- Habits ----
    const activeHabits = habits.filter((h) => !h.isArchived);
    const habitsScheduledToday = activeHabits.filter(isHabitDueToday);
    const habitsCompletedToday = habitsScheduledToday.filter((h) =>
      h.completions.includes(today)
    ).length;
    const habitStreaks: HabitWithStreak[] = activeHabits
      .map((habit) => ({ habit, streak: getStreak(habit.completions) }))
      .sort((a, b) => b.streak - a.streak);

    // ---- Documents ----
    const expiredDocs = documents.filter((d) => {
      if (!d.expiryDate) return false;
      return getDaysUntil(d.expiryDate) < 0;
    });
    const expiringSoonDocs = documents.filter((d) => {
      if (!d.expiryDate) return false;
      const daysUntil = getDaysUntil(d.expiryDate);
      const threshold = d.reminderDaysBefore > 0 ? d.reminderDaysBefore : 30;
      return daysUntil >= 0 && daysUntil <= threshold;
    });
    const totalValidDocs = documents.filter((d) => {
      if (!d.expiryDate) return true;
      const daysUntil = getDaysUntil(d.expiryDate);
      const threshold = d.reminderDaysBefore > 0 ? d.reminderDaysBefore : 30;
      return daysUntil > threshold;
    }).length;

    // ---- Alerts ----
    const alerts: Alert[] = [];

    expiredDocs.slice(0, 3).forEach((d) => {
      alerts.push({
        id: `doc-expired-${d.id}`,
        severity: 'critical',
        message: `${d.name} has expired`,
        link: '/documents',
        icon: '📄',
      });
    });

    activeGoals
      .filter((g) => getDaysUntil(g.deadline) < 0)
      .forEach((g) => {
        alerts.push({
          id: `goal-overdue-${g.id}`,
          severity: 'critical',
          message: `Goal "${g.title}" is past deadline`,
          link: '/goals-habits',
          icon: '🎯',
        });
      });

    upcomingPayments
      .filter((p) => p.daysUntil === 0)
      .forEach((p) => {
        alerts.push({
          id: `pay-today-${p.id}`,
          severity: 'critical',
          message: `${p.name} is due today`,
          link: '/payments',
          icon: p.source === 'subscription' ? '💳' : '🧾',
        });
      });

    upcomingPayments
      .filter((p) => p.daysUntil >= 1 && p.daysUntil <= 3)
      .forEach((p) => {
        alerts.push({
          id: `pay-soon-${p.id}`,
          severity: 'warning',
          message: `${p.name} due in ${p.daysUntil} day${p.daysUntil === 1 ? '' : 's'}`,
          link: '/payments',
          icon: p.source === 'subscription' ? '💳' : '🧾',
        });
      });

    expiringSoonDocs.slice(0, 3).forEach((d) => {
      const daysUntil = getDaysUntil(d.expiryDate);
      alerts.push({
        id: `doc-soon-${d.id}`,
        severity: 'warning',
        message: `${d.name} expires in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
        link: '/documents',
        icon: '📄',
      });
    });

    activeGoals
      .filter((g) => {
        const d = getDaysUntil(g.deadline);
        if (d < 0) return false;
        const created = new Date(g.createdAt).getTime();
        const deadline = new Date(g.deadline + 'T00:00:00').getTime();
        const duration = deadline - created;
        if (duration <= 0) return false;
        const timeRatio = (now - created) / duration;
        const progressRatio = g.targetValue > 0 ? g.currentValue / g.targetValue : 0;
        return timeRatio > 0.5 && progressRatio < 0.2;
      })
      .forEach((g) => {
        alerts.push({
          id: `goal-behind-${g.id}`,
          severity: 'warning',
          message: `"${g.title}" is falling behind`,
          link: '/goals-habits',
          icon: '🎯',
        });
      });

    const habitsNotDoneToday = habitsScheduledToday.filter(
      (h) => !h.completions.includes(today)
    );
    if (habitsNotDoneToday.length > 0) {
      alerts.push({
        id: 'habits-pending',
        severity: 'info',
        message: `${habitsNotDoneToday.length} habit${habitsNotDoneToday.length === 1 ? '' : 's'} pending today`,
        link: '/goals-habits',
        icon: '✨',
      });
    }

    const severityOrder: Record<Alert['severity'], number> = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return {
      monthlyBurnEUR,
      monthlyBurnINR,
      yearlyBurnEUR: monthlyBurnEUR * 12,
      yearlyBurnINR: monthlyBurnINR * 12,
      subMonthlyEUR,
      subMonthlyINR,
      billMonthlyEUR,
      billMonthlyINR,
      upcomingPayments,
      categoryBreakdownEUR,
      categoryBreakdownINR,
      activeGoals,
      goalsOnTrack,
      goalsOffTrack,
      goalsNearDeadline,
      activeHabits,
      habitsScheduledToday,
      habitsCompletedToday,
      habitStreaks,
      expiredDocs,
      expiringSoonDocs,
      totalValidDocs,
      alerts,
    };
  }, [payments, goals, habits, documents]);

  return { isLoading, ...computed };
};
