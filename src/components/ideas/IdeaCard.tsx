import React, { useState } from 'react';
import type { Idea } from '../../types/ideas';
import { deleteIdea, togglePin, updateChecklist, archiveIdea, updateIdea } from '../../services/ideasService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { ConfirmDialog } from '../ConfirmDialog';
import { IdeaColorPicker, IDEA_COLOR_MAP, IDEA_BORDER_MAP } from './IdeaColorPicker';

interface IdeaCardProps {
  idea: Idea;
  onEdit: (idea: Idea) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onEdit }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteIdea(user.uid, idea.id);
      addToast('Idea deleted', 'success');
    } catch {
      addToast('Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePin = async () => {
    if (!user) return;
    try {
      await togglePin(user.uid, idea.id, !idea.pinned);
    } catch {
      addToast('Failed to update', 'error');
    }
  };

  const handleToggleCheck = async (itemId: string) => {
    if (!user) return;
    const updated = idea.checklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    try {
      await updateChecklist(user.uid, idea.id, updated);
    } catch {
      addToast('Failed to update', 'error');
    }
  };

  const handleArchive = async () => {
    if (!user) return;
    try {
      await archiveIdea(user.uid, idea.id, !idea.isArchived);
      addToast(idea.isArchived ? 'Idea restored' : 'Idea archived', 'success');
    } catch {
      addToast('Failed to update', 'error');
    }
  };

  const handleColorChange = async (color: Idea['color']) => {
    if (!user) return;
    try {
      await updateIdea(user.uid, idea.id, { color });
      setShowColorPicker(false);
    } catch {
      addToast('Failed to update color', 'error');
    }
  };

  const checkedCount = idea.checklist.filter((i) => i.checked).length;
  const bgColor = IDEA_COLOR_MAP[idea.color];
  const borderColor = IDEA_BORDER_MAP[idea.color];

  return (
    <>
      <div
        onClick={() => onEdit(idea)}
        className={`group ${bgColor} rounded-2xl border ${borderColor} shadow-sm hover:shadow-md transition-all duration-200 break-inside-avoid mb-4 cursor-pointer ${
          idea.isArchived ? 'opacity-60' : ''
        }`}
      >
        <div className="p-4">
          {/* Header: title + pin */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug break-words min-w-0">
              {idea.title}
            </h3>
            <button
              onClick={(e) => { e.stopPropagation(); handleTogglePin(); }}
              className={`p-1 rounded-lg transition-all duration-150 shrink-0 ${
                idea.pinned
                  ? 'text-indigo-600'
                  : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-500'
              }`}
              title={idea.pinned ? 'Unpin' : 'Pin'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={idea.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>

          {/* Body text */}
          {idea.body && (
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3 whitespace-pre-line line-clamp-6">
              {idea.body}
            </p>
          )}

          {/* Checklist */}
          {idea.checklist.length > 0 && (
            <div className={`space-y-1.5 ${idea.body ? '' : 'mt-2'}`}>
              {idea.checklist.map((item) => (
                <label
                  key={item.id}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-start gap-2 cursor-pointer group/check"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggleCheck(item.id)}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
                  />
                  <span
                    className={`text-xs leading-snug break-words ${
                      item.checked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {item.text}
                  </span>
                </label>
              ))}
              {idea.checklist.length > 1 && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  {checkedCount}/{idea.checklist.length} done
                </p>
              )}
            </div>
          )}

          {/* Inline color picker (toggled) */}
          {showColorPicker && (
            <div onClick={(e) => e.stopPropagation()} className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
              <IdeaColorPicker value={idea.color} onChange={handleColorChange} size="sm" />
            </div>
          )}

          {/* Tags */}
          {idea.tags?.length > 0 && (
            <div onClick={(e) => e.stopPropagation()} className="flex flex-wrap gap-1 mt-2">
              {idea.tags.map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100/70 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer actions */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60"
          >
            <div className="flex items-center gap-0.5">
              {/* Color picker toggle */}
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Change color"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </button>
              {/* Archive / Restore */}
              <button
                onClick={handleArchive}
                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title={idea.isArchived ? 'Restore' : 'Archive'}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {idea.isArchived ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  )}
                </svg>
              </button>
            </div>
            {/* Delete */}
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Idea"
        message="This idea will be permanently deleted. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </>
  );
};
