export type Country = 'Germany' | 'India';
export type Currency = 'EUR' | 'INR' | 'USD' | 'GBP';
export type BillingCycle = 'Monthly' | 'Yearly' | 'Quarterly' | 'Weekly';
export type PaymentMethod = 'Bank Transfer' | 'Direct Debit' | 'Credit Card' | 'UPI' | 'Google Pay' | 'PhonePe' | 'Auto Debit' | 'Cash' | 'Other';
export type SubscriptionStatus = 'Active' | 'Paused' | 'Cancelled';

export type Category =
  | 'Health'
  | 'Transport'
  | 'Entertainment'
  | 'Utilities'
  | 'Insurance'
  | 'Education'
  | 'Finance'
  | 'Food'
  | 'Shopping'
  | 'Technology'
  | 'Communication'
  | 'Other';

export interface Subscription {
  id: string;
  name: string;
  category: Category;
  country: Country;
  provider: string;
  amount: number;
  currency: Currency;
  billingCycle: BillingCycle;
  nextPaymentDate: string; // ISO date string YYYY-MM-DD
  paymentMethod: PaymentMethod;
  accountUsed: string;
  status: SubscriptionStatus;
  notes: string;
  createdAt: string; // ISO timestamp
  userId: string;
}

export type SubscriptionFormData = Omit<Subscription, 'id' | 'createdAt' | 'userId'>;

export interface SubscriptionFilters {
  search: string;
  category: Category | 'All';
  status: SubscriptionStatus | 'All';
  billingCycle: BillingCycle | 'All';
}
