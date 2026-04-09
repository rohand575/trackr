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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-10">
        {/* Welcome header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {firstName}!
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{formatHeaderDate()}</p>
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
