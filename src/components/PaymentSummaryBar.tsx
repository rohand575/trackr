import React from 'react';
import type { PaymentItem, Country, Currency } from '../types/payment';
import { formatCurrency, getMonthlyAmount } from '../utils/formatters';

interface PaymentSummaryBarProps {
  items: PaymentItem[];
  country: Country;
}

export const PaymentSummaryBar: React.FC<PaymentSummaryBarProps> = ({ items, country }) => {
  const active = items.filter((i) => i.status === 'Active');

  const primaryCurrency: Record<Country, Currency> = {
    Germany: 'EUR',
    India: 'INR',
  };

  const currency = primaryCurrency[country];

  const monthlyTotal = active
    .filter((i) => i.currency === currency)
    .reduce((sum, i) => sum + getMonthlyAmount(i.amount, i.billingCycle), 0);

  const yearlyTotal = monthlyTotal * 12;

  const autopayCount = active.filter((i) => i.type === 'bill' && i.autopay).length;

  const stats = [
    {
      label: 'Active',
      value: active.length,
      sub: `of ${items.length} total`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      label: 'Monthly Cost',
      value: formatCurrency(monthlyTotal, currency),
      sub: currency,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      label: 'Yearly Cost',
      value: formatCurrency(yearlyTotal, currency),
      sub: currency,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      label: 'Autopay',
      value: autopayCount,
      sub: 'bills on autopay',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: autopayCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500',
      bg: autopayCount > 0 ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-gray-50 dark:bg-gray-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color} truncate leading-tight`}>{stat.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{stat.sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
