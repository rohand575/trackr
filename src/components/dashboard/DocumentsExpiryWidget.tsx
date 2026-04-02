import React from 'react';
import { Link } from 'react-router-dom';
import type { DashboardData } from '../../hooks/useDashboardData';
import { WidgetSkeleton } from './WidgetSkeleton';
import type { Document as AppDocument } from '../../types/documents';

interface DocumentsExpiryWidgetProps {
  data: DashboardData;
}

const getDaysUntil = (dateStr: string): number => {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const DOC_CATEGORY_ICONS: Record<string, string> = {
  'Identity': '🪪',
  'Visa & Immigration': '🛂',
  'Health': '🏥',
  'Finance': '💳',
  'Education': '🎓',
  'Employment': '💼',
  'Insurance': '🛡️',
  'Property': '🏠',
  'Vehicle': '🚗',
  'Other': '📄',
};

interface DocRowProps {
  doc: AppDocument;
  type: 'expired' | 'expiring';
}

const DocRow: React.FC<DocRowProps> = ({ doc, type }) => {
  const daysUntil = doc.expiryDate ? getDaysUntil(doc.expiryDate) : null;
  const icon = DOC_CATEGORY_ICONS[doc.category] ?? '📄';

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-2 h-2 rounded-full shrink-0 ${
          type === 'expired' ? 'bg-red-500' : 'bg-amber-400'
        }`}
      />
      <span className="text-base leading-none">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
        <p className="text-xs text-gray-400">{doc.category}</p>
      </div>
      <span
        className={`text-xs font-semibold shrink-0 ${
          type === 'expired' ? 'text-red-600' : 'text-amber-600'
        }`}
      >
        {type === 'expired'
          ? 'EXPIRED'
          : daysUntil === 0
          ? 'Today'
          : `${daysUntil}d left`}
      </span>
    </div>
  );
};

export const DocumentsExpiryWidget: React.FC<DocumentsExpiryWidgetProps> = ({ data }) => {
  if (data.isLoading) return <WidgetSkeleton lines={3} hasHeader />;

  const urgentCount = data.expiredDocs.length + data.expiringSoonDocs.length;
  const hasUrgent = urgentCount > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Documents</h2>
        <span className="text-lg">{hasUrgent ? '⚠️' : '🗂️'}</span>
      </div>

      {data.expiredDocs.length === 0 && data.expiringSoonDocs.length === 0 && data.totalValidDocs === 0 ? (
        <div className="py-4 text-center text-gray-400 text-sm">
          No documents added yet
          <Link to="/documents" className="block text-indigo-600 text-xs font-medium hover:underline mt-1">
            Add documents →
          </Link>
        </div>
      ) : (
        <>
          {/* Urgent items */}
          {hasUrgent ? (
            <div className="space-y-2.5">
              {data.expiredDocs.slice(0, 3).map((doc) => (
                <DocRow key={doc.id} doc={doc} type="expired" />
              ))}
              {data.expiringSoonDocs.slice(0, 3).map((doc) => (
                <DocRow key={doc.id} doc={doc} type="expiring" />
              ))}
              {urgentCount > 6 && (
                <p className="text-xs text-gray-400 text-center">+{urgentCount - 6} more</p>
              )}
            </div>
          ) : (
            <div className="py-2 text-sm text-emerald-600 font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              All documents are valid
            </div>
          )}

          {/* Footer: valid count */}
          {data.totalValidDocs > 0 && (
            <p className="text-xs text-gray-400 pt-1 border-t border-gray-50">
              ✅ {data.totalValidDocs} other doc{data.totalValidDocs === 1 ? '' : 's'} valid
            </p>
          )}
        </>
      )}

      <Link to="/documents" className="text-xs text-indigo-600 hover:underline font-medium self-start">
        View all documents →
      </Link>
    </div>
  );
};
