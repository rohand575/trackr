import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentForm } from '../components/documents/DocumentForm';
import { FolderSidebar, type SidebarView } from '../components/documents/FolderSidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { IdeaForm } from '../components/ideas/IdeaForm';
import { IdeaCard } from '../components/ideas/IdeaCard';
import { useDocuments } from '../hooks/useDocuments';
import { useFolders } from '../hooks/useFolders';
import { useIdeas } from '../hooks/useIdeas';
import type { Document, DocumentCategory } from '../types/documents';
import type { Idea } from '../types/ideas';

type FilterCategory = DocumentCategory | 'All';

const CATEGORIES: DocumentCategory[] = [
  'Identity', 'Visa & Immigration', 'Health', 'Finance', 'Education',
  'Employment', 'Insurance', 'Property', 'Vehicle', 'Other',
];


const EmptyDocuments: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-3xl flex items-center justify-center mb-5 text-4xl">🗂️</div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Your vault is empty</h3>
    <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs">
      Add your important documents, IDs, and certificates to keep track of expiry dates
    </p>
    <button
      onClick={onAdd}
      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
      Add Document
    </button>
  </div>
);

export const DocumentVault: React.FC = () => {
  const { documents, loading: docsLoading } = useDocuments();
  const { folders, loading: foldersLoading } = useFolders();
  const { ideas } = useIdeas();

  const loading = docsLoading || foldersLoading;

  const [formOpen, setFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Idea | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('All');
  const [selectedView, setSelectedView] = useState<SidebarView>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Notes scoped to the current view (folder-aware)
  const documentNotes = useMemo(() => {
    const all = ideas.filter((i) => i.section === 'documents' && !i.isArchived);
    if (selectedView === 'all') return all;
    return all.filter((n) => n.documentFolderId === selectedView);
  }, [ideas, selectedView]);

  const knownFolderIds = useMemo(() => new Set(folders.map((f) => f.id)), [folders]);

  const isFolder = selectedView !== 'all';
  const activeFolderName = isFolder ? folders.find((f) => f.id === selectedView)?.name : null;
  const viewLabel = activeFolderName ?? 'All Documents';

  // Default folderId for new documents: current folder (if a user folder is selected)
  const defaultFolderId = isFolder ? selectedView : null;

  const filtered = useMemo(() => {
    let docs = documents;

    // Sidebar view filter
    if (selectedView !== 'all') {
      docs = docs.filter((d) => d.folderId === selectedView);
    }

    // Search + secondary filters
    return docs.filter((doc) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          doc.name.toLowerCase().includes(q) ||
          doc.issuer.toLowerCase().includes(q) ||
          doc.category.toLowerCase().includes(q) ||
          doc.country.toLowerCase().includes(q) ||
          doc.documentNumber.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filterCategory !== 'All' && doc.category !== filterCategory) return false;
      return true;
    });
  }, [documents, selectedView, knownFolderIds, search, filterCategory]);

  const handleViewChange = (view: SidebarView) => {
    setSelectedView(view);
    setSearch('');
    setFilterCategory('All');
    setSidebarMobileOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 min-h-0">
        {/* ── Mobile sidebar drawer ── */}
        <div className={`sm:hidden fixed inset-0 z-50 flex ${sidebarMobileOpen ? '' : 'pointer-events-none'}`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${sidebarMobileOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setSidebarMobileOpen(false)}
          />
          {/* Drawer panel */}
          <aside className={`relative w-56 shrink-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden h-full shadow-xl transition-transform duration-200 ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <FolderSidebar
              selectedView={selectedView}
              onSelectView={handleViewChange}
              folders={folders}
              documents={documents}
              collapsed={false}
              onCollapse={() => setSidebarMobileOpen(false)}
            />
          </aside>
        </div>

        {/* ── Desktop collapsible sidebar panel ── */}
        {!sidebarCollapsed && (
          <aside className="hidden sm:flex w-56 shrink-0 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden">
            <FolderSidebar
              selectedView={selectedView}
              onSelectView={handleViewChange}
              folders={folders}
              documents={documents}
              collapsed={sidebarCollapsed}
              onCollapse={() => setSidebarCollapsed(true)}
            />
          </aside>
        )}

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-6 py-6 pb-24 sm:pb-10 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* Mobile sidebar toggle */}
                <button
                  onClick={() => setSidebarMobileOpen(true)}
                  title="Open folders"
                  className="sm:hidden p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </button>
                {/* Desktop sidebar toggle */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                  className="hidden sm:flex p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{viewLabel}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {documents.length} document{documents.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setNoteFormOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
                >
                  <span className="text-base leading-none">💡</span>
                  Add Note
                </button>
                <button
                  onClick={() => setFormOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Document
                </button>
              </div>
            </div>

            {/* Filters */}
            {documents.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                  />
                </div>

                {/* Category filter */}
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
                    className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}

            {/* Notes section */}
            {documentNotes.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Notes</span>
                </div>
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {documentNotes.map((note) => {
                    const badge = selectedView === 'all' && note.documentFolderId
                      ? folders.find((f) => f.id === note.documentFolderId)?.name
                      : undefined;
                    return (
                      <IdeaCard
                        key={note.id}
                        idea={note}
                        onEdit={(n) => { setEditingNote(n); setNoteFormOpen(true); }}
                        folderBadge={badge}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
            ) : documents.length === 0 ? (
              <EmptyDocuments onAdd={() => setFormOpen(true)} />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-3xl">🔍</div>
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">No matching documents</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {search || filterCategory !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'This folder is empty — add a document to get started'}
                </p>
                {isFolder && !search && filterCategory === 'All' && (
                  <button
                    onClick={() => setFormOpen(true)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Document to this folder
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onEdit={(d) => { setEditingDocument(d); setFormOpen(true); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile FABs */}
      <div className="sm:hidden fixed bottom-6 right-6 flex flex-col items-center gap-3 z-20">
        <button
          onClick={() => setNoteFormOpen(true)}
          className="w-12 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xl rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all"
          title="Add note"
        >
          💡
        </button>
        <button
          onClick={() => setFormOpen(true)}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center transition-all"
          title="Add document"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <DocumentForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingDocument(null); }}
        editingDocument={editingDocument}
        defaultFolderId={defaultFolderId}
      />

      <IdeaForm
        isOpen={noteFormOpen}
        onClose={() => { setNoteFormOpen(false); setEditingNote(null); }}
        editingIdea={editingNote}
        section="documents"
        documentFolderId={isFolder ? selectedView : null}
      />
    </div>
  );
};
