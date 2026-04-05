import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { addIdea } from '../services/ideasService';
import { IdeaColorPicker } from './ideas/IdeaColorPicker';
import type { IdeaColor } from '../types/ideas';

const HIDDEN_ROUTES = ['/login', '/register'];

export const QuickCapture: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState<IdeaColor>('default');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Don't render on auth routes or if not logged in
  if (!user || HIDDEN_ROUTES.includes(location.pathname)) return null;

  // Don't show on the Ideas page (they already have a FAB + form there)
  if (location.pathname === '/ideas') return null;

  const resetForm = () => {
    setTitle('');
    setBody('');
    setColor('default');
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Focus the input after render
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!title.trim() || !user) return;
    setSaving(true);
    try {
      await addIdea(user.uid, {
        title: title.trim(),
        body: body.trim(),
        color,
        pinned: false,
        checklist: [],
        isArchived: false,
        tags: [],
        kanbanStatus: 'todo',
      });
      addToast('Idea captured!', 'success');
      handleClose();
    } catch {
      addToast('Failed to save idea', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Floating trigger button — bottom-left */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 left-6 w-12 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xl rounded-full shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center transition-all duration-200 z-30"
          title="Quick capture idea"
        >
          💡
        </button>
      )}

      {/* Capture modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={handleClose} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-slide-up">
            <div className="p-5">
              {/* Title */}
              <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && title.trim()) handleSave(); }}
                placeholder="What's on your mind?"
                className="w-full text-base font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border-0 p-0 focus:outline-none focus:ring-0 bg-transparent"
              />

              {/* Body (optional) */}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add a note..."
                rows={2}
                className="w-full mt-3 text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-0 p-0 focus:outline-none focus:ring-0 bg-transparent resize-none"
              />

              {/* Color picker + actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <IdeaColorPicker value={color} onChange={setColor} size="sm" />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!title.trim() || saving}
                    className="px-4 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm shadow-indigo-200"
                  >
                    {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
