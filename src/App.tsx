import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useThemeStore } from './store/useThemeStore';
import { App as CapApp } from '@capacitor/app';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Payments } from './pages/Payments';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { GoalsHabits } from './pages/GoalsHabits';
import { DocumentVault } from './pages/DocumentVault';
import { Ideas } from './pages/Ideas';
import { Settings } from './pages/Settings';
import { Toast } from './components/Toast';
import { BiometricLock } from './components/BiometricLock';
import { QuickCapture } from './components/QuickCapture';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useAuth } from './hooks/useAuth';
import { useBiometric } from './hooks/useBiometric';
import { usePaymentsStore } from './store/usePaymentsStore';
import { useHabitsStore } from './store/useHabitsStore';
import { useAuthStore } from './store/useAuthStore';
import { useHabitReminders } from './hooks/useHabitReminders';
import {
  createRenewalChannel,
  requestNotificationPermission,
  scheduleRenewalNotifications,
} from './services/localNotifications';
import {
  createHabitCheckInChannel,
  registerHabitCheckInActions,
  scheduleHabitCheckIns,
  HABIT_DONE_ACTION_ID,
} from './services/habitCheckInService';
import { markHabitComplete } from './services/habitsService';

// ---------------------------------------------------------------------------
// Deep link handler — must live inside <BrowserRouter> to access useNavigate.
// Listens for appUrlOpen events and routes the app to the matching path.
// Supported schemes:  trackr://dashboard  trackr://bills  trackr://documents  trackr://goals-habits
// ---------------------------------------------------------------------------
const DeepLinkHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const listener = CapApp.addListener('appUrlOpen', (event) => {
      try {
        // e.g. "trackr://dashboard" → pathname = "/dashboard"
        // Use a dummy base so URL() can parse scheme-only URLs
        const url = new URL(event.url.replace('trackr://', 'https://trackr.app/'));
        const path = url.pathname;
        if (path && path !== '/') navigate(path);
      } catch {
        // Malformed URL — ignore
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [navigate]);

  return null;
};

// ---------------------------------------------------------------------------
// Notification bootstrap — request permission + create Android channel once,
// then reschedule whenever the subscription list changes.
// ---------------------------------------------------------------------------
const NotificationManager: React.FC = () => {
  const { payments } = usePaymentsStore();
  const { habits } = useHabitsStore();
  const { user } = useAuthStore();
  const subscriptions = payments.filter((p) => p.type === 'subscription');

  useEffect(() => {
    // One-time setup: create Android channels + register action types + ask for permission
    createRenewalChannel();
    createHabitCheckInChannel();
    registerHabitCheckInActions();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (subscriptions.length > 0) {
      // PaymentItem (type='subscription') has all fields scheduleRenewalNotifications needs
      scheduleRenewalNotifications(subscriptions as unknown as Parameters<typeof scheduleRenewalNotifications>[0]);
    }
  }, [subscriptions]);

  // Schedule / reschedule daily 21:30 check-ins whenever the habits list changes.
  useEffect(() => {
    scheduleHabitCheckIns(habits);
  }, [habits]);

  // Handle "Done ✓" button taps — marks the habit complete in Firestore.
  // Re-registers whenever user changes so the closure always has the current uid.
  useEffect(() => {
    const listenerPromise = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (action) => {
        if (action.actionId !== HABIT_DONE_ACTION_ID) return;
        const extra = action.notification.extra as { habitId?: string; notificationType?: string } | null;
        if (extra?.notificationType !== 'habit-checkin' || !extra?.habitId) return;
        if (!user) return;
        const today = new Date().toISOString().split('T')[0];
        try {
          await markHabitComplete(user.uid, extra.habitId, today);
        } catch (err) {
          console.warn('[NotificationManager] markHabitComplete failed:', err);
        }
      },
    );
    return () => { listenerPromise.then((l) => l.remove()); };
  }, [user]);

  // Browser/web fallback: fires when the app is open in a browser tab.
  useHabitReminders(habits);

  return null;
};

// ---------------------------------------------------------------------------
// Route guards
// ---------------------------------------------------------------------------
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullscreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------
const App: React.FC = () => {
  const biometric = useBiometric();
  const { isDark, followSystem, setFollowSystem } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Keep isDark in sync with OS preference when followSystem is enabled
  useEffect(() => {
    if (!followSystem) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setFollowSystem(true); // re-reads current system value
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [followSystem, setFollowSystem]);

  // Lock the app when it goes to the background (iOS/Android pause event)
  useEffect(() => {
    const listener = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) biometric.lock();
    });
    return () => {
      listener.then((l) => l.remove());
    };
  }, [biometric]);

  // Show biometric lock screen if the app is locked
  if (biometric.isLocked) {
    return <BiometricLock biometric={biometric} />;
  }

  return (
    <BrowserRouter>
      <Toast />
      <QuickCapture />
      <DeepLinkHandler />
      <NotificationManager />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <OverviewDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route path="/subscriptions" element={<Navigate to="/payments" replace />} />
        <Route
          path="/goals-habits"
          element={
            <ProtectedRoute>
              <GoalsHabits />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ideas"
          element={
            <ProtectedRoute>
              <Ideas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentVault />
            </ProtectedRoute>
          }
        />
        <Route path="/bills" element={<Navigate to="/payments" replace />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings biometric={biometric} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
