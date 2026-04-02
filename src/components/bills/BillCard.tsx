import React, { useState } from 'react';
import type { Bill } from '../../types/bills';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryConfig } from '../../utils/categoryColors';
import { ConfirmDialog } from '../ConfirmDialog';
import { deleteBill } from '../../services/billsService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { hapticHeavy, hapticSuccess, hapticError } from '../../utils/haptics';

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
}

const statusStyles: Record<Bill['status'], string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive: 'bg-gray-100 text-gray-500 border-gray-200',
};

const statusDots: Record<Bill['status'], string> = {
  Active: 'bg-emerald-500',
  Inactive: 'bg-gray-400',
};

export const BillCard: React.FC<BillCardProps> = ({ bill, onEdit }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const config = getCategoryConfig(bill.category);

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteBill(user.uid, bill.id);
      await hapticSuccess();
      addToast(`"${bill.name}" deleted`, 'success');
      setShowConfirm(false);
    } catch {
      await hapticError();
      addToast('Failed to delete bill', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Haptic on delete button tap (before confirm dialog opens)
  const handleDeletePress = async () => {
    await hapticHeavy();
    setShowConfirm(true);
  };

  return (
    <>
      <div
        className={`
          group relative bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-200
          hover:shadow-md hover:-translate-y-0.5
          ${bill.status === 'Inactive' ? 'opacity-60' : ''}
        `}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0 text-lg`}
              >
                {config.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{bill.name}</h3>
                <p className="text-sm text-gray-500 truncate">{bill.provider}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(bill)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-60 hover:opacity-100"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDeletePress}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-60 hover:opacity-100"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(bill.amount, bill.currency)}
              </span>
              <span className="text-sm text-gray-400 font-medium">/{bill.billingCycle.toLowerCase()}</span>
            </div>
          </div>

          {/* Linked To */}
          {bill.linkedTo && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 px-2 py-1.5 bg-gray-50 rounded-lg">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="truncate font-medium">{bill.linkedTo}</span>
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="truncate">{bill.paymentMethod}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="truncate">{bill.accountUsed}</span>
            </div>
            {bill.dueDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 col-span-2">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Due: {bill.dueDate}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[bill.status]}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusDots[bill.status]}`} />
                {bill.status}
              </span>
              {bill.autopay && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Auto
                </span>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${config.bg} ${config.color}`}>
              {bill.category}
            </span>
          </div>

          {/* Notes */}
          {bill.notes && (
            <p className="mt-3 text-xs text-gray-400 italic truncate">{bill.notes}</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Bill"
        message={`Are you sure you want to delete "${bill.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </>
  );
};
