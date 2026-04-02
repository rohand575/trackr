import React, { useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { CountryTabs } from '../components/CountryTabs';
import { BillCard } from '../components/bills/BillCard';
import { BillForm } from '../components/bills/BillForm';
import { BillSearchAndFilter } from '../components/bills/BillSearchAndFilter';
import { BillSummaryBar } from '../components/bills/BillSummaryBar';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useBills } from '../hooks/useBills';
import { useBillsStore } from '../store/useBillsStore';
import type { Bill } from '../types/bills';
import type { Country } from '../types/subscription';

export const Bills: React.FC = () => {
  const { bills, filters, loading } = useBills();
  const { resetFilters } = useBillsStore();
  const [activeCountry, setActiveCountry] = useState<Country>('India');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const handleAddClick = () => {
    setEditingBill(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (bill: Bill) => {
    setEditingBill(bill);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBill(null);
  };

  // Count by country (non-inactive)
  const countryCounts = useMemo(() => {
    const active = bills.filter((b) => b.status !== 'Inactive');
    return {
      Germany: active.filter((b) => b.country === 'Germany').length,
      India: active.filter((b) => b.country === 'India').length,
    };
  }, [bills]);

  // Filtered bills for current country
  const filteredBills = useMemo(() => {
    return bills
      .filter((b) => b.country === activeCountry)
      .filter((b) => {
        if (filters.search) {
          const q = filters.search.toLowerCase();
          return (
            b.name.toLowerCase().includes(q) ||
            b.provider.toLowerCase().includes(q) ||
            b.category.toLowerCase().includes(q) ||
            b.accountUsed.toLowerCase().includes(q) ||
            b.linkedTo.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .filter((b) => (filters.category !== 'All' ? b.category === filters.category : true))
      .filter((b) => (filters.status !== 'All' ? b.status === filters.status : true))
      .filter((b) =>
        filters.billingCycle !== 'All' ? b.billingCycle === filters.billingCycle : true
      );
  }, [bills, activeCountry, filters]);

  // All bills for the active country (for summary)
  const countryBills = useMemo(
    () => bills.filter((b) => b.country === activeCountry),
    [bills, activeCountry]
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
            <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {bills.length === 0
                ? 'No bills tracked yet'
                : `${bills.filter((b) => b.status === 'Active').length} active bills`}
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
            Add Bill
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Summary bar */}
            {countryBills.length > 0 && (
              <div className="mb-6">
                <BillSummaryBar bills={countryBills} country={activeCountry} />
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
              <BillSearchAndFilter />
            </div>

            {/* Grid */}
            {filteredBills.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} onAddClick={handleAddClick} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBills.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
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
        title="Add Bill"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Form Modal */}
      <BillForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingBill={editingBill}
      />
    </div>
  );
};
