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
  section?: 'ideas' | 'documents';
  documentFolderId?: string | null;
}

export const IdeaForm: React.FC<IdeaFormProps> = ({ isOpen, onClose, editingIdea, section = 'ideas', documentFolderId = null }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState<IdeaColor>('default');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Inline editing state for checklist items
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const editingItemRef = useRef<HTMLTextAreaElement>(null);
  const newItemRef = useRef<HTMLTextAreaElement>(null);

  // Drag-and-drop refs
  const dragFromIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  // Prevents blur from firing a second save when Enter inserts a new item
  const enterPressedRef = useRef(false);

  const handleBodyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart, value } = el;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const currentLine = value.slice(lineStart, selectionStart);

    const numberedMatch = currentLine.match(/^(\d+)\.\s/);
    const bulletMatch = currentLine.match(/^(-)\s/);

    if (numberedMatch || bulletMatch) {
      const hasContent = currentLine.slice(numberedMatch ? numberedMatch[0].length : 2).length > 0;
      if (!hasContent) {
        e.preventDefault();
        const newValue = value.slice(0, lineStart) + value.slice(selectionStart);
        setBody(newValue);
        setTimeout(() => { el.selectionStart = el.selectionEnd = lineStart; }, 0);
        return;
      }
      e.preventDefault();
      let prefix: string;
      if (numberedMatch) {
        prefix = `${parseInt(numberedMatch[1], 10) + 1}. `;
      } else {
        prefix = '- ';
      }
      const newValue = value.slice(0, selectionStart) + '\n' + prefix + value.slice(selectionStart);
      setBody(newValue);
      const newPos = selectionStart + 1 + prefix.length;
      setTimeout(() => { el.selectionStart = el.selectionEnd = newPos; }, 0);
    }
  };

  const resizeBody = () => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 96)}px`;
  };

  useEffect(() => {
    resizeBody();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (editingIdea) {
      setTitle(editingIdea.title);
      setBody(editingIdea.body);
      setColor(editingIdea.color);
      setChecklist(editingIdea.checklist);
      setTags(editingIdea.tags ?? []);
    } else {
      setTitle('');
      setBody('');
      setColor('default');
      setChecklist([]);
      setTags([]);
    }
    setTagInput('');
    setNewItemText('');
    setEditingItemId(null);
    setEditingItemText('');
    setShowColorPicker(false);
    setTimeout(() => titleRef.current?.focus(), 50);
  }, [editingIdea, isOpen]);

  // Auto-focus + resize the inline edit textarea whenever the active item changes
  useEffect(() => {
    if (!editingItemId || !editingItemRef.current) return;
    const el = editingItemRef.current;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    el.focus();
    el.selectionStart = el.selectionEnd = el.value.length;
  }, [editingItemId]);

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
        tags,
        kanbanStatus: editingIdea?.kanbanStatus ?? 'todo',
        section: editingIdea?.section ?? section,
        documentFolderId: editingIdea?.documentFolderId ?? documentFolderId,
      };
      if (editingIdea) {
        await updateIdea(user.uid, editingIdea.id, formData);
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

  // Global Escape key handler — save and close the form
  const handleSaveRef = useRef(handleSave);
  useEffect(() => { handleSaveRef.current = handleSave; });
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSaveRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const addChecklistItem = () => {
    const text = newItemText.trim();
    if (!text) return;
    setChecklist((prev) => [...prev, { id: crypto.randomUUID(), text, checked: false }]);
    setNewItemText('');
    if (newItemRef.current) {
      newItemRef.current.style.height = 'auto';
    }
  };

  const removeChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  // Save the edited text for an item without closing edit mode
  const saveEditItemText = (id: string) => {
    const text = editingItemText.trim();
    setChecklist((prev) =>
      text
        ? prev.map((item) => item.id === id ? { ...item, text } : item)
        : prev.filter((item) => item.id !== id)
    );
  };

  // Insert a new empty item after `afterId`, saving the current edit text first
  const insertItemAfter = (afterId: string, currentText: string) => {
    const newId = crypto.randomUUID();
    setChecklist((prev) => {
      const updated = prev.map((item) =>
        item.id === afterId ? { ...item, text: currentText.trim() || item.text } : item
      );
      const idx = updated.findIndex((i) => i.id === afterId);
      const next = [...updated];
      next.splice(idx + 1, 0, { id: newId, text: '', checked: false });
      return next;
    });
    setEditingItemId(newId);
    setEditingItemText('');
  };

  const handleDragSort = () => {
    const from = dragFromIndex.current;
    const to = dragOverIndex.current;
    if (from !== null && to !== null && from !== to) {
      setChecklist((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        return updated;
      });
    }
    dragFromIndex.current = null;
    dragOverIndex.current = null;
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tag || tags.includes(tag)) { setTagInput(''); return; }
    setTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

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
        <div className="flex-1 overflow-y-auto p-6 pt-5">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') handleSave(); }}
            placeholder="Title"
            className="w-full bg-transparent text-base font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none pr-8"
          />

          {/* Body — auto-resizes with content */}
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => { setBody(e.target.value); resizeBody(); }}
            onKeyDown={handleBodyKeyDown}
            placeholder="Take a note..."
            className="w-full bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none mt-3 leading-relaxed block"
            style={{ minHeight: '96px' }}
          />

          {/* Checklist items */}
          {checklist.length > 0 && (
            <div className="space-y-0.5 mt-3 border-t border-gray-200/60 dark:border-gray-700/60 pt-3">
              {checklist.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-start gap-1.5 group/item rounded-lg px-1 -mx-1 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  draggable
                  onDragStart={() => { dragFromIndex.current = index; }}
                  onDragEnter={() => { dragOverIndex.current = index; }}
                  onDragEnd={handleDragSort}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {/* Drag handle */}
                  <div className="mt-1 shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="7" cy="4" r="1.4" />
                      <circle cx="7" cy="10" r="1.4" />
                      <circle cx="7" cy="16" r="1.4" />
                      <circle cx="13" cy="4" r="1.4" />
                      <circle cx="13" cy="10" r="1.4" />
                      <circle cx="13" cy="16" r="1.4" />
                    </svg>
                  </div>

                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer shrink-0"
                  />

                  {editingItemId === item.id ? (
                    <textarea
                      ref={editingItemRef}
                      value={editingItemText}
                      onChange={(e) => {
                        setEditingItemText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onBlur={() => {
                        if (enterPressedRef.current) {
                          enterPressedRef.current = false;
                          return;
                        }
                        saveEditItemText(item.id);
                        setEditingItemId(null);
                        setEditingItemText('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          enterPressedRef.current = true;
                          insertItemAfter(item.id, editingItemText);
                        }
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          setEditingItemId(null);
                          setEditingItemText('');
                        }
                      }}
                      rows={1}
                      className={`flex-1 bg-transparent text-sm leading-snug focus:outline-none resize-none overflow-hidden ${item.checked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}
                      style={{ minHeight: '1.25rem' }}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => {
                        setEditingItemId(item.id);
                        setEditingItemText(item.text);
                      }}
                      title="Double-click to edit"
                      className={`flex-1 text-sm break-words leading-snug py-0.5 cursor-text select-text ${item.checked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {item.text}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeChecklistItem(item.id)}
                    className="p-0.5 mt-0.5 text-gray-300 hover:text-red-500 rounded transition-colors opacity-0 group-hover/item:opacity-100 shrink-0"
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
          <div className="flex items-start gap-2 mt-3">
            <svg className="w-4 h-4 mt-0.5 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <textarea
              ref={newItemRef}
              value={newItemText}
              onChange={(e) => {
                setNewItemText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addChecklistItem();
                }
              }}
              placeholder="List item"
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none overflow-hidden leading-snug"
              style={{ minHeight: '1.25rem' }}
            />
            {newItemText.trim() && (
              <button type="button" onClick={addChecklistItem} className="text-sm text-indigo-600 font-medium px-1 hover:text-indigo-800 transition-colors shrink-0 mt-0.5">
                Add
              </button>
            )}
          </div>

          {/* Tags */}
          <div className="mt-4 border-t border-gray-200/60 dark:border-gray-700/60 pt-3">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } if (e.key === ',') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag (Enter or comma)"
                className="flex-1 bg-transparent text-xs text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
              />
            </div>
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
