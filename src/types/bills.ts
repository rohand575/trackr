import type { Country, Currency, BillingCycle, PaymentMethod, Category } from './subscription';

export type BillStatus = 'Active' | 'Inactive';

export interface Bill {
  id: string;
  name: string;
  category: Category;
  country: Country;
  provider: string;
  amount: number;
  currency: Currency;
  billingCycle: BillingCycle;
  dueDate: string; // ISO date string YYYY-MM-DD
  paymentMethod: PaymentMethod;
  accountUsed: string;
  autopay: boolean;
  linkedTo: string; // e.g. "House 1 - Bangalore"
  status: BillStatus;
  notes: string;
  createdAt: string; // ISO timestamp
  userId: string;
}

export type BillFormData = Omit<Bill, 'id' | 'createdAt' | 'userId'>;

export interface BillFilters {
  search: string;
  category: Category | 'All';
  status: BillStatus | 'All';
  billingCycle: BillingCycle | 'All';
}
