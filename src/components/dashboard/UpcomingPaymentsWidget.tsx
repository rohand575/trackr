import React from 'react';
import { Link } from 'react-router-dom';
import type { DashboardData, UpcomingPayment } from '../../hooks/useDashboardData';
import { formatCurrency } from '../../utils/formatters';
import { categoryConfig } from '../../utils/categoryColors';
import { WidgetSkeleton } from './WidgetSkeleton';

interface UpcomingPaymentsWidgetProps {
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

const getDayLabel = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
};

const formatDue = (daysUntil: number): string => {
  if (daysUntil === 0) return 'Today';
  if (daysUntil === 1) return 'Tomorrow';
  return `${daysUntil}d`;
};

export const UpcomingPaymentsWidget: React.FC<UpcomingPaymentsWidgetProps> = ({ data }) => {
  if (data.isLoading) return <WidgetSkeleton lines={4} hasHeader />;

  // Build 7-day strips
  const next7Dates: string[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const paymentsByDay = new Map<string, UpcomingPayment[]>();
  next7Dates.forEach((date) => paymentsByDay.set(date, []));
  data.upcomingPayments.forEach((p) => {
    if (paymentsByDay.has(p.date)) {
      paymentsByDay.get(p.date)!.push(p);
    }
  });

  const today = next7Dates[0];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Upcoming Payments</h2>
        <span className="text-lg">📅</span>
      </div>

      {/* 7-day dot strip */}
      <div className="flex gap-1">
        {next7Dates.map((date) => {
          const payments = paymentsByDay.get(date) ?? [];
          const isToday = date === today;
          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
              <span className={`text-[10px] font-medium ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {getDayLabel(date)}
              </span>
              <div
                className={`w-full h-1.5 rounded-full ${isToday ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-gray-50 dark:bg-gray-800'}`}
              />
              <div className="flex flex-wrap gap-0.5 justify-center min-h-[10px]">
                {payments.slice(0, 2).map((p) => (
                  <div
                    key={p.id}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_HEX[p.category] ?? '#4b5563' }}
                    title={p.name}
                  />
                ))}
                {payments.length > 2 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment list */}
      {data.upcomingPayments.length === 0 ? (
        <div className="py-4 text-center text-gray-400 dark:text-gray-500 text-sm">
          No payments in the next 7 days
        </div>
      ) : (
        <div className="space-y-2">
          {data.upcomingPayments.slice(0, 6).map((p) => {
            const catCfg = categoryConfig[p.category];
            return (
              <div key={p.id} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${catCfg.bg}`}
                >
                  {catCfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{formatCurrency(p.amount, p.currency)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.daysUntil === 0
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                        : p.daysUntil <= 3
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatDue(p.daysUntil)}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      p.source === 'subscription'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400'
                        : 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
                    }`}
                  >
                    {p.source === 'subscription' ? 'Sub' : 'Bill'}
                  </span>
                </div>
              </div>
            );
          })}
          {data.upcomingPayments.length > 6 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-1">
              +{data.upcomingPayments.length - 6} more
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-1 border-t border-gray-50 dark:border-gray-800">
        <Link to="/subscriptions" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
          Subscriptions →
        </Link>
        <Link to="/bills" className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">
          Bills →
        </Link>
      </div>
    </div>
  );
};
