import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { DocumentFolder, Document } from '../../types/documents';
import { getDocumentStatus } from '../../services/documentsService';
import { addFolder, updateFolder, deleteFolder } from '../../services/foldersService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { ConfirmDialog } from '../ConfirmDialog';

export type SidebarView = 'all' | 'expiring' | 'expired' | 'unfiled' | (string & {});

interface Props {
  selectedView: SidebarView;
  onSelectView: (view: SidebarView) => void;
  folders: DocumentFolder[];
  documents: Document[];
  collapsed: boolean;
  onCollapse: () => void;
}

interface FolderTreeNode {
  folder: DocumentFolder;
  children: FolderTreeNode[];
}

function buildTree(
  folders: DocumentFolder[],
  parentId: string | null,
  knownIds: Set<string>,
): FolderTreeNode[] {
  return folders
    .filter((f) => {
      const effective = f.parentId && knownIds.has(f.parentId) ? f.parentId : null;
      return effective === parentId;
    })
    .map((folder) => ({
      folder,
      children: buildTree(folders, folder.id, knownIds),
    }));
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  countColor?: string;
}> = ({ icon, label, count, active, onClick, countColor }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left ${
      active
        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
    }`}
  >
    <span className="shrink-0 w-4 flex items-center justify-center">{icon}</span>
    <span className="flex-1 truncate">{label}</span>
    {count > 0 && (
      <span className={`text-xs font-medium tabular-nums ${countColor ?? (active ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500')}`}>
        {count}
      </span>
    )}
  </button>
);

