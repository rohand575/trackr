import React, { useState } from 'react';
import type { PaymentItem } from '../types/payment';
import { PROVIDERS } from '../data/providers';
import { formatCurrency, formatDate, getDaysUntilPayment } from '../utils/formatters';
import { getCategoryConfig } from '../utils/categoryColors';
import { ConfirmDialog } from './ConfirmDialog';
import { deleteSubscription } from '../services/subscriptionService';
import { deleteBill } from '../services/billsService';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { hapticHeavy, hapticSuccess, hapticError } from '../utils/haptics';

function getProviderLogoUrl(providerName: string): string | null {
  if (!providerName) return null;
  const lower = providerName.toLowerCase().trim();
  const found = PROVIDERS.find(
    (p) =>
      p.name.toLowerCase() === lower ||
      p.aliases?.some((a) => a.toLowerCase() === lower)
  );
  return found ? `https://logo.clearbit.com/${found.domain}` : null;
}

const ProviderIcon: React.FC<{ provider: string; fallback: React.ReactNode; bg: string }> = ({
  provider,
  fallback,
  bg: _bg,
}) => {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getProviderLogoUrl(provider);
  if (!logoUrl || imgError) return <span className="text-lg">{fallback}</span>;
  return (
    <img
      src={logoUrl}
      alt={provider}
      className="w-6 h-6 object-contain rounded"
      onError={() => setImgError(true)}
    />
  );
};

interface PaymentCardProps {
  item: PaymentItem;
  onEdit: (item: PaymentItem) => void;
}

const statusStyles: Record<PaymentItem['status'], string> = {
  Active: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
  Paused: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
  Cancelled: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

const statusDots: Record<PaymentItem['status'], string> = {
  Active: 'bg-emerald-500',
  Paused: 'bg-amber-500',
  Cancelled: 'bg-gray-400',
};

export const PaymentCard: React.FC<PaymentCardProps> = ({ item, onEdit }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const config = getCategoryConfig(item.category);
  const daysUntil = getDaysUntilPayment(item.nextPaymentDate);

  const urgency =
    item.status === 'Active'
      ? daysUntil <= 3
        ? 'urgent'
        : daysUntil <= 7
        ? 'soon'
        : 'normal'
      : 'normal';

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      if (item.type === 'subscription') {
        await deleteSubscription(user.uid, item.id);
      } else {
        await deleteBill(user.uid, item.id);
      }
      await hapticSuccess();
      addToast(`"${item.name}" deleted`, 'success');
      setShowConfirm(false);
    } catch {
      await hapticError();
      addToast(`Failed to delete ${item.type}`, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePress = async () => {
    await hapticHeavy();
    setShowConfirm(true);
  };

  const isBill = item.type === 'bill';
  const isInactive = item.status === 'Cancelled';

  return (
    <>
      <div
        className={`
          group relative bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-200
          hover:shadow-md hover:-translate-y-0.5
          ${urgency === 'urgent' ? 'border-red-200 dark:border-red-900 shadow-sm' : urgency === 'soon' ? 'border-amber-200 dark:border-amber-900 shadow-sm' : 'border-gray-100 dark:border-gray-800 shadow-sm'}
          ${isInactive ? 'opacity-60' : ''}
        `}
      >
        {/* Urgency indicator bar */}
        {urgency !== 'normal' && item.status === 'Active' && (
          <div
            className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${
              urgency === 'urgent' ? 'bg-red-400' : 'bg-amber-400'
            }`}
          />
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}
              >
                <ProviderIcon provider={item.provider} fallback={config.icon} bg={config.bg} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.provider}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors opacity-60 hover:opacity-100"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDeletePress}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors opacity-60 hover:opacity-100"
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
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(item.amount, item.currency)}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">/{item.billingCycle.toLowerCase()}</span>
            </div>
          </div>

          {/* Linked To (bills only) */}
          {isBill && item.linkedTo && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="truncate font-medium">{item.linkedTo}</span>
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="truncate">{item.paymentMethod}</span>
            </div>
            {item.nextPaymentDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 col-span-2">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{isBill ? 'Due: ' : ''}{formatDate(item.nextPaymentDate)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[item.status]}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusDots[item.status]}`} />
                {item.status}
              </span>
              {/* Type badge */}
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                  isBill
                    ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/50'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50'
                }`}
              >
                {isBill ? 'Bill' : 'Subscription'}
              </span>
              {/* Autopay badge (bills only) */}
              {isBill && item.autopay && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Auto
                </span>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${config.bg} ${config.color}`}>
              {item.category}
            </span>
          </div>

          {/* Notes */}
          {item.notes && (
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 italic truncate">{item.notes}</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title={`Delete ${isBill ? 'Bill' : 'Subscription'}`}
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </>
  );
};
