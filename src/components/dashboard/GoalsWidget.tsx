import React from 'react';
import { Link } from 'react-router-dom';
import type { DashboardData } from '../../hooks/useDashboardData';
import type { Goal } from '../../types/goals';
import { WidgetSkeleton } from './WidgetSkeleton';

interface GoalsWidgetProps {
  data: DashboardData;
}

const CATEGORY_ICONS: Record<string, string> = {
  Finance: '💰', Health: '🏥', Career: '💼', Education: '📚',
  Travel: '✈️', Personal: '🌟', Fitness: '💪', Other: '🎯',
};

const getProgressColor = (progress: number, onTrack: boolean): string => {
  if (progress >= 100) return '#10b981';
  if (onTrack) return '#6366f1';
  return '#f59e0b';
};

const isGoalOnTrack = (goal: Goal): boolean => {
  const now = Date.now();
  const created = new Date(goal.createdAt).getTime();
  const deadline = new Date(goal.deadline + 'T00:00:00').getTime();
  if (now >= deadline) return false;
  const duration = deadline - created;
  if (duration <= 0) return false;
  const timeRatio = (now - created) / duration;
  const progressRatio = goal.targetValue > 0 ? goal.currentValue / goal.targetValue : 0;
  return progressRatio >= timeRatio - 0.15;
};

const getDaysLeft = (deadline: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(deadline + 'T00:00:00');
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const CIRCUMFERENCE = 2 * Math.PI * 19;

interface MiniRingProps {
  goal: Goal;
}

const MiniRing: React.FC<MiniRingProps> = ({ goal }) => {
  const progress = goal.targetValue > 0
    ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
    : 0;
  const onTrack = isGoalOnTrack(goal);
  const daysLeft = getDaysLeft(goal.deadline);
  const color = getProgressColor(progress, onTrack);
  const offset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <div className="relative group" title={goal.title}>
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="19" fill="none" stroke="#f3f4f6" strokeWidth="4.5" />
          <circle
            cx="24" cy="24" r="19" fill="none"
            stroke={color}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold text-gray-700">{Math.round(progress)}%</span>
        </div>
        {/* Deadline urgency badge */}
        {daysLeft >= 0 && daysLeft <= 14 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white leading-none">!</span>
          </div>
        )}
      </div>
      <p className="text-[10px] text-gray-500 text-center mt-1 w-14 truncate">
        {CATEGORY_ICONS[goal.category] ?? '🎯'} {goal.title}
      </p>
    </div>
  );
};

export const GoalsWidget: React.FC<GoalsWidgetProps> = ({ data }) => {
  if (data.isLoading) return <WidgetSkeleton lines={3} hasHeader />;

  const visibleGoals = data.activeGoals.slice(0, 4);
  const overflow = data.activeGoals.length - 4;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Goals</h2>
        <span className="text-lg">🎯</span>
      </div>

      {data.activeGoals.length === 0 ? (
        <div className="py-4 text-center text-gray-400 text-sm">
          No active goals
          <Link to="/goals-habits" className="block text-indigo-600 text-xs font-medium hover:underline mt-1">
            Create one →
          </Link>
        </div>
      ) : (
        <>
          {/* Ring cluster */}
          <div className="flex gap-3 flex-wrap">
            {visibleGoals.map((goal) => (
              <MiniRing key={goal.id} goal={goal} />
            ))}
            {overflow > 0 && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-500">+{overflow}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">more</p>
              </div>
            )}
          </div>

          {/* On-track summary */}
          <div className="flex gap-2 pt-2 border-t border-gray-50">
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {data.goalsOnTrack} on track
            </span>
            {data.goalsOffTrack > 0 && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
                </svg>
                {data.goalsOffTrack} off track
              </span>
            )}
          </div>
        </>
      )}

      <Link to="/goals-habits" className="text-xs text-indigo-600 hover:underline font-medium self-start">
        View all goals →
      </Link>
    </div>
  );
};
