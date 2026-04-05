import React from 'react';
import { Link } from 'react-router-dom';
import type { DashboardData } from '../../hooks/useDashboardData';
import { formatCurrency } from '../../utils/formatters';
import { WidgetSkeleton } from './WidgetSkeleton';

interface MonthlyBurnWidgetProps {
  data: DashboardData;
}

export const MonthlyBurnWidget: React.FC<MonthlyBurnWidgetProps> = ({ data }) => {
  if (data.isLoading) return <WidgetSkeleton lines={4} hasHeader />;

  const hasEUR = data.monthlyBurnEUR > 0;
  const hasINR = data.monthlyBurnINR > 0;
  const isEmpty = !hasEUR && !hasINR;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Monthly Burn</h2>
        <span className="text-lg">🔥</span>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-4 text-center gap-1">
          <p className="text-gray-400 dark:text-gray-500 text-sm">No active subscriptions or bills yet</p>
          <Link to="/subscriptions" className="text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:underline mt-1">
            Add your first →
          </Link>
        </div>
      ) : (
        <>
          {/* Hero numbers */}
          <div className="flex flex-wrap gap-4">
            {hasEUR && (
              <div>
                <p className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                  {formatCurrency(data.monthlyBurnEUR, 'EUR')}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">/month EUR</p>
              </div>
            )}
            {hasINR && (
              <div>
                <p className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                  {formatCurrency(data.monthlyBurnINR, 'INR')}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">/month INR</p>
              </div>
            )}
          </div>

          {/* Subs vs Bills breakdown */}
          <div className="space-y-1.5">
            {hasEUR && (
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Subs: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(data.subMonthlyEUR, 'EUR')}</span></span>
                <span>Bills: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(data.billMonthlyEUR, 'EUR')}</span></span>
              </div>
            )}
            {hasINR && (
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Subs: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(data.subMonthlyINR, 'INR')}</span></span>
                <span>Bills: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(data.billMonthlyINR, 'INR')}</span></span>
              </div>
            )}
          </div>

          {/* Yearly projection */}
          <div className="pt-3 border-t border-gray-50 dark:border-gray-800 flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500">
            {hasEUR && (
              <span>Yearly: <span className="font-semibold text-gray-600 dark:text-gray-300">{formatCurrency(data.yearlyBurnEUR, 'EUR')}</span></span>
            )}
            {hasINR && (
              <span>Yearly: <span className="font-semibold text-gray-600 dark:text-gray-300">{formatCurrency(data.yearlyBurnINR, 'INR')}</span></span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
