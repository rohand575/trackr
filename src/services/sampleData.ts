import { addSubscription } from './subscriptionService';
import type { SubscriptionFormData } from '../types/subscription';

const sampleSubscriptions: SubscriptionFormData[] = [
  {
    name: 'Health Insurance',
    provider: 'TK (Techniker Krankenkasse)',
    category: 'Health',
    country: 'Germany',
    amount: 120,
    currency: 'EUR',
    billingCycle: 'Monthly',
    nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'Direct Debit',
    accountUsed: 'N26',
    status: 'Active',
    notes: 'Mandatory student health insurance',
  },
  {
    name: 'Deutschland Ticket',
    provider: 'Deutsche Bahn',
    category: 'Transport',
    country: 'Germany',
    amount: 49,
    currency: 'EUR',
    billingCycle: 'Monthly',
    nextPaymentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'Direct Debit',
    accountUsed: 'N26',
    status: 'Active',
    notes: 'Public transport monthly pass',
  },
  {
    name: 'Netflix',
    provider: 'Netflix Inc.',
    category: 'Entertainment',
    country: 'India',
    amount: 649,
    currency: 'INR',
    billingCycle: 'Monthly',
    nextPaymentDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'Credit Card',
    accountUsed: 'HDFC Credit Card',
    status: 'Active',
    notes: 'Standard plan',
  },
  {
    name: 'Mobile Recharge',
    provider: 'Jio',
    category: 'Communication',
    country: 'India',
    amount: 299,
    currency: 'INR',
    billingCycle: 'Monthly',
    nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'UPI',
    accountUsed: 'Google Pay',
    status: 'Active',
    notes: '2GB/day + unlimited calls',
  },
];

export const seedSampleData = async (userId: string): Promise<void> => {
  await Promise.all(sampleSubscriptions.map((sub) => addSubscription(userId, sub)));
};
