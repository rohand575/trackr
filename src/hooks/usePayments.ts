import { useEffect, useRef } from 'react';
import { subscribeToSubscriptions } from '../services/subscriptionService';
import { subscribeToBills } from '../services/billsService';
import { usePaymentsStore } from '../store/usePaymentsStore';
import { useAuthStore } from '../store/useAuthStore';
import type { PaymentItem } from '../types/payment';
import type { Subscription } from '../types/subscription';
import type { Bill } from '../types/bills';

const mapSubscription = (s: Subscription): PaymentItem => ({
  id: s.id,
  type: 'subscription',
  name: s.name,
  category: s.category,
  country: s.country,
  provider: s.provider,
  amount: s.amount,
  currency: s.currency,
  billingCycle: s.billingCycle,
  nextPaymentDate: s.nextPaymentDate,
  paymentMethod: s.paymentMethod,
  accountUsed: s.accountUsed,
  status: s.status === 'Cancelled' ? 'Cancelled' : s.status === 'Paused' ? 'Paused' : 'Active',
  notes: s.notes,
  createdAt: s.createdAt,
  userId: s.userId,
});

const mapBill = (b: Bill): PaymentItem => ({
  id: b.id,
  type: 'bill',
  name: b.name,
  category: b.category,
  country: b.country,
  provider: b.provider,
  amount: b.amount,
  currency: b.currency,
  billingCycle: b.billingCycle,
  nextPaymentDate: b.dueDate ?? '',
  paymentMethod: b.paymentMethod,
  accountUsed: b.accountUsed,
  // Inactive maps to Paused in the unified model
  status: b.status === 'Inactive' ? 'Paused' : 'Active',
  autopay: b.autopay,
  linkedTo: b.linkedTo || undefined,
  notes: b.notes,
  createdAt: b.createdAt,
  userId: b.userId,
});

export const usePayments = () => {
  const { user } = useAuthStore();
  const { payments, filters, loading, setPayments, setLoading } = usePaymentsStore();

  const subsRef = useRef<Subscription[]>([]);
  const billsRef = useRef<Bill[]>([]);

  useEffect(() => {
    if (!user) {
      subsRef.current = [];
      billsRef.current = [];
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const merge = (subs: Subscription[], bills: Bill[]) => {
      const merged: PaymentItem[] = [
        ...subs.map(mapSubscription),
        ...bills.map(mapBill),
      ].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      setPayments(merged);
      setLoading(false);
    };

    const unsubSubs = subscribeToSubscriptions(user.uid, (subs) => {
      subsRef.current = subs;
      merge(subsRef.current, billsRef.current);
    });

    const unsubBills = subscribeToBills(user.uid, (bills) => {
      billsRef.current = bills;
      merge(subsRef.current, billsRef.current);
    });

    return () => {
      unsubSubs();
      unsubBills();
    };
  }, [user, setPayments, setLoading]);

  return { payments, filters, loading };
};
