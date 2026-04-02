import React from 'react';
import type { BiometricState } from '../hooks/useBiometric';

interface BiometricLockProps {
  biometric: BiometricState;
}

/**
 * Full-screen lock overlay shown when biometric lock is enabled and the app
 * needs re-authentication (launch or resume from background).
 *
 * Rendered by App.tsx when biometric.isLocked === true.
 */
export const BiometricLock: React.FC<BiometricLockProps> = ({ biometric }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 px-8">
      {/* App icon / logo area */}
      <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-900">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Trackr</h1>
      <p className="text-gray-400 text-sm mb-10 text-center">
        Authenticate to access your subscriptions
      </p>

      {/* Biometric unlock button */}
      <button
        onClick={biometric.unlock}
        className="flex flex-col items-center gap-3 group"
        aria-label="Unlock with biometrics"
      >
        <div className="w-16 h-16 rounded-full border-2 border-indigo-400 group-active:border-indigo-300 flex items-center justify-center transition-colors">
          {/* Face ID icon */}
          <svg className="w-8 h-8 text-indigo-400 group-active:text-indigo-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 3H5a2 2 0 00-2 2v2m14-4h2a2 2 0 012 2v2M7 21H5a2 2 0 01-2-2v-2m14 4h2a2 2 0 002-2v-2M9 9h.01M15 9h.01M9 15c.667.667 1.333 1 2 1 .667 0 1.333-.333 2-1" />
          </svg>
        </div>
        <span className="text-indigo-400 text-sm font-medium">Tap to unlock</span>
      </button>
    </div>
  );
};
