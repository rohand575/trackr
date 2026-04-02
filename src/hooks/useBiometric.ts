import { useState, useEffect, useCallback } from 'react';
import { NativeBiometric } from 'capacitor-native-biometric';

// Persisted via localStorage so the preference survives app restarts.
const PREF_KEY = 'trackr_biometric_enabled';

export interface BiometricState {
  /** Whether the device supports biometric auth */
  isAvailable: boolean;
  /** Whether the user has turned on biometric lock */
  isEnabled: boolean;
  /** Whether the app is currently showing the lock screen */
  isLocked: boolean;
  /** Toggle biometric lock on/off. Prompts for auth before enabling. */
  toggle: () => Promise<void>;
  /** Prompt biometric auth to unlock the app */
  unlock: () => Promise<void>;
  /** Lock the app immediately (call on App pause / background) */
  lock: () => void;
}

export const useBiometric = (): BiometricState => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Check hardware availability and load persisted preference on mount
  useEffect(() => {
    const init = async () => {
      try {
        const result = await NativeBiometric.isAvailable();
        setIsAvailable(result.isAvailable);
        if (result.isAvailable) {
          const stored = localStorage.getItem(PREF_KEY);
          const enabled = stored === 'true';
          setIsEnabled(enabled);
          // Lock immediately if enabled so the user must authenticate on launch
          if (enabled) setIsLocked(true);
        }
      } catch {
        // Running in browser or device without biometric support — stay disabled
        setIsAvailable(false);
      }
    };
    init();
  }, []);

  const unlock = useCallback(async () => {
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Unlock Trackr',
        title: 'Trackr',
        subtitle: 'Use your biometric to continue',
        negativeButtonText: 'Cancel',
      });
      setIsLocked(false);
    } catch {
      // User cancelled or auth failed — stay locked
    }
  }, []);

  const toggle = useCallback(async () => {
    if (!isAvailable) return;

    if (isEnabled) {
      // Disable: require one last auth before turning off
      try {
        await NativeBiometric.verifyIdentity({
          reason: 'Confirm to disable biometric lock',
          title: 'Disable Biometric Lock',
          negativeButtonText: 'Cancel',
        });
        localStorage.setItem(PREF_KEY, 'false');
        setIsEnabled(false);
        setIsLocked(false);
      } catch {
        // Auth cancelled — leave enabled
      }
    } else {
      // Enable: auth once to confirm biometrics work before saving preference
      try {
        await NativeBiometric.verifyIdentity({
          reason: 'Set up biometric lock for Trackr',
          title: 'Enable Biometric Lock',
          negativeButtonText: 'Cancel',
        });
        localStorage.setItem(PREF_KEY, 'true');
        setIsEnabled(true);
      } catch {
        // Auth cancelled — don't enable
      }
    }
  }, [isAvailable, isEnabled]);

  const lock = useCallback(() => {
    if (isEnabled) setIsLocked(true);
  }, [isEnabled]);

  return { isAvailable, isEnabled, isLocked, toggle, unlock, lock };
};
