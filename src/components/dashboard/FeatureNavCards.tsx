import React from 'react';
import { Link } from 'react-router-dom';
import type { DashboardData } from '../../hooks/useDashboardData';
import { formatCurrency } from '../../utils/formatters';

interface FeatureNavCardsProps {
  data: DashboardData;
}

export const FeatureNavCards: React.FC<FeatureNavCardsProps> = ({ data }) => {
  const cards = [
    {
      to: '/subscriptions',
      icon: '💳',
      label: 'Subscriptions',
      metric1: data.isLoading ? '—' : (() => {
        if (data.subMonthlyEUR > 0 && data.subMonthlyINR > 0)
          return `${formatCurrency(data.subMonthlyEUR, 'EUR')} + ${formatCurrency(data.subMonthlyINR, 'INR')}/mo`;
        if (data.subMonthlyEUR > 0) return `${formatCurrency(data.subMonthlyEUR, 'EUR')}/mo`;
        if (data.subMonthlyINR > 0) return `${formatCurrency(data.subMonthlyINR, 'INR')}/mo`;
        return 'No active subs';
      })(),
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      hoverBorder: 'hover:border-indigo-200 dark:hover:border-indigo-800',
    },
    {
      to: '/bills',
      icon: '🧾',
      label: 'Bills',
      metric1: data.isLoading ? '—' : (() => {
        if (data.billMonthlyEUR > 0 && data.billMonthlyINR > 0)
          return `${formatCurrency(data.billMonthlyEUR, 'EUR')} + ${formatCurrency(data.billMonthlyINR, 'INR')}/mo`;
        if (data.billMonthlyEUR > 0) return `${formatCurrency(data.billMonthlyEUR, 'EUR')}/mo`;
        if (data.billMonthlyINR > 0) return `${formatCurrency(data.billMonthlyINR, 'INR')}/mo`;
        return 'No active bills';
      })(),
      bg: 'bg-teal-50 dark:bg-teal-950/50',
      textColor: 'text-teal-700 dark:text-teal-300',
      hoverBorder: 'hover:border-teal-200 dark:hover:border-teal-800',
    },
    {
      to: '/goals-habits',
      icon: '🎯',
      label: 'Goals & Habits',
      metric1: data.isLoading
        ? '—'
        : `${data.activeGoals.length} goal${data.activeGoals.length !== 1 ? 's' : ''} · ${data.activeHabits.length} habit${data.activeHabits.length !== 1 ? 's' : ''}`,
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      textColor: 'text-purple-700 dark:text-purple-300',
      hoverBorder: 'hover:border-purple-200 dark:hover:border-purple-800',
    },
    {
      to: '/documents',
      icon: '🗂️',
      label: 'Documents',
      metric1: data.isLoading
        ? '—'
        : data.expiredDocs.length > 0
        ? `${data.expiredDocs.length} expired`
        : data.expiringSoonDocs.length > 0
        ? `${data.expiringSoonDocs.length} expiring soon`
        : `${data.totalValidDocs} valid`,
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      textColor: 'text-amber-700 dark:text-amber-300',
      hoverBorder: 'hover:border-amber-200 dark:hover:border-amber-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => (
        <Link
          key={card.to}
          to={card.to}
          className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${card.hoverBorder}`}
        >
          <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center text-xl`}>
            {card.icon}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className={`text-xs font-bold mt-0.5 ${card.textColor} truncate`}>{card.metric1}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-auto">
            <span>View all</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
};
