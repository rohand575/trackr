import React, { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Idea, IdeaFormData, IdeaColor, ChecklistItem } from '../../types/ideas';
import { addIdea, updateIdea } from '../../services/ideasService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { IdeaColorPicker } from './IdeaColorPicker';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().max(2000),
});

type FormValues = z.infer<typeof schema>;

interface IdeaFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingIdea?: Idea | null;
}

const inputClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors';

export const IdeaForm: React.FC<IdeaFormProps> = ({ isOpen, onClose, editingIdea }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [color, setColor] = useState<IdeaColor>('default');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { title: '', body: '' },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingIdea) {
      reset({ title: editingIdea.title, body: editingIdea.body });
      setColor(editingIdea.color);
      setChecklist(editingIdea.checklist);
    } else {
      reset({ title: '', body: '' });
      setColor('default');
      setChecklist([]);
    }
    setNewItemText('');
  }, [editingIdea, isOpen, reset]);

  const addChecklistItem = () => {
    const text = newItemText.trim();
    if (!text) return;
    setChecklist((prev) => [...prev, { id: crypto.randomUUID(), text, checked: false }]);
    setNewItemText('');
  };

  const removeChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    try {
      const formData: IdeaFormData = {
        ...data,
        color,
        pinned: editingIdea?.pinned ?? false,
        checklist,
        isArchived: editingIdea?.isArchived ?? false,
      };
      if (editingIdea) {
        await updateIdea(user.uid, editingIdea.id, formData);
        addToast('Idea updated', 'success');
      } else {
        await addIdea(user.uid, formData);
        addToast('Idea saved!', 'success');
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{editingIdea ? 'Edit Idea' : 'New Idea'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Capture your thought before it fades</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input {...register('title')} placeholder="What's the idea?" className={inputClass} autoFocus />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea {...register('body')} rows={3} placeholder="Add more details..." className={`${inputClass} resize-none`} />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Color</label>
            <IdeaColorPicker value={color} onChange={setColor} />
          </div>

          {/* Checklist builder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Checklist</label>
            {checklist.length > 0 && (
              <div className="space-y-2 mb-3">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group/item">
                    <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm text-gray-700 flex-1 truncate">{item.text}</span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(item.id)}
                      className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors opacity-0 group-hover/item:opacity-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); } }}
                placeholder="Add an item..."
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={addChecklistItem}
                disabled={!newItemText.trim()}
                className="px-3 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-indigo-200">
              {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editingIdea ? 'Save Changes' : 'Save Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
