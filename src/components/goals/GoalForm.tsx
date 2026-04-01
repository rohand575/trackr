import React, { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Goal, GoalFormData } from '../../types/goals';
import { addGoal, updateGoal } from '../../services/goalsService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500),
  category: z.enum(['Finance', 'Health', 'Career', 'Education', 'Travel', 'Personal', 'Fitness', 'Other']),
  targetValue: z.number().min(0.01, 'Target must be greater than 0'),
  unit: z.string().min(1, 'Unit is required').max(30),
  deadline: z.string().min(1, 'Deadline is required'),
  status: z.enum(['Active', 'Completed', 'Abandoned']),
});

type FormValues = z.infer<typeof schema>;

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: Goal | null;
}

const inputClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors';
const selectClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors appearance-none cursor-pointer';

const CATEGORY_ICONS: Record<string, string> = {
  Finance: '💰', Health: '🏥', Career: '💼', Education: '📚',
  Travel: '✈️', Personal: '🌟', Fitness: '💪', Other: '🎯',
};

export const GoalForm: React.FC<GoalFormProps> = ({ isOpen, onClose, editingGoal }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      title: '', description: '', category: 'Personal',
      targetValue: 0, unit: '', deadline: '', status: 'Active',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingGoal) {
      reset({
        title: editingGoal.title,
        description: editingGoal.description,
        category: editingGoal.category,
        targetValue: editingGoal.targetValue,
        unit: editingGoal.unit,
        deadline: editingGoal.deadline,
        status: editingGoal.status,
      });
    } else {
      reset({ title: '', description: '', category: 'Personal', targetValue: 0, unit: '', deadline: '', status: 'Active' });
    }
  }, [editingGoal, isOpen, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    try {
      const formData: GoalFormData = { ...data };
      if (editingGoal) {
        await updateGoal(user.uid, editingGoal.id, formData);
        addToast('Goal updated', 'success');
      } else {
        await addGoal(user.uid, formData);
        addToast('Goal created!', 'success');
      }
      onClose();
    } catch {
      addToast('Something went wrong', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center px-4 py-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-scale-in mt-4 mb-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Set a measurable target with a deadline</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input {...register('title')} placeholder="e.g. Save €5000 for travel" className={inputClass} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
              <div className="relative">
                <select {...register('category')} className={selectClass}>
                  {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => (
                    <option key={cat} value={cat}>{icon} {cat}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <div className="relative">
                <select {...register('status')} className={selectClass}>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Abandoned">Abandoned</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target <span className="text-red-500">*</span></label>
              <input {...register('targetValue', { valueAsNumber: true })} type="number" step="any" min="0" placeholder="e.g. 5000" className={inputClass} />
              {errors.targetValue && <p className="mt-1 text-xs text-red-600">{errors.targetValue.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit <span className="text-red-500">*</span></label>
              <input {...register('unit')} placeholder="e.g. EUR, km, books" className={inputClass} />
              {errors.unit && <p className="mt-1 text-xs text-red-600">{errors.unit.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline <span className="text-red-500">*</span></label>
            <input {...register('deadline')} type="date" className={inputClass} />
            {errors.deadline && <p className="mt-1 text-xs text-red-600">{errors.deadline.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea {...register('description')} rows={2} placeholder="What does achieving this goal mean to you?" className={`${inputClass} resize-none`} />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-indigo-200">
              {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
