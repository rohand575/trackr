import React, { useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { CountryTabs } from '../components/CountryTabs';
import { PaymentCard } from '../components/PaymentCard';
import { PaymentForm } from '../components/PaymentForm';
import { PaymentSearchFilter } from '../components/PaymentSearchFilter';
import { PaymentSummaryBar } from '../components/PaymentSummaryBar';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { usePayments } from '../hooks/usePayments';
import { usePaymentsStore } from '../store/usePaymentsStore';
import type { PaymentItem, Country } from '../types/payment';

export const Payments: React.FC = () => {
  const { payments, filters, loading } = usePayments();
  const { resetFilters } = usePaymentsStore();

  const [country, setCountry] = useState<Country>('Germany');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentItem | null>(null);

  const handleAdd = () => { setEditingItem(null); setFormOpen(true); };
  const handleEdit = (item: PaymentItem) => { setEditingItem(item); setFormOpen(true); };
  const handleClose = () => { setFormOpen(false); setEditingItem(null); };

  const countryCounts = useMemo(() => {
    const active = payments.filter((p) => p.status !== 'Cancelled');
    return {
      Germany: active.filter((p) => p.country === 'Germany').length,
      India: active.filter((p) => p.country === 'India').length,
    };
  }, [payments]);

  const countryPayments = useMemo(
    () => payments.filter((p) => p.country === country),
    [payments, country]
  );

  const filtered = useMemo(() => {
    return countryPayments
      .filter((p) => {
        if (filters.search) {
          const q = filters.search.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.provider.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.accountUsed.toLowerCase().includes(q) ||
            (p.linkedTo ?? '').toLowerCase().includes(q)
          );
        }
        return true;
      })
      .filter((p) => (filters.type !== 'All' ? p.type === filters.type : true))
      .filter((p) => (filters.category !== 'All' ? p.category === filters.category : true))
      .filter((p) => (filters.status !== 'All' ? p.status === filters.status : true))
      .filter((p) => (filters.billingCycle !== 'All' ? p.billingCycle === filters.billingCycle : true));
  }, [countryPayments, filters]);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.type !== 'All' ||
    filters.category !== 'All' ||
    filters.status !== 'All' ||
    filters.billingCycle !== 'All';

  const activeCount = payments.filter((p) => p.status === 'Active').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {payments.length === 0 ? 'No payments tracked yet' : `${activeCount} active payment${activeCount !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all duration-200 shadow-sm shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Payment
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {countryPayments.length > 0 && (
              <div className="mb-6">
                <PaymentSummaryBar items={countryPayments} country={country} />
              </div>
            )}

            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <CountryTabs
                activeCountry={country}
                onChange={(c) => { setCountry(c); resetFilters(); }}
                counts={countryCounts}
              />
            </div>

            <div className="mb-5">
              <PaymentSearchFilter />
            </div>

            {filtered.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} onAddClick={handleAdd} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((item) => (
                  <PaymentCard key={item.id} item={item} onEdit={handleEdit} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile FAB */}
      <button
        onClick={handleAdd}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center transition-all duration-200 z-20"
        title="Add Payment"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <PaymentForm
        isOpen={formOpen}
        onClose={handleClose}
        editingItem={editingItem}
      />
    </div>
  );
};
