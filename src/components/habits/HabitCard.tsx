import React, { useState } from 'react';
import type { Habit } from '../../types/habits';
import { markHabitComplete, markHabitIncomplete, deleteHabit, updateHabit } from '../../services/habitsService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { ConfirmDialog } from '../ConfirmDialog';

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
}

const getLast28Days = (): string[] => {
  const days: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const getBestStreak = (completions: string[]): number => {
  if (!completions.length) return 0;
  const sorted = [...completions].sort();
  let best = 1, current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round(
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) { current++; if (current > best) best = current; }
    else { current = 1; }
  }
  return best;
};

const getStreak = (completions: string[]): number => {
  const sorted = [...completions].sort().reverse();
  if (!sorted.length) return 0;
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const dateStr = current.toISOString().split('T')[0];
    if (sorted.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    current.setDate(current.getDate() - 1);
  }
  return streak;
};

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onEdit }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const last28 = getLast28Days();
  const streak = getStreak(habit.completions);
  const bestStreak = getBestStreak(habit.completions);
  const isCompletedToday = habit.completions.includes(today);

  const last7 = last28.slice(-7);
  const weekCompletions = last7.filter((d) => habit.completions.includes(d)).length;
  const weekRate = Math.round((weekCompletions / 7) * 100);

  // Split 28 days into 4 weeks of 7
  const weeks = [last28.slice(0, 7), last28.slice(7, 14), last28.slice(14, 21), last28.slice(21, 28)];

  const handleToggleToday = async () => {
    if (!user) return;
    if (isCompletedToday) {
      await markHabitIncomplete(user.uid, habit.id, today);
    } else {
      await markHabitComplete(user.uid, habit.id, today);
      addToast(`${habit.icon} ${habit.name} — done!`, 'success');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteHabit(user.uid, habit.id);
      addToast('Habit deleted', 'success');
    } catch {
      addToast('Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (!user) return;
    await updateHabit(user.uid, habit.id, { isArchived: !habit.isArchived });
    addToast(habit.isArchived ? 'Habit restored' : 'Habit archived', 'success');
  };

  return (
    <>
      <div className={`group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 ${habit.isArchived ? 'opacity-50' : ''}`}>
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: habit.color + '20' }}>
                <span>{habit.icon}</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{habit.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{habit.category} · {habit.frequency}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onEdit(habit)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={handleArchive} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title={habit.isArchived ? 'Restore' : 'Archive'}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </button>
              <button onClick={() => setShowConfirm(true)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>

          {/* Heatmap */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {compactView ? 'Last 7 days' : 'Last 28 days'}
              </span>
              <button
                onClick={() => setCompactView((v) => !v)}
                className="text-[10px] font-medium text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {compactView ? '28d' : '7d'}
              </button>
            </div>

            {compactView ? (
              /* Compact 7-day row */
              <div>
                <div className="flex gap-1 mb-1">
                  {last7.map((date) => {
                    const dow = new Date(date + 'T00:00:00').getDay();
                    return (
                      <div key={date} className="flex-1 text-center">
                        <span className="text-[9px] text-gray-400 dark:text-gray-500">{DAY_LABELS[dow]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-1">
                  {last7.map((date) => {
                    const done = habit.completions.includes(date);
                    const isToday = date === today;
                    return (
                      <div
                        key={date}
                        className={`flex-1 aspect-square rounded-md transition-all ${
                          done ? '' : isToday ? 'bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800/50'
                        }`}
                        style={done ? { backgroundColor: habit.color + (isToday ? '' : 'cc') } : {}}
                        title={date}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Full 28-day grid */
              <div>
                <div className="flex gap-1 mb-1">
                  {weeks[0].map((date) => {
                    const dow = new Date(date + 'T00:00:00').getDay();
                    return (
                      <div key={date} className="flex-1 text-center">
                        <span className="text-[9px] text-gray-400 dark:text-gray-500">{DAY_LABELS[dow]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-1">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex gap-1">
                      {week.map((date) => {
                        const done = habit.completions.includes(date);
                        const isToday = date === today;
                        return (
                          <div
                            key={date}
                            className={`flex-1 aspect-square rounded-md transition-all ${
                              done ? '' : isToday ? 'bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800/50'
                            } ${done && isToday ? 'ring-2 ring-offset-1' : ''}`}
                            style={done ? { backgroundColor: habit.color + (isToday ? '' : 'cc'), ...(done && isToday ? { ringColor: habit.color } : {}) } : {}}
                            title={date}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="text-center">
              <p className="text-base font-bold text-gray-900 dark:text-white">{streak}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Streak</p>
            </div>
            <div className="w-px h-7 bg-gray-100 dark:bg-gray-700" />
            <div className="text-center">
              <p className="text-base font-bold text-gray-900 dark:text-white">{bestStreak}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Best</p>
            </div>
            <div className="w-px h-7 bg-gray-100 dark:bg-gray-700" />
            <div className="text-center">
              <p className="text-base font-bold text-gray-900 dark:text-white">{weekRate}%</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">This week</p>
            </div>
            <div className="w-px h-7 bg-gray-100 dark:bg-gray-700" />
            <div className="text-center">
              <p className="text-base font-bold text-gray-900 dark:text-white">{habit.completions.length}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total</p>
            </div>
          </div>

          {/* Check-in button */}
          <button
            onClick={handleToggleToday}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              isCompletedToday
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                : 'text-white hover:opacity-90 shadow-sm'
            }`}
            style={isCompletedToday ? {} : { backgroundColor: habit.color }}
          >
            {isCompletedToday ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Done today
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Mark complete
              </>
            )}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Habit"
        message={`Delete "${habit.name}"? All your streak data will be lost.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </>
  );
};
