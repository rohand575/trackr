import React, { useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { CountryTabs } from '../components/CountryTabs';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { SubscriptionForm } from '../components/SubscriptionForm';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { SummaryBar } from '../components/SummaryBar';
import { BillCard } from '../components/bills/BillCard';
import { BillForm } from '../components/bills/BillForm';
import { BillSearchAndFilter } from '../components/bills/BillSearchAndFilter';
import { BillSummaryBar } from '../components/bills/BillSummaryBar';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useBills } from '../hooks/useBills';
import { useBillsStore } from '../store/useBillsStore';
import type { Subscription, Country } from '../types/subscription';
import type { Bill } from '../types/bills';

type Tab = 'subscriptions' | 'bills';

export const Payments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('subscriptions');

  // --- Subscriptions state ---
  const { subscriptions, filters: subFilters, loading: subLoading } = useSubscriptions();
  const { resetFilters: resetSubFilters } = useSubscriptionStore();
  const [subCountry, setSubCountry] = useState<Country>('Germany');
  const [subFormOpen, setSubFormOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const handleAddSub = () => { setEditingSub(null); setSubFormOpen(true); };
  const handleEditSub = (s: Subscription) => { setEditingSub(s); setSubFormOpen(true); };
  const handleCloseSub = () => { setSubFormOpen(false); setEditingSub(null); };

  const subCountryCounts = useMemo(() => {
    const active = subscriptions.filter((s) => s.status !== 'Cancelled');
    return {
      Germany: active.filter((s) => s.country === 'Germany').length,
      India: active.filter((s) => s.country === 'India').length,
    };
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((s) => s.country === subCountry)
      .filter((s) => {
        if (subFilters.search) {
          const q = subFilters.search.toLowerCase();
          return (
            s.name.toLowerCase().includes(q) ||
            s.provider.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q) ||
            s.accountUsed.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .filter((s) => (subFilters.category !== 'All' ? s.category === subFilters.category : true))
      .filter((s) => (subFilters.status !== 'All' ? s.status === subFilters.status : true))
      .filter((s) => (subFilters.billingCycle !== 'All' ? s.billingCycle === subFilters.billingCycle : true));
  }, [subscriptions, subCountry, subFilters]);

  const countrySubscriptions = useMemo(
    () => subscriptions.filter((s) => s.country === subCountry),
    [subscriptions, subCountry]
  );

  const hasActiveSubFilters =
    subFilters.search !== '' ||
    subFilters.category !== 'All' ||
    subFilters.status !== 'All' ||
    subFilters.billingCycle !== 'All';

  // --- Bills state ---
  const { bills, filters: billFilters, loading: billLoading } = useBills();
  const { resetFilters: resetBillFilters } = useBillsStore();
  const [billCountry, setBillCountry] = useState<Country>('India');
  const [billFormOpen, setBillFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const handleAddBill = () => { setEditingBill(null); setBillFormOpen(true); };
  const handleEditBill = (b: Bill) => { setEditingBill(b); setBillFormOpen(true); };
  const handleCloseBill = () => { setBillFormOpen(false); setEditingBill(null); };

  const billCountryCounts = useMemo(() => {
    const active = bills.filter((b) => b.status !== 'Inactive');
    return {
      Germany: active.filter((b) => b.country === 'Germany').length,
      India: active.filter((b) => b.country === 'India').length,
    };
  }, [bills]);

  const filteredBills = useMemo(() => {
    return bills
      .filter((b) => b.country === billCountry)
      .filter((b) => {
        if (billFilters.search) {
          const q = billFilters.search.toLowerCase();
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
      .filter((b) => (billFilters.category !== 'All' ? b.category === billFilters.category : true))
      .filter((b) => (billFilters.status !== 'All' ? b.status === billFilters.status : true))
      .filter((b) => (billFilters.billingCycle !== 'All' ? b.billingCycle === billFilters.billingCycle : true));
  }, [bills, billCountry, billFilters]);

  const countryBills = useMemo(
    () => bills.filter((b) => b.country === billCountry),
    [bills, billCountry]
  );

  const hasActiveBillFilters =
    billFilters.search !== '' ||
    billFilters.category !== 'All' ||
    billFilters.status !== 'All' ||
    billFilters.billingCycle !== 'All';

  const isSubscriptions = activeTab === 'subscriptions';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {subscriptions.filter((s) => s.status === 'Active').length} subscriptions &middot;{' '}
              {bills.filter((b) => b.status === 'Active').length} bills
            </p>
          </div>
          {/* Desktop add button */}
          <button
            onClick={isSubscriptions ? handleAddSub : handleAddBill}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all duration-200 shadow-sm shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add {isSubscriptions ? 'Subscription' : 'Bill'}
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isSubscriptions
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              !isSubscriptions
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bills
          </button>
        </div>

        {/* Subscriptions tab */}
        {isSubscriptions && (
          subLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {countrySubscriptions.length > 0 && (
                <div className="mb-6">
                  <SummaryBar subscriptions={countrySubscriptions} country={subCountry} />
                </div>
              )}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <CountryTabs
                  activeCountry={subCountry}
                  onChange={(c) => { setSubCountry(c); resetSubFilters(); }}
                  counts={subCountryCounts}
                />
              </div>
              <div className="mb-5">
                <SearchAndFilter />
              </div>
              {filteredSubscriptions.length === 0 ? (
                <EmptyState hasFilters={hasActiveSubFilters} onAddClick={handleAddSub} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredSubscriptions.map((sub) => (
                    <SubscriptionCard key={sub.id} subscription={sub} onEdit={handleEditSub} />
                  ))}
                </div>
              )}
            </>
          )
        )}

        {/* Bills tab */}
        {!isSubscriptions && (
          billLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {countryBills.length > 0 && (
                <div className="mb-6">
                  <BillSummaryBar bills={countryBills} country={billCountry} />
                </div>
              )}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <CountryTabs
                  activeCountry={billCountry}
                  onChange={(c) => { setBillCountry(c); resetBillFilters(); }}
                  counts={billCountryCounts}
                />
              </div>
              <div className="mb-5">
                <BillSearchAndFilter />
              </div>
              {filteredBills.length === 0 ? (
                <EmptyState hasFilters={hasActiveBillFilters} onAddClick={handleAddBill} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredBills.map((bill) => (
                    <BillCard key={bill.id} bill={bill} onEdit={handleEditBill} />
                  ))}
                </div>
              )}
            </>
          )
        )}
      </main>

      {/* Mobile FAB */}
      <button
        onClick={isSubscriptions ? handleAddSub : handleAddBill}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center transition-all duration-200 z-20"
        title={isSubscriptions ? 'Add Subscription' : 'Add Bill'}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Form Modals */}
      <SubscriptionForm
        isOpen={subFormOpen}
        onClose={handleCloseSub}
        editingSubscription={editingSub}
      />
      <BillForm
        isOpen={billFormOpen}
        onClose={handleCloseBill}
        editingBill={editingBill}
      />
    </div>
  );
};
