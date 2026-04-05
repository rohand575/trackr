import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useIdeas } from '../hooks/useIdeas';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { updateIdea } from '../services/ideasService';
import { IdeaCard } from '../components/ideas/IdeaCard';
import { IdeaForm } from '../components/ideas/IdeaForm';
import type { Idea, IdeaKanbanStatus } from '../types/ideas';

type ViewMode = 'grid' | 'kanban';

const KANBAN_COLUMNS: { status: IdeaKanbanStatus; label: string; color: string; dot: string }[] = [
  { status: 'todo',        label: 'To Do',       color: 'border-gray-200 dark:border-gray-700',   dot: 'bg-gray-400' },
  { status: 'in-progress', label: 'In Progress',  color: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-400' },
  { status: 'done',        label: 'Done',         color: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
];

export const Ideas: React.FC = () => {
  const { ideas, loading } = useIdeas();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Collect all unique tags across non-archived ideas
  const allTags = useMemo(() => {
    const set = new Set<string>();
    ideas.filter((i) => !i.isArchived).forEach((i) => (i.tags ?? []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [ideas]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ideas.filter((idea) => {
      if (q && !(
        idea.title.toLowerCase().includes(q) ||
        idea.body.toLowerCase().includes(q) ||
        idea.checklist.some((item) => item.text.toLowerCase().includes(q)) ||
        (idea.tags ?? []).some((t) => t.includes(q))
      )) return false;
      if (activeTag && !(idea.tags ?? []).includes(activeTag)) return false;
      return true;
    });
  }, [ideas, search, activeTag]);

  const pinned   = filtered.filter((i) => i.pinned && !i.isArchived);
  const unpinned = filtered.filter((i) => !i.pinned && !i.isArchived);
  const archived = filtered.filter((i) => i.isArchived);
  const activeCount = ideas.filter((i) => !i.isArchived).length;

  const handleEdit = (idea: Idea) => { setEditingIdea(idea); setFormOpen(true); };
  const handleClose = () => { setFormOpen(false); setEditingIdea(null); };

  const handleKanbanStatusChange = async (idea: Idea, status: IdeaKanbanStatus) => {
    if (!user) return;
    try {
      await updateIdea(user.uid, idea.id, { kanbanStatus: status });
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ideas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {activeCount} idea{activeCount !== 1 ? 's' : ''} captured
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            {ideas.length > 0 && (
              <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                  Kanban
                </button>
              </div>
            )}
            <button
              onClick={() => setFormOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Idea
            </button>
          </div>
        </div>

        {/* Search + tag filters */}
        {ideas.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="relative max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ideas..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            {/* Tag chips */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${activeTag === tag ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/60'}`}
                  >
                    #{tag}
                  </button>
                ))}
                {activeTag && (
                  <button onClick={() => setActiveTag(null)} className="px-2.5 py-1 rounded-full text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
              <span className="text-3xl">💡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No ideas yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              Got a random thought? Capture it here before it slips away.
            </p>
            <button onClick={() => setFormOpen(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Capture First Idea
            </button>
          </div>
        ) : filtered.filter((i) => !i.isArchived).length === 0 && (search || activeTag) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No results</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try a different search or tag</p>
          </div>
        ) : viewMode === 'kanban' ? (
          /* ── Kanban board ── */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {KANBAN_COLUMNS.map((col) => {
              const colIdeas = filtered.filter((i) => !i.isArchived && (i.kanbanStatus ?? 'todo') === col.status);
              return (
                <div key={col.status} className={`bg-white dark:bg-gray-900 rounded-2xl border ${col.color} shadow-sm`}>
                  {/* Column header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{col.label}</span>
                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 font-medium">{colIdeas.length}</span>
                  </div>
                  {/* Cards */}
                  <div className="p-3 space-y-2 min-h-[120px]">
                    {colIdeas.map((idea) => (
                      <div key={idea.id} className="group">
                        {/* Compact kanban card */}
                        <div
                          onClick={() => handleEdit(idea)}
                          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug mb-1">{idea.title}</p>
                          {idea.body && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{idea.body}</p>}
                          {(idea.tags ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {idea.tags.map((t) => (
                                <span key={t} className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100/70 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">#{t}</span>
                              ))}
                            </div>
                          )}
                          {/* Status move buttons */}
                          <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {KANBAN_COLUMNS.filter((c) => c.status !== col.status).map((c) => (
                              <button
                                key={c.status}
                                onClick={(e) => { e.stopPropagation(); handleKanbanStatusChange(idea, c.status); }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {colIdeas.length === 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-6">No ideas</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Grid view ── */
          <>
            {pinned.length > 0 && (
              <div className="mb-6">
                {(unpinned.length > 0 || archived.length > 0) && (
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pinned</span>
                  </div>
                )}
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {pinned.map((idea) => <IdeaCard key={idea.id} idea={idea} onEdit={handleEdit} />)}
                </div>
              </div>
            )}

            {unpinned.length > 0 && (
              <div className="mb-6">
                {pinned.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Others</span>
                  </div>
                )}
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {unpinned.map((idea) => <IdeaCard key={idea.id} idea={idea} onEdit={handleEdit} />)}
                </div>
              </div>
            )}

            {archived.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showArchived ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Archived ({archived.length})
                </button>
                {showArchived && (
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                    {archived.map((idea) => <IdeaCard key={idea.id} idea={idea} onEdit={handleEdit} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => setFormOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center transition-all duration-200 z-20"
        title="New Idea"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <IdeaForm isOpen={formOpen} onClose={handleClose} editingIdea={editingIdea} />
    </div>
  );
};
