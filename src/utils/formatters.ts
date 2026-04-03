import type { Currency, BillingCycle } from '../types/subscription';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const localeMap: Record<Currency, string> = {
    EUR: 'de-DE',
    INR: 'en-IN',
    USD: 'en-US',
    GBP: 'en-GB',
  };
  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'INR' ? 0 : 2,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr; // non-ISO value (e.g. "15th of every month") — show as-is
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const getDaysUntilPayment = (dateStr: string): number => {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const paymentDate = new Date(dateStr + 'T00:00:00');
  if (isNaN(paymentDate.getTime())) return Infinity; // non-ISO value — treat as no upcoming date
  paymentDate.setHours(0, 0, 0, 0);
  const diff = paymentDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getYearlyAmount = (amount: number, billingCycle: BillingCycle): number => {
  const multiplier: Record<BillingCycle, number> = {
    Monthly: 12,
    Yearly: 1,
    Quarterly: 4,
    Weekly: 52,
  };
  return amount * multiplier[billingCycle];
};

export const getMonthlyAmount = (amount: number, billingCycle: BillingCycle): number => {
  const divisor: Record<BillingCycle, number> = {
    Monthly: 1,
    Yearly: 12,
    Quarterly: 3,
    Weekly: 0.25,
  };
  return amount / divisor[billingCycle];
};
