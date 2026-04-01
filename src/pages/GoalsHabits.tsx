import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalForm } from '../components/goals/GoalForm';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitForm } from '../components/habits/HabitForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useGoals } from '../hooks/useGoals';
import { useHabits } from '../hooks/useHabits';
import type { Goal } from '../types/goals';
import type { Habit } from '../types/habits';

type ActiveTab = 'goals' | 'habits';

const EmptyGoals: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-5 text-4xl">🎯</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">No goals yet</h3>
    <p className="text-sm text-gray-400 mb-6 max-w-xs">Set your first goal with a target and deadline to start tracking progress</p>
    <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
      Create Goal
    </button>
  </div>
);

const EmptyHabits: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-5 text-4xl">🔥</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">No habits yet</h3>
    <p className="text-sm text-gray-400 mb-6 max-w-xs">Start building a habit and track your daily streaks</p>
    <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-200">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
      Create Habit
    </button>
  </div>
);

export const GoalsHabits: React.FC = () => {
  const { goals, loading: goalsLoading } = useGoals();
  const { habits, loading: habitsLoading } = useHabits();

  const [activeTab, setActiveTab] = useState<ActiveTab>('habits');
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const activeGoals = goals.filter((g) => g.status === 'Active');
  const completedGoals = goals.filter((g) => g.status === 'Completed');
  const activeHabits = habits.filter((h) => !h.isArchived);
  const archivedHabits = habits.filter((h) => h.isArchived);

  const todayCompletions = activeHabits.filter((h) =>
    h.completions.includes(new Date().toISOString().split('T')[0])
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Goals & Habits</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeTab === 'habits'
                ? `${todayCompletions}/${activeHabits.length} habits done today`
                : `${activeGoals.length} active · ${completedGoals.length} completed`}
            </p>
          </div>
          <button
            onClick={() => activeTab === 'goals' ? setGoalFormOpen(true) : setHabitFormOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            {activeTab === 'goals' ? 'New Goal' : 'New Habit'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {(['habits', 'goals'] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/80'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab === 'habits' ? '🔥' : '🎯'}</span>
              <span className="capitalize">{tab}</span>
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${
                activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'
              }`}>
                {tab === 'habits' ? activeHabits.length : activeGoals.length}
              </span>
            </button>
          ))}
        </div>

        {/* --- HABITS TAB --- */}
        {activeTab === 'habits' && (
          <>
            {habitsLoading ? (
              <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
            ) : activeHabits.length === 0 && archivedHabits.length === 0 ? (
              <EmptyHabits onAdd={() => setHabitFormOpen(true)} />
            ) : (
              <>
                {activeHabits.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                    {activeHabits.map((h) => (
                      <HabitCard key={h.id} habit={h} onEdit={(h) => { setEditingHabit(h); setHabitFormOpen(true); }} />
                    ))}
                  </div>
                )}
                {archivedHabits.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Archived</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {archivedHabits.map((h) => (
                        <HabitCard key={h.id} habit={h} onEdit={(h) => { setEditingHabit(h); setHabitFormOpen(true); }} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* --- GOALS TAB --- */}
        {activeTab === 'goals' && (
          <>
            {goalsLoading ? (
              <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
            ) : goals.length === 0 ? (
              <EmptyGoals onAdd={() => setGoalFormOpen(true)} />
            ) : (
              <>
                {activeGoals.length > 0 && (
                  <div className="mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeGoals.map((g) => (
                        <GoalCard key={g.id} goal={g} onEdit={(g) => { setEditingGoal(g); setGoalFormOpen(true); }} />
                      ))}
                    </div>
                  </div>
                )}
                {completedGoals.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Completed 🎉</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedGoals.map((g) => (
                        <GoalCard key={g.id} goal={g} onEdit={(g) => { setEditingGoal(g); setGoalFormOpen(true); }} />
                      ))}
                    </div>
                  </div>
                )}
                {goals.filter((g) => g.status === 'Abandoned').length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Abandoned</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {goals.filter((g) => g.status === 'Abandoned').map((g) => (
                        <GoalCard key={g.id} goal={g} onEdit={(g) => { setEditingGoal(g); setGoalFormOpen(true); }} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => activeTab === 'goals' ? setGoalFormOpen(true) : setHabitFormOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center transition-all z-20"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
      </button>

      <GoalForm isOpen={goalFormOpen} onClose={() => { setGoalFormOpen(false); setEditingGoal(null); }} editingGoal={editingGoal} />
      <HabitForm isOpen={habitFormOpen} onClose={() => { setHabitFormOpen(false); setEditingHabit(null); }} editingHabit={editingHabit} />
    </div>
  );
};
