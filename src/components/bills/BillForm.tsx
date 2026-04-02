import React, { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Bill, BillFormData } from '../../types/bills';
import { addBill, updateBill } from '../../services/billsService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  provider: z.string().min(1, 'Provider is required').max(100),
  category: z.enum(['Health', 'Transport', 'Entertainment', 'Utilities', 'Insurance', 'Education', 'Finance', 'Food', 'Shopping', 'Technology', 'Communication', 'Other']),
  country: z.enum(['Germany', 'India']),
  amount: z.number().min(0, 'Amount must be 0 or greater'),
  currency: z.enum(['EUR', 'INR', 'USD', 'GBP']),
  billingCycle: z.enum(['Monthly', 'Yearly', 'Quarterly', 'Weekly']),
  dueDate: z.string().max(100),
  paymentMethod: z.enum(['Bank Transfer', 'Direct Debit', 'Credit Card', 'UPI', 'Google Pay', 'PhonePe', 'Auto Debit', 'Cash', 'Other']),
  accountUsed: z.string().min(1, 'Account is required').max(100),
  autopay: z.boolean(),
  linkedTo: z.string().max(200),
  status: z.enum(['Active', 'Inactive']),
  notes: z.string().max(500),
});

type FormValues = z.infer<typeof schema>;

interface BillFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingBill?: Bill | null;
}

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors';

const selectClass =
  'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors appearance-none cursor-pointer';

export const BillForm: React.FC<BillFormProps> = ({
  isOpen,
  onClose,
  editingBill,
}) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: '',
      provider: '',
      category: 'Utilities',
      country: 'India',
      amount: 0,
      currency: 'INR',
      billingCycle: 'Monthly',
      dueDate: '',
      paymentMethod: 'Google Pay',
      accountUsed: '',
      autopay: false,
      linkedTo: '',
      status: 'Active',
      notes: '',
    },
  });

  useEffect(() => {
    if (editingBill) {
      reset({
        name: editingBill.name,
        provider: editingBill.provider,
        category: editingBill.category,
        country: editingBill.country,
        amount: editingBill.amount,
        currency: editingBill.currency,
        billingCycle: editingBill.billingCycle,
        dueDate: editingBill.dueDate ?? '',
        paymentMethod: editingBill.paymentMethod,
        accountUsed: editingBill.accountUsed,
        autopay: editingBill.autopay ?? false,
        linkedTo: editingBill.linkedTo ?? '',
        status: editingBill.status,
        notes: editingBill.notes ?? '',
      });
    } else {
      reset({
        name: '',
        provider: '',
        category: 'Utilities',
        country: 'India',
        amount: 0,
        currency: 'INR',
        billingCycle: 'Monthly',
        dueDate: '',
        paymentMethod: 'Google Pay',
        accountUsed: '',
        autopay: false,
        linkedTo: '',
        status: 'Active',
        notes: '',
      });
    }
  }, [editingBill, reset, isOpen]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    try {
      const formData: BillFormData = { ...data };
      if (editingBill) {
        await updateBill(user.uid, editingBill.id, formData);
        addToast('Bill updated successfully', 'success');
      } else {
        await addBill(user.uid, formData);
        addToast('Bill added successfully', 'success');
      }
      onClose();
    } catch {
      addToast('Something went wrong. Please try again.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center px-4 py-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-scale-in mt-4 mb-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {editingBill ? 'Edit Bill' : 'Add Bill'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {editingBill ? 'Update the details below' : 'Record a new bill to keep track of'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <FormField label="Bill Name" error={errors.name?.message} required>
              <input
                {...register('name')}
                placeholder="e.g. Electricity, Property Tax"
                className={inputClass}
              />
            </FormField>

            <FormField label="Provider" error={errors.provider?.message} required>
              <input
                {...register('provider')}
                placeholder="e.g. BESCOM, BBMP, LIC"
                className={inputClass}
              />
            </FormField>

            <FormField label="Category" error={errors.category?.message} required>
              <div className="relative">
                <select {...register('category')} className={selectClass}>
                  {['Health', 'Transport', 'Entertainment', 'Utilities', 'Insurance', 'Education', 'Finance', 'Food', 'Shopping', 'Technology', 'Communication', 'Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormField>

            <FormField label="Country" error={errors.country?.message} required>
              <div className="relative">
                <select {...register('country')} className={selectClass}>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="India">🇮🇳 India</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormField>

            <FormField label="Usual Amount" error={errors.amount?.message} required>
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={inputClass}
              />
            </FormField>

            <FormField label="Currency" error={errors.currency?.message} required>
              <div className="relative">
                <select {...register('currency')} className={selectClass}>
                  <option value="EUR">EUR — Euro</option>
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormField>

            <FormField label="Billing Cycle" error={errors.billingCycle?.message} required>
              <div className="relative">
                <select {...register('billingCycle')} className={selectClass}>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Weekly">Weekly</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormField>

            <FormField label="Due Date" error={errors.dueDate?.message}>
              <input
                {...register('dueDate')}
                placeholder="e.g. 15th of every month"
                className={inputClass}
              />
            </FormField>

            <FormField label="Payment Method" error={errors.paymentMethod?.message} required>
              <div className="relative">
                <select {...register('paymentMethod')} className={selectClass}>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Direct Debit">Direct Debit</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Auto Debit">Auto Debit</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormField>

            <FormField label="Account Used" error={errors.accountUsed?.message} required>
              <input
                {...register('accountUsed')}
                placeholder="e.g. HDFC Savings, SBI Credit Card"
                className={inputClass}
              />
            </FormField>

            <FormField label="Linked To" error={errors.linkedTo?.message}>
              <input
                {...register('linkedTo')}
                placeholder="e.g. House 1 - Bangalore"
                className={inputClass}
              />
            </FormField>

            <FormField label="Status" error={errors.status?.message} required>
              <div className="relative">
                <select {...register('status')} className={selectClass}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormField>

            {/* Autopay toggle - full width */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    {...register('autopay')}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-indigo-600 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Autopay enabled</span>
                  <p className="text-xs text-gray-400">This bill is automatically paid</p>
                </div>
              </label>
            </div>

            <FormField label="Notes" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                placeholder="Optional notes about this bill..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </FormField>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {editingBill ? 'Save Changes' : 'Add Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