export const FolderSidebar: React.FC<Props> = ({
  selectedView,
  onSelectView,
  folders,
  documents,
  collapsed,
  onCollapse,
}) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [creatingParentId, setCreatingParentId] = useState<string | null | undefined>(undefined);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [folderToDelete, setFolderToDelete] = useState<DocumentFolder | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const newFolderInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const hasAutoExpanded = useRef(false);

  // Auto-expand folders that have children on first load
  useEffect(() => {
    if (folders.length === 0 || hasAutoExpanded.current) return;
    const knownIds = new Set(folders.map((f) => f.id));
    const parentIds = new Set(
      folders
        .filter((f) => f.parentId !== null && knownIds.has(f.parentId!))
        .map((f) => f.parentId as string),
    );
    if (parentIds.size > 0) setExpandedFolders(parentIds);
    hasAutoExpanded.current = true;
  }, [folders]);

  useEffect(() => {
    if (creatingParentId !== undefined) {
      setTimeout(() => newFolderInputRef.current?.focus(), 50);
    }
  }, [creatingParentId]);

  useEffect(() => {
    if (editingFolderId) editInputRef.current?.focus();
  }, [editingFolderId]);

  const knownFolderIds = useMemo(() => new Set(folders.map((f) => f.id)), [folders]);
  const folderTree = useMemo(() => buildTree(folders, null, knownFolderIds), [folders, knownFolderIds]);

  const counts = {
    all: documents.length,
    expiring: documents.filter((d) => getDocumentStatus(d.expiryDate) === 'Expiring Soon').length,
    expired: documents.filter((d) => getDocumentStatus(d.expiryDate) === 'Expired').length,
    unfiled: documents.filter((d) => !d.folderId || !knownFolderIds.has(d.folderId)).length,
  };

  const folderDocCount = (folderId: string) =>
    documents.filter((d) => d.folderId === folderId).length;

  const toggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const startCreate = (parentId: string | null) => {
    if (parentId !== null) {
      setExpandedFolders((prev) => new Set([...prev, parentId]));
    }
    setCreatingParentId(parentId);
    setNewFolderName('');
  };

  const cancelCreate = () => {
    setCreatingParentId(undefined);
    setNewFolderName('');
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name || !user) { cancelCreate(); return; }
    setSaving(true);
    try {
      await addFolder(user.uid, { name, parentId: creatingParentId ?? null });
      setNewFolderName('');
      setCreatingParentId(undefined);
    } catch {
      addToast('Failed to create folder', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRenameFolder = async (folderId: string) => {
    const name = editingName.trim();
    if (!name || !user) { setEditingFolderId(null); return; }
    try {
      await updateFolder(user.uid, folderId, { name });
    } catch {
      addToast('Failed to rename folder', 'error');
    } finally {
      setEditingFolderId(null);
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete || !user) return;
    setDeleting(true);
    try {
      const children = folders.filter((f) => f.parentId === folderToDelete.id);
      await Promise.all(children.map((f) => updateFolder(user.uid, f.id, { parentId: null })));
      await deleteFolder(user.uid, folderToDelete.id);
      if (selectedView === folderToDelete.id) onSelectView('all');
      addToast('Folder deleted', 'success');
    } catch {
      addToast('Failed to delete folder', 'error');
    } finally {
      setDeleting(false);
      setFolderToDelete(null);
    }
  };

  const startEdit = (folder: DocumentFolder) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const deleteMessage = useMemo(() => {
    if (!folderToDelete) return '';
    const childCount = folders.filter((f) => f.parentId === folderToDelete.id).length;
    if (childCount > 0) {
      return `Delete "${folderToDelete.name}"? Documents inside will become unfiled and ${childCount} subfolder${childCount > 1 ? 's' : ''} will be moved to root.`;
    }
    return `Delete "${folderToDelete.name}"? Documents inside will become unfiled.`;
  }, [folderToDelete, folders]);

  const renderCreateInput = (indentPx: number) => (
    <div className="flex items-center gap-1.5 py-1.5 pr-3" style={{ paddingLeft: `${indentPx}px` }}>
      <svg className="w-3.5 h-3.5 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
      <input
        ref={newFolderInputRef}
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        placeholder="Folder name..."
        disabled={saving}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCreateFolder();
          if (e.key === 'Escape') cancelCreate();
        }}
        onBlur={() => {
          if (newFolderName.trim()) handleCreateFolder();
          else cancelCreate();
        }}
        className="flex-1 min-w-0 text-sm bg-transparent border-b border-indigo-400 focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
      />
    </div>
  );

  const renderNode = (node: FolderTreeNode, depth: number): React.ReactNode => {
    const { folder, children } = node;
    const isSelected = selectedView === folder.id;
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = children.length > 0 || creatingParentId === folder.id;
    const docCount = folderDocCount(folder.id);
    const indentPx = depth * 16;

    return (
      <div key={folder.id}>
        {editingFolderId === folder.id ? (
          <div className="flex items-center gap-1.5 py-1.5 pr-3" style={{ paddingLeft: `${12 + indentPx}px` }}>
            <svg className="w-3.5 h-3.5 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
            <input
              ref={editInputRef}
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameFolder(folder.id);
                if (e.key === 'Escape') setEditingFolderId(null);
              }}
              onBlur={() => handleRenameFolder(folder.id)}
              className="flex-1 min-w-0 text-sm bg-transparent border-b border-indigo-400 focus:outline-none text-gray-900 dark:text-white"
            />
          </div>
        ) : (
          <div
            className={`group/item flex items-center rounded-lg transition-all mx-1 ${
              isSelected
                ? 'bg-indigo-50 dark:bg-indigo-950/60'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            style={{ paddingLeft: `${indentPx}px` }}
          >
            {/* Expand chevron */}
            <button
              onClick={() => toggleExpand(folder.id)}
              className={`p-1.5 shrink-0 rounded transition-colors ${
                hasChildren
                  ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  : 'text-transparent pointer-events-none'
              }`}
            >
              <svg
                className={`w-3 h-3 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Folder name */}
            <button
              onClick={() => onSelectView(folder.id)}
              className={`flex-1 flex items-center gap-1.5 py-1.5 text-sm text-left min-w-0 overflow-hidden ${
                isSelected
                  ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 group-hover/item:text-gray-900 dark:group-hover/item:text-gray-100'
              }`}
            >
              <svg
                className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`}
                fill={isSelected ? 'currentColor' : 'none'}
                viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
              <span className="flex-1 truncate">{folder.name}</span>
              {docCount > 0 && (
                <span className={`text-xs tabular-nums group-hover/item:hidden mr-1 ${isSelected ? 'text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {docCount}
                </span>
              )}
            </button>

            {/* Hover actions */}
            <div className="hidden group-hover/item:flex items-center gap-0.5 pr-1 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); startCreate(folder.id); }}
                title="New subfolder"
                className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); startEdit(folder); }}
                title="Rename"
                className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setFolderToDelete(folder); }}
                title="Delete"
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Children */}
        {isExpanded && (
          <div>
            {children.map((child) => renderNode(child, depth + 1))}
            {creatingParentId === folder.id && renderCreateInput(24 + (depth + 1) * 16)}
          </div>
        )}
      </div>
    );
  };

  if (collapsed) return null;

  return (
    <>
      <div className="flex flex-col h-full overflow-y-auto select-none">
        {/* Views section */}
        <div className="px-3 pt-4 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
            Views
          </span>
          <button
            onClick={onCollapse}
            title="Collapse sidebar"
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="px-2 pb-2 space-y-0.5">
          <NavItem
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            label="All Documents" count={counts.all} active={selectedView === 'all'}
            onClick={() => onSelectView('all')}
          />
          <NavItem
            icon={<svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            label="Expiring Soon" count={counts.expiring} active={selectedView === 'expiring'}
            onClick={() => onSelectView('expiring')} countColor="text-amber-500"
          />
          <NavItem
            icon={<svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Expired" count={counts.expired} active={selectedView === 'expired'}
            onClick={() => onSelectView('expired')} countColor="text-red-500"
          />
          <NavItem
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
            label="Unfiled" count={counts.unfiled} active={selectedView === 'unfiled'}
            onClick={() => onSelectView('unfiled')}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800 mx-3 my-1" />

        {/* Folders section */}
        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
            Folders
          </span>
          <button
            onClick={() => startCreate(null)}
            title="New folder"
            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="px-2 pb-4 space-y-0.5 flex-1">
          {folderTree.map((node) => renderNode(node, 0))}
          {creatingParentId === null && renderCreateInput(12)}
          {folders.length === 0 && creatingParentId === undefined && (
            <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 italic">
              No folders yet
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!folderToDelete}
        title="Delete Folder"
        message={deleteMessage}
        confirmLabel="Delete"
        onConfirm={handleDeleteFolder}
        onCancel={() => setFolderToDelete(null)}
        loading={deleting}
      />
    </>
  );
};
