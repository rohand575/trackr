import React, { useEffect, useState, useRef } from 'react';
import type { Idea, IdeaFormData, IdeaColor, ChecklistItem } from '../../types/ideas';
import { addIdea, updateIdea } from '../../services/ideasService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { IdeaColorPicker, IDEA_COLOR_MAP, IDEA_BORDER_MAP } from './IdeaColorPicker';

interface IdeaFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingIdea?: Idea | null;
}

export const IdeaForm: React.FC<IdeaFormProps> = ({ isOpen, onClose, editingIdea }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState<IdeaColor>('default');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editingIdea) {
      setTitle(editingIdea.title);
      setBody(editingIdea.body);
      setColor(editingIdea.color);
      setChecklist(editingIdea.checklist);
    } else {
      setTitle('');
      setBody('');
      setColor('default');
      setChecklist([]);
    }
    setNewItemText('');
    setShowColorPicker(false);
    setTimeout(() => titleRef.current?.focus(), 50);
  }, [editingIdea, isOpen]);

  const handleSave = async () => {
    if (!user || saving) return;
    if (!title.trim() && !editingIdea) {
      onClose();
      return;
    }
    if (!title.trim()) {
      addToast('Title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const formData: IdeaFormData = {
        title: title.trim(),
        body: body.trim(),
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
    } finally {
      setSaving(false);
    }
  };

  const addChecklistItem = () => {
    const text = newItemText.trim();
    if (!text) return;
    setChecklist((prev) => [...prev, { id: crypto.randomUUID(), text, checked: false }]);
    setNewItemText('');
  };

  const removeChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  if (!isOpen) return null;

  const bgColor = IDEA_COLOR_MAP[color];
  const borderColor = IDEA_BORDER_MAP[color];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-[5vw]">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={handleSave} />
      <div
        className={`relative w-[90vw] h-[80vh] max-w-4xl ${bgColor} border ${borderColor} rounded-2xl shadow-2xl animate-scale-in flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors z-10"
          title="Close"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 pt-5 flex flex-col min-h-0">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') handleSave(); }}
            placeholder="Title"
            className="w-full bg-transparent text-base font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none pr-8"
          />

          {/* Body — grows to fill space */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Take a note..."
            className="w-full flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none mt-3 leading-relaxed"
          />

          {/* Checklist items */}
          {checklist.length > 0 && (
            <div className="space-y-2 mt-3 border-t border-gray-200/60 dark:border-gray-700/60 pt-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-start gap-2 group/item">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer shrink-0"
                  />
                  <span
                    className={`text-sm flex-1 break-words leading-snug ${item.checked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(item.id)}
                    className="p-0.5 text-gray-300 hover:text-red-500 rounded transition-colors opacity-0 group-hover/item:opacity-100 shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add checklist item */}
          <div className="flex items-center gap-2 mt-3">
            <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); } }}
              placeholder="List item"
              className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
            />
            {newItemText.trim() && (
              <button
                type="button"
                onClick={addChecklistItem}
                className="text-sm text-indigo-600 font-medium px-1 hover:text-indigo-800 transition-colors"
              >
                Add
              </button>
            )}
          </div>
        </div>

        {/* Color picker panel — sits above footer */}
        {showColorPicker && (
          <div className="px-6 pb-2 border-t border-gray-200/60 dark:border-gray-700/60 pt-3">
            <IdeaColorPicker
              value={color}
              onChange={(c) => { setColor(c); setShowColorPicker(false); }}
              size="sm"
            />
          </div>
        )}

        {/* Footer toolbar — pinned to bottom */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200/60 dark:border-gray-700/60 shrink-0">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-2 rounded-lg transition-colors ${showColorPicker ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50' : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'}`}
            title="Change color"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
