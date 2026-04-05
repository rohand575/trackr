import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { logoutUser } from '../services/authService';
import { usePaymentsStore } from '../store/usePaymentsStore';
import { useDocumentsStore } from '../store/useDocumentsStore';
import { generateIcsContent, downloadIcsFile } from '../utils/icsExport';
import type { BiometricState } from '../hooks/useBiometric';

interface SettingsProps {
  biometric: BiometricState;
}

export const Settings: React.FC<SettingsProps> = ({ biometric }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { payments } = usePaymentsStore();
  const { documents } = useDocumentsStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const emailInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  const handleBiometricToggle = async () => {
    setIsToggling(true);
    try {
      await biometric.toggle();
    } finally {
      setIsToggling(false);
    }
  };

  const handleExportCalendar = async () => {
    setIsExporting(true);
    try {
      const subs = payments.filter((p) => p.type === 'subscription');
      const bills = payments
        .filter((p) => p.type === 'bill')
        .map((p) => ({ ...p, dueDate: p.nextPaymentDate }));
      const content = generateIcsContent(
        subs as Parameters<typeof generateIcsContent>[0],
        bills as Parameters<typeof generateIcsContent>[1],
        documents,
      );
      downloadIcsFile(content);
      addToast('Calendar exported successfully', 'success');
    } catch {
      addToast('Failed to export calendar', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      addToast('Logged out successfully', 'success');
    } catch {
      addToast('Failed to log out', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your preferences</p>
        </div>

        {/* Security section */}
        {biometric.isAvailable && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-800">
              <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Security</h2>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 3H5a2 2 0 00-2 2v2m14-4h2a2 2 0 012 2v2M7 21H5a2 2 0 01-2-2v-2m14 4h2a2 2 0 002-2v-2M9 9h.01M15 9h.01M9 15c.667.667 1.333 1 2 1 .667 0 1.333-.333 2-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Biometric Lock</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Require biometrics on app launch</p>
                </div>
              </div>
              <button
                onClick={handleBiometricToggle}
                disabled={isToggling}
                role="switch"
                aria-checked={biometric.isEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60 ${
                  biometric.isEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    biometric.isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Export section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Export</h2>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Export to Calendar (.ics)</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Download upcoming payments and document expirations</p>
              </div>
            </div>
            <button
              onClick={handleExportCalendar}
              disabled={isExporting}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Account section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Account</h2>
          </div>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-white">{emailInitial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Signed in</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-5 py-4 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </main>
    </div>
  );
};
