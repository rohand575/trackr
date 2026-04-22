import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoals } from '../hooks/useGoals';
import { useGoalsStore } from '../store/useGoalsStore';
import { useProgressLogs } from '../hooks/useProgressLogs';
import { useAuthStore } from '../store/useAuthStore';
import { deleteProgressLog } from '../services/progressLogService';
import { WeightProgressChart } from '../components/goals/WeightProgressChart';
import { WeightLogForm } from '../components/goals/WeightLogForm';
import { GoalForm } from '../components/goals/GoalForm';
import { useToastStore } from '../store/useToastStore';
import type { Goal } from '../types/goals';

const CATEGORY_ICONS: Record<string, string> = {
  Finance: '💰', Health: '🏥', Career: '💼', Education: '📚',
  Travel: '✈️', Personal: '🌟', Fitness: '💪', Other: '🎯',
};

export const GoalDetailPage: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  // Ensure goals are loaded even on direct deep-link (Firestore deduplicates listeners)
  useGoals();
  const { goals, loading: goalsLoading } = useGoalsStore();

  const { logs, loading: logsLoading } = useProgressLogs(goalId);
  const [activeTab, setActiveTab] = useState<'progress'>('progress');
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  const goal = goals.find((g) => g.id === goalId);

  // Redirect if goal not found after load completes
  useEffect(() => {
    if (!goalsLoading && goals.length > 0 && !goal) {
      navigate('/goals-habits', { replace: true });
    }
  }, [goalsLoading, goals, goal, navigate]);

  const progress = goal && goal.targetValue > 0
    ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
    : 0;

  const daysLeft = goal?.deadline
    ? Math.ceil((new Date(goal.deadline + 'T00:00:00').getTime() - Date.now()) / 86400000)
    : null;

  const handleDeleteLog = async (logId: string) => {
    if (!user || !goalId) return;
    setDeletingLogId(logId);
    try {
      await deleteProgressLog(user.uid, goalId, logId);
      addToast('Entry deleted', 'success');
    } catch {
      addToast('Failed to delete', 'error');
    } finally {
      setDeletingLogId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (goalsLoading || !goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 pt-12 pb-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/goals-habits')}
              className="p-1.5 -ml-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{CATEGORY_ICONS[goal.category] ?? '🎯'}</span>
                <h1 className="font-bold text-gray-900 dark:text-white truncate">{goal.title}</h1>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{goal.category}</p>
            </div>
            <button
              onClick={() => setEditingGoal(goal)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
              aria-label="Edit goal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>

          {/* Progress summary */}
          <div className="flex items-center gap-4">
            {/* Ring */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="19" fill="none" strokeWidth="4.5" className="stroke-gray-100 dark:stroke-gray-700" />
                <circle
                  cx="24" cy="24" r="19" fill="none"
                  stroke={progress >= 100 ? '#10b981' : progress >= 60 ? '#6366f1' : '#818cf8'}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 19}`}
                  strokeDashoffset={`${2 * Math.PI * 19 * (1 - Math.min(progress, 100) / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{Math.round(progress)}%</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {goal.currentValue} → {goal.targetValue} {goal.unit}
              </p>
              {daysLeft !== null && (
                <p className={`text-xs mt-0.5 ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 14 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                </p>
              )}
              <button
                onClick={() => { setShowLogForm((v) => !v); }}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {showLogForm ? 'Cancel' : 'Log weight'}
              </button>
            </div>
          </div>

          {showLogForm && (
            <WeightLogForm goalId={goal.id} onClose={() => setShowLogForm(false)} />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex gap-1">
          <button
            onClick={() => setActiveTab('progress')}
            className="py-3 px-4 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
          >
            Progress
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Weight trend</h2>
              {logsLoading ? (
                <div className="h-[140px] flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <WeightProgressChart logs={logs} targetValue={goal.targetValue} />
              )}
            </div>

            {/* Log history */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Weigh-in history
                  {logs.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-400">{logs.length} entries</span>
                  )}
                </h2>
              </div>
              {logs.length === 0 && !logsLoading ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">No entries yet. Log your first weigh-in above.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                  {logs.map((log) => (
                    <li key={log.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{log.value} kg</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(log.date)}</span>
                        </div>
                        {log.note && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">{log.note}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={deletingLogId === log.id}
                        className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        aria-label="Delete entry"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Edit modal */}
      {editingGoal && (
        <GoalForm isOpen={true} editingGoal={editingGoal} onClose={() => setEditingGoal(null)} />
      )}
    </div>
  );
};
