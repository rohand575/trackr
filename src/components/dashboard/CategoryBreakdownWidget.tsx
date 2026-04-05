import React, { useState } from 'react';
import type { DashboardData } from '../../hooks/useDashboardData';
import { formatCurrency } from '../../utils/formatters';
import { WidgetSkeleton } from './WidgetSkeleton';

interface CategoryBreakdownWidgetProps {
  data: DashboardData;
}

const CATEGORY_HEX: Record<string, string> = {
  Health: '#e11d48',
  Transport: '#0284c7',
  Entertainment: '#9333ea',
  Utilities: '#d97706',
  Insurance: '#0d9488',
  Education: '#4f46e5',
  Finance: '#16a34a',
  Food: '#ea580c',
  Shopping: '#db2777',
  Technology: '#2563eb',
  Communication: '#0891b2',
  Other: '#4b5563',
};

const CATEGORY_ICONS: Record<string, string> = {
  Health: '🏥', Transport: '🚇', Entertainment: '🎬', Utilities: '⚡',
  Insurance: '🛡️', Education: '📚', Finance: '💰', Food: '🍔',
  Shopping: '🛍️', Technology: '💻', Communication: '📱', Other: '📦',
};

export const CategoryBreakdownWidget: React.FC<CategoryBreakdownWidgetProps> = ({ data }) => {
  const [tab, setTab] = useState<'EUR' | 'INR'>('EUR');

  if (data.isLoading) return <WidgetSkeleton lines={5} hasHeader />;

  const breakdown = tab === 'EUR' ? data.categoryBreakdownEUR : data.categoryBreakdownINR;
  const currency = tab;
  const maxAmount = breakdown[0]?.amount ?? 1;

  const hasEUR = data.categoryBreakdownEUR.length > 0;
  const hasINR = data.categoryBreakdownINR.length > 0;
  const isEmpty = !hasEUR && !hasINR;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Spend by Category</h2>
        {/* Tab toggle */}
        {!isEmpty && (
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-xs">
            {(['EUR', 'INR'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setTab(c)}
                disabled={c === 'EUR' ? !hasEUR : !hasINR}
                className={`px-3 py-1 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  tab === c
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {c === 'EUR' ? '€' : '₹'} {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="py-6 text-center text-gray-400 dark:text-gray-500 text-sm">
          No spending data yet
        </div>
      ) : breakdown.length === 0 ? (
        <div className="py-6 text-center text-gray-400 dark:text-gray-500 text-sm">
          No {tab} spending data
        </div>
      ) : (
        <div className="space-y-3">
          {breakdown.map((item) => (
            <div key={item.category} className="flex items-center gap-3">
              <span className="text-sm w-5 text-center shrink-0">
                {CATEGORY_ICONS[item.category] ?? '📦'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 w-24 truncate shrink-0">
                {item.category}
              </span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(item.amount / maxAmount) * 100}%`,
                    backgroundColor: CATEGORY_HEX[item.category] ?? '#4b5563',
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 w-20 text-right shrink-0 tabular-nums">
                {formatCurrency(item.amount, currency)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right shrink-0">
                {Math.round(item.percentage)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
