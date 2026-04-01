import React from 'react';
import type { Subscription, Country, Currency } from '../types/subscription';
import { formatCurrency, getMonthlyAmount } from '../utils/formatters';

interface SummaryBarProps {
  subscriptions: Subscription[];
  country: Country;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({ subscriptions, country }) => {
  const active = subscriptions.filter((s) => s.status === 'Active');

  const primaryCurrency: Record<Country, Currency> = {
    Germany: 'EUR',
    India: 'INR',
  };

  const currency = primaryCurrency[country];

  const monthlyTotal = active
    .filter((s) => s.currency === currency)
    .reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.billingCycle), 0);

  const yearlyTotal = monthlyTotal * 12;

  const upcomingCount = active.filter((s) => {
    const days = Math.ceil(
      (new Date(s.nextPaymentDate + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days >= 0 && days <= 7;
  }).length;

  const stats = [
    {
      label: 'Active',
      value: active.length,
      sub: `of ${subscriptions.length} total`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
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
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
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
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Due Soon',
      value: upcomingCount,
      sub: 'within 7 days',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: upcomingCount > 0 ? 'text-amber-600' : 'text-gray-400',
      bg: upcomingCount > 0 ? 'bg-amber-50' : 'bg-gray-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color} truncate leading-tight`}>{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
