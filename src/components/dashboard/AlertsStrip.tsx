import React from 'react';
import { Link } from 'react-router-dom';
import type { Alert } from '../../hooks/useDashboardData';

interface AlertsStripProps {
  alerts: Alert[];
  isLoading: boolean;
}

const SEVERITY_STYLES: Record<Alert['severity'], string> = {
  critical: 'border-l-red-500 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200',
  warning: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200',
  info: 'border-l-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-200',
};

export const AlertsStrip: React.FC<AlertsStripProps> = ({ alerts, isLoading }) => {
  if (isLoading) return null;

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium">
        <span className="text-base">✅</span>
        All clear — no urgent items across your tracked data
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
      {alerts.slice(0, 5).map((alert) => (
        <Link
          key={alert.id}
          to={alert.link}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-l-4 text-sm font-medium whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity ${SEVERITY_STYLES[alert.severity]}`}
        >
          <span className="text-base leading-none">{alert.icon}</span>
          <span>{alert.message}</span>
        </Link>
      ))}
      {alerts.length > 5 && (
        <div className="flex items-center px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium whitespace-nowrap shrink-0">
          +{alerts.length - 5} more
        </div>
      )}
    </div>
  );
};
