import React, { useState } from 'react';
import type { Subscription } from '../types/subscription';
import { formatCurrency, formatDate, getDaysUntilPayment } from '../utils/formatters';
import { getCategoryConfig } from '../utils/categoryColors';
import { ConfirmDialog } from './ConfirmDialog';
import { deleteSubscription } from '../services/subscriptionService';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
}

const statusStyles: Record<Subscription['status'], string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paused: 'bg-amber-50 text-amber-700 border-amber-200',
  Cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const statusDots: Record<Subscription['status'], string> = {
  Active: 'bg-emerald-500',
  Paused: 'bg-amber-500',
  Cancelled: 'bg-gray-400',
};

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onEdit }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const config = getCategoryConfig(subscription.category);
  const daysUntil = getDaysUntilPayment(subscription.nextPaymentDate);

  const urgency =
    subscription.status === 'Active'
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
      await deleteSubscription(user.uid, subscription.id);
      addToast(`"${subscription.name}" deleted`, 'success');
      setShowConfirm(false);
    } catch {
      addToast('Failed to delete subscription', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`
          group relative bg-white rounded-2xl border transition-all duration-200
          hover:shadow-md hover:-translate-y-0.5
          ${urgency === 'urgent' ? 'border-red-200 shadow-sm' : urgency === 'soon' ? 'border-amber-200 shadow-sm' : 'border-gray-100 shadow-sm'}
          ${subscription.status === 'Cancelled' ? 'opacity-60' : ''}
        `}
      >
        {/* Urgency indicator bar */}
        {urgency !== 'normal' && subscription.status === 'Active' && (
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
                className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0 text-lg`}
              >
                {config.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{subscription.name}</h3>
                <p className="text-sm text-gray-500 truncate">{subscription.provider}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(subscription)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
                {formatCurrency(subscription.amount, subscription.currency)}
              </span>
              <span className="text-sm text-gray-400 font-medium">/{subscription.billingCycle.toLowerCase()}</span>
            </div>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={urgency === 'urgent' ? 'text-red-600 font-medium' : urgency === 'soon' ? 'text-amber-600 font-medium' : ''}>
                {daysUntil < 0
                  ? 'Overdue'
                  : daysUntil === 0
                  ? 'Due today'
                  : `${daysUntil}d left`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="truncate">{subscription.paymentMethod}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 col-span-2">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(subscription.nextPaymentDate)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[subscription.status]}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusDots[subscription.status]}`} />
              {subscription.status}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${config.bg} ${config.color}`}>
              {subscription.category}
            </span>
          </div>

          {/* Notes */}
          {subscription.notes && (
            <p className="mt-3 text-xs text-gray-400 italic truncate">{subscription.notes}</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Subscription"
        message={`Are you sure you want to delete "${subscription.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </>
  );
};
