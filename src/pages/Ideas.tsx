import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useIdeas } from '../hooks/useIdeas';
import { IdeaCard } from '../components/ideas/IdeaCard';
import { IdeaForm } from '../components/ideas/IdeaForm';
import type { Idea } from '../types/ideas';

export const Ideas: React.FC = () => {
  const { ideas, loading } = useIdeas();
  const [formOpen, setFormOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ideas.filter((idea) => {
      if (!q) return true;
      return (
        idea.title.toLowerCase().includes(q) ||
        idea.body.toLowerCase().includes(q) ||
        idea.checklist.some((item) => item.text.toLowerCase().includes(q))
      );
    });
  }, [ideas, search]);

  const pinned = filtered.filter((i) => i.pinned && !i.isArchived);
  const unpinned = filtered.filter((i) => !i.pinned && !i.isArchived);
  const archived = filtered.filter((i) => i.isArchived);
  const activeCount = ideas.filter((i) => !i.isArchived).length;

  const handleEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingIdea(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ideas</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeCount} idea{activeCount !== 1 ? 's' : ''} captured
            </p>
          </div>
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

        {/* Search */}
        {ideas.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ideas..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : ideas.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <span className="text-3xl">💡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No ideas yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              Got a random thought? Capture it here before it slips away. You can organize and flesh it out later.
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Capture First Idea
            </button>
          </div>
        ) : filtered.length === 0 && search ? (
          /* No search results */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No results found</h3>
            <p className="text-sm text-gray-500">Try a different search term</p>
          </div>
        ) : (
          <>
            {/* Pinned section */}
            {pinned.length > 0 && (
              <div className="mb-6">
                {(unpinned.length > 0 || archived.length > 0) && (
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pinned</span>
                  </div>
                )}
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {pinned.map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} onEdit={handleEdit} />
                  ))}
                </div>
              </div>
            )}

            {/* Unpinned section */}
            {unpinned.length > 0 && (
              <div className="mb-6">
                {pinned.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Others</span>
                  </div>
                )}
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {unpinned.map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} onEdit={handleEdit} />
                  ))}
                </div>
              </div>
            )}

            {/* Archived section (collapsible) */}
            {archived.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${showArchived ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Archived ({archived.length})
                </button>
                {showArchived && (
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                    {archived.map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} onEdit={handleEdit} />
                    ))}
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

      {/* Form modal */}
      <IdeaForm isOpen={formOpen} onClose={handleClose} editingIdea={editingIdea} />
    </div>
  );
};
