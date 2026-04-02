import React, { useState } from 'react';
import type { Goal, Milestone } from '../../types/goals';
import { updateGoal, deleteGoal, updateMilestones } from '../../services/goalsService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { ConfirmDialog } from '../ConfirmDialog';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Finance: '💰', Health: '🏥', Career: '💼', Education: '📚',
  Travel: '✈️', Personal: '🌟', Fitness: '💪', Other: '🎯',
};

const STATUS_STYLES: Record<Goal['status'], string> = {
  Active: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Abandoned: 'bg-gray-100 text-gray-500 border-gray-200',
};

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newMilestone, setNewMilestone] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [progressInput, setProgressInput] = useState('');
  const [editingProgress, setEditingProgress] = useState(false);

  const progress = goal.targetValue > 0 ? Math.min((goal.currentValue / goal.targetValue) * 100, 100) : 0;
  const daysLeft = Math.ceil((new Date(goal.deadline + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteGoal(user.uid, goal.id);
      addToast('Goal deleted', 'success');
    } catch {
      addToast('Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleProgressUpdate = async () => {
    if (!user) return;
    const val = parseFloat(progressInput);
    if (isNaN(val) || val < 0) return;
    await updateGoal(user.uid, goal.id, { currentValue: val });
    addToast('Progress updated', 'success');
    setEditingProgress(false);
    setProgressInput('');
  };

  const handleToggleMilestone = async (m: Milestone) => {
    if (!user) return;
    const updated = goal.milestones.map((ms) =>
      ms.id === m.id ? { ...ms, completed: !ms.completed } : ms
    );
    await updateMilestones(user.uid, goal.id, updated);
  };

  const handleAddMilestone = async () => {
    if (!user || !newMilestone.trim()) return;
    const milestone: Milestone = {
      id: Math.random().toString(36).slice(2),
      label: newMilestone.trim(),
      completed: false,
    };
    const updated = [...goal.milestones, milestone];
    await updateMilestones(user.uid, goal.id, updated);
    setNewMilestone('');
    setAddingMilestone(false);
  };

  const handleDeleteMilestone = async (m: Milestone) => {
    if (!user) return;
    const updated = goal.milestones.filter((ms) => ms.id !== m.id);
    await updateMilestones(user.uid, goal.id, updated);
  };

  const completedMilestones = goal.milestones.filter((m) => m.completed).length;

  return (
    <>
      <div className={`group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${goal.status === 'Abandoned' ? 'opacity-60' : ''}`}>
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">
                {CATEGORY_ICONS[goal.category] ?? '🎯'}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{goal.title}</h3>
                <p className="text-xs text-gray-500">{goal.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onEdit(goal)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={() => setShowConfirm(true)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center gap-3">
              {/* Circular ring */}
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="19" fill="none" stroke="#f3f4f6" strokeWidth="4.5" />
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
                  <span className="text-[11px] font-bold text-gray-700">{Math.round(progress)}%</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className={`text-xs font-medium ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 14 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                  </span>
                </div>
                {editingProgress ? (
                  <div className="flex items-center gap-1 mb-1.5">
                    <input
                      type="number" value={progressInput} onChange={(e) => setProgressInput(e.target.value)}
                      placeholder={String(goal.currentValue)}
                      className="w-20 px-2 py-0.5 text-xs border border-indigo-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      autoFocus
                    />
                    <button onClick={handleProgressUpdate} className="text-xs text-indigo-600 font-medium hover:text-indigo-800">Save</button>
                    <button onClick={() => setEditingProgress(false)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingProgress(true); setProgressInput(String(goal.currentValue)); }}
                    className="text-xs font-semibold text-gray-700 hover:text-indigo-600 transition-colors mb-1.5 block"
                  >
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </button>
                )}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progress >= 100 ? 'bg-emerald-500' : progress >= 60 ? 'bg-indigo-500' : 'bg-indigo-400'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          {(goal.milestones.length > 0 || addingMilestone) && (
            <div className="mb-3 border-t border-gray-50 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Milestones ({completedMilestones}/{goal.milestones.length})</span>
              </div>
              <div className="space-y-1.5">
                {goal.milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 group/m">
                    <button onClick={() => handleToggleMilestone(m)} className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${m.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-indigo-400'}`}>
                      {m.completed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <span className={`text-xs flex-1 ${m.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{m.label}</span>
                    <button onClick={() => handleDeleteMilestone(m)} className="opacity-0 group-hover/m:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {addingMilestone && (
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text" value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="Milestone label..."
                className="flex-1 px-2.5 py-1.5 text-xs border border-indigo-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddMilestone(); if (e.key === 'Escape') setAddingMilestone(false); }}
                autoFocus
              />
              <button onClick={handleAddMilestone} className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg">Add</button>
              <button onClick={() => setAddingMilestone(false)} className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-1.5">✕</button>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[goal.status]}`}>
              {goal.status}
            </span>
            <button
              onClick={() => setAddingMilestone(true)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Milestone
            </button>
          </div>

          {goal.description && <p className="mt-2 text-xs text-gray-400 italic">{goal.description}</p>}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Goal"
        message={`Delete "${goal.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </>
  );
};
