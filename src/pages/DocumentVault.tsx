import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentForm } from '../components/documents/DocumentForm';
import { FolderSidebar, type SidebarView } from '../components/documents/FolderSidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useDocuments } from '../hooks/useDocuments';
import { useFolders } from '../hooks/useFolders';
import { getDocumentStatus } from '../services/documentsService';
import type { Document, DocumentCategory, DocumentStatus } from '../types/documents';

type FilterStatus = DocumentStatus | 'All';
type FilterCategory = DocumentCategory | 'All';

const CATEGORIES: DocumentCategory[] = [
  'Identity', 'Visa & Immigration', 'Health', 'Finance', 'Education',
  'Employment', 'Insurance', 'Property', 'Vehicle', 'Other',
];

const STATUS_OPTIONS: { label: string; value: FilterStatus; dot?: string }[] = [
  { label: 'All', value: 'All' },
  { label: 'Valid', value: 'Valid', dot: 'bg-emerald-500' },
  { label: 'Expiring Soon', value: 'Expiring Soon', dot: 'bg-amber-500' },
  { label: 'Expired', value: 'Expired', dot: 'bg-red-500' },
  { label: 'No Expiry', value: 'No Expiry', dot: 'bg-gray-400' },
];

const SMART_VIEW_LABELS: Record<string, string> = {
  all: 'All Documents',
  expiring: 'Expiring Soon',
  expired: 'Expired',
  unfiled: 'Unfiled',
};

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

  const loading = docsLoading || foldersLoading;

  const [formOpen, setFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('All');
  const [selectedView, setSelectedView] = useState<SidebarView>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const knownFolderIds = useMemo(() => new Set(folders.map((f) => f.id)), [folders]);

  const SMART_VIEWS = new Set(['all', 'expiring', 'expired', 'unfiled']);
  const isSmartView = SMART_VIEWS.has(selectedView);
  const activeFolderName = !isSmartView ? folders.find((f) => f.id === selectedView)?.name : null;
  const viewLabel = activeFolderName ?? SMART_VIEW_LABELS[selectedView] ?? 'Documents';

  // Default folderId for new documents: current folder (if a user folder is selected)
  const defaultFolderId = isSmartView ? null : selectedView;

  const filtered = useMemo(() => {
    let docs = documents;

    // Sidebar view filter
    switch (selectedView) {
      case 'all':
        break;
      case 'expiring':
        docs = docs.filter((d) => getDocumentStatus(d.expiryDate) === 'Expiring Soon');
        break;
      case 'expired':
        docs = docs.filter((d) => getDocumentStatus(d.expiryDate) === 'Expired');
        break;
      case 'unfiled':
        docs = docs.filter((d) => !d.folderId || !knownFolderIds.has(d.folderId));
        break;
      default:
        // folder ID
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
      if (filterStatus !== 'All' && getDocumentStatus(doc.expiryDate) !== filterStatus) return false;
      return true;
    });
  }, [documents, selectedView, knownFolderIds, search, filterStatus, filterCategory]);

  const expiringSoon = documents.filter((d) => getDocumentStatus(d.expiryDate) === 'Expiring Soon').length;
  const expired = documents.filter((d) => getDocumentStatus(d.expiryDate) === 'Expired').length;

  const handleViewChange = (view: SidebarView) => {
    setSelectedView(view);
    setSearch('');
    setFilterStatus('All');
    setFilterCategory('All');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-10">
        <div className="flex gap-5 items-start">

          {/* Folder sidebar */}
          {!sidebarCollapsed && (
            <FolderSidebar
              selectedView={selectedView}
              onSelectView={handleViewChange}
              folders={folders}
              documents={documents}
              collapsed={sidebarCollapsed}
              onCollapse={() => setSidebarCollapsed(true)}
            />
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* Expand sidebar button when collapsed */}
                {sidebarCollapsed && (
                  <button
                    onClick={() => setSidebarCollapsed(false)}
                    title="Show folders"
                    className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{viewLabel}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {documents.length} document{documents.length !== 1 ? 's' : ''}
                    {expiringSoon > 0 && <span className="text-amber-600"> · {expiringSoon} expiring soon</span>}
                    {expired > 0 && <span className="text-red-600"> · {expired} expired</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFormOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Document
              </button>
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

                {/* Status filter */}
                <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterStatus(opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        filterStatus === opt.value
                          ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm border border-gray-200/80 dark:border-gray-600'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      {opt.dot && <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />}
                      {opt.label}
                    </button>
                  ))}
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
                  {search || filterStatus !== 'All' || filterCategory !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'This folder is empty — add a document to get started'}
                </p>
                {!isSmartView && !search && filterStatus === 'All' && filterCategory === 'All' && (
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
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => setFormOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center transition-all z-20"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <DocumentForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingDocument(null); }}
        editingDocument={editingDocument}
        defaultFolderId={defaultFolderId}
      />
    </div>
  );
};
