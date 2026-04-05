import React, { useState } from 'react';
import type { Document } from '../../types/documents';
import { getDocumentStatus } from '../../services/documentsService';
import { deleteDocument } from '../../services/documentsService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { ConfirmDialog } from '../ConfirmDialog';
import { formatDate } from '../../utils/formatters';

interface DocumentCardProps {
  document: Document;
  onEdit: (doc: Document) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Identity': '🪪',
  'Visa & Immigration': '✈️',
  'Health': '🏥',
  'Finance': '💰',
  'Education': '📚',
  'Employment': '💼',
  'Insurance': '🛡️',
  'Property': '🏠',
  'Vehicle': '🚗',
  'Other': '📄',
};

const STATUS_CONFIG = {
  'Valid': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/50', dot: 'bg-emerald-500', bar: 'border-emerald-200 dark:border-emerald-900' },
  'Expiring Soon': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/50', dot: 'bg-amber-500', bar: 'border-amber-300 dark:border-amber-900' },
  'Expired': { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800/50', dot: 'bg-red-500', bar: 'border-red-300 dark:border-red-900' },
  'No Expiry': { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400', bar: 'border-gray-100 dark:border-gray-800' },
};

const COUNTRY_FLAGS: Record<string, string> = {
  Germany: '🇩🇪',
  India: '🇮🇳',
  Other: '🌍',
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onEdit }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [docNumberRevealed, setDocNumberRevealed] = useState(false);

  const status = getDocumentStatus(document.expiryDate);
  const config = STATUS_CONFIG[status];

  const daysLeft = document.expiryDate
    ? Math.ceil((new Date(document.expiryDate + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteDocument(user.uid, document.id);
      addToast('Document removed', 'success');
    } catch {
      addToast('Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className={`group bg-white dark:bg-gray-900 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${config.bar}`}>
        {/* Urgency top bar */}
        {(status === 'Expiring Soon' || status === 'Expired') && (
          <div className={`h-0.5 rounded-t-2xl ${status === 'Expired' ? 'bg-red-400' : 'bg-amber-400'}`} />
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-xl shrink-0">
                {CATEGORY_ICONS[document.category] ?? '📄'}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{document.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {COUNTRY_FLAGS[document.country] ?? '🌍'} {document.country} · {document.category}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onEdit(document)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={() => setShowConfirm(true)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            {document.issuer && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <span className="truncate">{document.issuer}</span>
              </div>
            )}
            {document.documentNumber && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                <span className="font-mono truncate flex-1">
                  {docNumberRevealed
                    ? document.documentNumber
                    : `••••••${document.documentNumber.slice(-4)}`}
                </span>
                <button
                  onClick={() => setDocNumberRevealed((v) => !v)}
                  className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                  title={docNumberRevealed ? 'Hide' : 'Reveal'}
                >
                  {docNumberRevealed ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            )}
            {document.expiryDate && (
              <div className={`flex items-center gap-2 text-xs ${status === 'Expired' ? 'text-red-600 font-medium' : status === 'Expiring Soon' ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>
                  Expires {formatDate(document.expiryDate)}
                  {daysLeft !== null && (
                    <span className="ml-1">
                      ({daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : daysLeft === 0 ? 'today' : `in ${daysLeft}d`})
                    </span>
                  )}
                </span>
              </div>
            )}
            {document.storageLocation && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                <span className="truncate">{document.storageLocation}</span>
              </div>
            )}
          </div>

          {/* Footer: status badge */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {status}
            </span>
            {document.issueDate && (
              <span className="text-xs text-gray-400 dark:text-gray-500">Issued {formatDate(document.issueDate)}</span>
            )}
          </div>

          {document.notes && <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 italic truncate">{document.notes}</p>}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Remove Document"
        message={`Remove "${document.name}" from your vault?`}
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </>
  );
};
