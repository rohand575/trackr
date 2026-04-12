import React from 'react';
import { Navbar } from '../components/Navbar';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuthStore } from '../store/useAuthStore';
import { AlertsStrip } from '../components/dashboard/AlertsStrip';
import { MonthlyBurnWidget } from '../components/dashboard/MonthlyBurnWidget';
import { UpcomingPaymentsWidget } from '../components/dashboard/UpcomingPaymentsWidget';
import { CategoryBreakdownWidget } from '../components/dashboard/CategoryBreakdownWidget';
import { GoalsWidget } from '../components/dashboard/GoalsWidget';
import { HabitsTodayWidget } from '../components/dashboard/HabitsTodayWidget';
import { DocumentsExpiryWidget } from '../components/dashboard/DocumentsExpiryWidget';
import { FeatureNavCards } from '../components/dashboard/FeatureNavCards';

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatHeaderDate = (): string =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const OverviewDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const data = useDashboardData();

  const firstName =
    user?.displayName?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'there';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-10">
        {/* Welcome header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {firstName}!
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{formatHeaderDate()}</p>

          {/* Quick-stat chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {data.isLoading ? (
              <>
                {[84, 110, 96].map((w, i) => (
                  <div key={i} style={{ width: w }} className="h-6 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </>
            ) : (
              <>
                {/* Next payment chip */}
                {data.upcomingPayments.length > 0 ? (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    data.upcomingPayments[0].daysUntil === 0
                      ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900/50'
                      : data.upcomingPayments[0].daysUntil <= 3
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/50'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/50'
                  }`}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {data.upcomingPayments[0].daysUntil === 0
                      ? 'Payment due today'
                      : `Next payment in ${data.upcomingPayments[0].daysUntil}d`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7"/>
                    </svg>
                    No payments this week
                  </span>
                )}

                {/* Habits chip */}
                {data.habitsScheduledToday.length > 0 && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    data.habitsCompletedToday === data.habitsScheduledToday.length
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/50'
                      : 'bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700/50'
                  }`}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                    {data.habitsCompletedToday}/{data.habitsScheduledToday.length} habits done
                  </span>
                )}

                {/* Goals chip */}
                {data.activeGoals.length > 0 && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    data.goalsOffTrack > 0
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/50'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/50'
                  }`}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                    </svg>
                    {data.goalsOnTrack}/{data.activeGoals.length} goals on track
                  </span>
                )}

                {/* Critical alerts chip */}
                {data.alerts.filter(a => a.severity === 'critical').length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/50">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    {data.alerts.filter(a => a.severity === 'critical').length} critical alert{data.alerts.filter(a => a.severity === 'critical').length !== 1 ? 's' : ''}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="mb-5">
          <AlertsStrip alerts={data.alerts} isLoading={data.isLoading} />
        </div>

        {/* Widget grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Row 1: Financial burn + Upcoming payments */}
          <MonthlyBurnWidget data={data} />
          <div className="lg:col-span-2">
            <UpcomingPaymentsWidget data={data} />
          </div>

          {/* Row 2: Category breakdown + Goals */}
          <div className="lg:col-span-2">
            <CategoryBreakdownWidget data={data} />
          </div>
          <GoalsWidget data={data} />

          {/* Row 3: Habits today + Documents */}
          <div className="lg:col-span-2">
            <HabitsTodayWidget data={data} />
          </div>
          <DocumentsExpiryWidget data={data} />
        </div>

        {/* Quick nav cards */}
        <div className="mt-4">
          <FeatureNavCards data={data} />
        </div>
      </main>
    </div>
  );
};
