import React, { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Habit, HabitFormData } from '../../types/habits';
import { addHabit, updateHabit } from '../../services/habitsService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
const PRESET_ICONS = ['✅', '💪', '📚', '🧘', '🏃', '💧', '🥗', '😴', '✍️', '🎯', '🚴', '🧹'];

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  description: z.string().max(300),
  category: z.enum(['Health', 'Fitness', 'Learning', 'Mindfulness', 'Productivity', 'Social', 'Finance', 'Other']),
  frequency: z.enum(['Daily', 'Weekly', 'Weekdays', 'Weekends']),
  targetDaysPerWeek: z.number().min(1).max(7),
  color: z.string().min(1),
  icon: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingHabit?: Habit | null;
}

const inputClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors';
const selectClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors appearance-none cursor-pointer';

export const HabitForm: React.FC<HabitFormProps> = ({ isOpen, onClose, editingHabit }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: '', description: '', category: 'Health', frequency: 'Daily',
      targetDaysPerWeek: 7, color: '#6366f1', icon: '✅',
    },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  useEffect(() => {
    if (!isOpen) return;
    if (editingHabit) {
      reset({
        name: editingHabit.name, description: editingHabit.description,
        category: editingHabit.category, frequency: editingHabit.frequency,
        targetDaysPerWeek: editingHabit.targetDaysPerWeek,
        color: editingHabit.color, icon: editingHabit.icon,
      });
    } else {
      reset({ name: '', description: '', category: 'Health', frequency: 'Daily', targetDaysPerWeek: 7, color: '#6366f1', icon: '✅' });
    }
  }, [editingHabit, isOpen, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    try {
      const formData: HabitFormData = { ...data };
      if (editingHabit) {
        await updateHabit(user.uid, editingHabit.id, formData);
        addToast('Habit updated', 'success');
      } else {
        await addHabit(user.uid, formData);
        addToast('Habit created!', 'success');
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
            <h2 className="text-lg font-bold text-gray-900">{editingHabit ? 'Edit Habit' : 'New Habit'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Build consistency one day at a time</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Habit Name <span className="text-red-500">*</span></label>
            <input {...register('name')} placeholder="e.g. Morning run, Read 30 min" className={inputClass} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon} type="button" onClick={() => setValue('icon', icon)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${selectedIcon === icon ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color} type="button" onClick={() => setValue('color', color)}
                  className={`w-7 h-7 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <div className="relative">
                <select {...register('category')} className={selectClass}>
                  {['Health', 'Fitness', 'Learning', 'Mindfulness', 'Productivity', 'Social', 'Finance', 'Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Frequency</label>
              <div className="relative">
                <select {...register('frequency')} className={selectClass}>
                  <option value="Daily">Daily</option>
                  <option value="Weekdays">Weekdays only</option>
                  <option value="Weekends">Weekends only</option>
                  <option value="Weekly">Custom days/week</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target days per week</label>
            <input {...register('targetDaysPerWeek', { valueAsNumber: true })} type="number" min="1" max="7" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea {...register('description')} rows={2} placeholder="Why does this habit matter?" className={`${inputClass} resize-none`} />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-indigo-200">
              {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editingHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
