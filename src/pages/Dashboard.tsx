import React, { useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { CountryTabs } from '../components/CountryTabs';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { SubscriptionForm } from '../components/SubscriptionForm';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { SummaryBar } from '../components/SummaryBar';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import type { Subscription, Country } from '../types/subscription';

export const Dashboard: React.FC = () => {
  const { subscriptions, filters, loading } = useSubscriptions();
  const { resetFilters } = useSubscriptionStore();
  const [activeCountry, setActiveCountry] = useState<Country>('Germany');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const handleAddClick = () => {
    setEditingSubscription(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSubscription(null);
  };

  // Count by country (unfiltered)
  const countryCounts = useMemo(() => {
    const active = subscriptions.filter((s) => s.status !== 'Cancelled');
    return {
      Germany: active.filter((s) => s.country === 'Germany').length,
      India: active.filter((s) => s.country === 'India').length,
    };
  }, [subscriptions]);

  // Filtered subscriptions for current country
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((s) => s.country === activeCountry)
      .filter((s) => {
        if (filters.search) {
          const q = filters.search.toLowerCase();
          return (
            s.name.toLowerCase().includes(q) ||
            s.provider.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q) ||
            s.accountUsed.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .filter((s) => (filters.category !== 'All' ? s.category === filters.category : true))
      .filter((s) => (filters.status !== 'All' ? s.status === filters.status : true))
      .filter((s) =>
        filters.billingCycle !== 'All' ? s.billingCycle === filters.billingCycle : true
      );
  }, [subscriptions, activeCountry, filters]);

  // All subscriptions for the active country (for summary)
  const countrySubscriptions = useMemo(
    () => subscriptions.filter((s) => s.country === activeCountry),
    [subscriptions, activeCountry]
  );

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'All' ||
    filters.status !== 'All' ||
    filters.billingCycle !== 'All';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {subscriptions.length === 0
                ? 'No subscriptions yet'
                : `${subscriptions.filter((s) => s.status === 'Active').length} active subscriptions`}
            </p>
          </div>
          {/* Desktop add button */}
          <button
            onClick={handleAddClick}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all duration-200 shadow-sm shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Subscription
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Summary bar */}
            {countrySubscriptions.length > 0 && (
              <div className="mb-6">
                <SummaryBar subscriptions={countrySubscriptions} country={activeCountry} />
              </div>
            )}

            {/* Country Tabs */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <CountryTabs
                activeCountry={activeCountry}
                onChange={(c) => {
                  setActiveCountry(c);
                  resetFilters();
                }}
                counts={countryCounts}
              />
            </div>

            {/* Search & Filter */}
            <div className="mb-5">
              <SearchAndFilter />
            </div>

            {/* Grid */}
            {filteredSubscriptions.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} onAddClick={handleAddClick} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSubscriptions.map((sub) => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile FAB */}
      <button
        onClick={handleAddClick}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center transition-all duration-200 z-20"
        title="Add Subscription"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Form Modal */}
      <SubscriptionForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingSubscription={editingSubscription}
      />
    </div>
  );
};
