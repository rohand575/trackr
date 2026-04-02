import React from 'react';
import { Link } from 'react-router-dom';
import type { DashboardData } from '../../hooks/useDashboardData';
import { WidgetSkeleton } from './WidgetSkeleton';

interface HabitsTodayWidgetProps {
  data: DashboardData;
}

export const HabitsTodayWidget: React.FC<HabitsTodayWidgetProps> = ({ data }) => {
  if (data.isLoading) return <WidgetSkeleton lines={4} hasHeader />;

  const today = new Date().toISOString().split('T')[0];
  const todayHabits = data.habitsScheduledToday;
  const topStreaks = data.habitStreaks.filter((h) => h.streak > 0).slice(0, 4);
  const maxStreak = topStreaks[0]?.streak ?? 1;

  const completedCount = data.habitsCompletedToday;
  const totalToday = todayHabits.length;
  const allDone = totalToday > 0 && completedCount === totalToday;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Habits</h2>
          {totalToday > 0 && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                allDone
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {completedCount}/{totalToday} today
            </span>
          )}
        </div>
        <span className="text-lg">{allDone ? '🎉' : '✨'}</span>
      </div>

      {data.activeHabits.length === 0 ? (
        <div className="py-4 text-center text-gray-400 text-sm">
          No habits yet
          <Link to="/goals-habits" className="block text-indigo-600 text-xs font-medium hover:underline mt-1">
            Start one →
          </Link>
        </div>
      ) : (
        <>
          {/* Today's habit pills */}
          {todayHabits.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {todayHabits.slice(0, 8).map((habit) => {
                const done = habit.completions.includes(today);
                return (
                  <div
                    key={habit.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-medium transition-opacity ${
                      done ? 'opacity-100' : 'opacity-50'
                    }`}
                    style={{ backgroundColor: habit.color + '20', color: habit.color }}
                  >
                    <span className="text-base leading-none">{habit.icon}</span>
                    <span className="text-xs truncate max-w-[80px]">{habit.name}</span>
                    {done && (
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Streak leaderboard */}
          {topStreaks.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">🔥 Top Streaks</p>
              <div className="space-y-2.5">
                {topStreaks.map(({ habit, streak }) => (
                  <div key={habit.id} className="flex items-center gap-3">
                    <span className="text-base leading-none w-6 text-center">{habit.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700 truncate">{habit.name}</span>
                        <span className="text-xs font-bold text-gray-500 ml-2 shrink-0">
                          {streak}d
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(streak / maxStreak) * 100}%`,
                            backgroundColor: habit.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Link to="/goals-habits" className="text-xs text-indigo-600 hover:underline font-medium self-start">
        View all habits →
      </Link>
    </div>
  );
};
