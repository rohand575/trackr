import type { Country, Currency, BillingCycle, PaymentMethod, Category } from './subscription';

// Re-export shared primitives so consumers of this module don't need to import from subscription.ts
export type { Country, Currency, BillingCycle, PaymentMethod, Category } from './subscription';

export type PaymentItemType = 'subscription' | 'bill';
export type PaymentStatus = 'Active' | 'Paused' | 'Cancelled';

export interface PaymentItem {
  id: string;
  type: PaymentItemType;
  name: string;
  category: Category;
  country: Country;
  provider: string;
  amount: number;
  currency: Currency;
  billingCycle: BillingCycle;
  nextPaymentDate: string; // ISO date YYYY-MM-DD; bills' dueDate is mapped here
  paymentMethod: PaymentMethod;
  accountUsed: string;
  status: PaymentStatus;
  autopay?: boolean;   // bill only
  linkedTo?: string;   // bill only
  notes: string;
  createdAt: string;
  userId: string;
}

export type PaymentFormData = Omit<PaymentItem, 'id' | 'createdAt' | 'userId'>;

export interface PaymentFilters {
  search: string;
  type: 'All' | 'subscription' | 'bill';
  category: Category | 'All';
  status: PaymentStatus | 'All';
  billingCycle: BillingCycle | 'All';
}
