import { LocalNotifications } from '@capacitor/local-notifications';
import type { Subscription } from '../types/subscription';

// IDs 1000–1999 are reserved for renewal reminders so we can cancel/refresh
// them without touching any other notification categories added later.
const RENEWAL_ID_START = 1000;
const RENEWAL_ID_END = 1999;

// Notification channel for Android (required on Android 8+)
const CHANNEL_ID = 'renewals-v2';

/**
 * Creates the Android notification channel for renewal reminders.
 * Safe to call on iOS — the channel API is a no-op there.
 * Call once on app start (e.g. in useEffect in App.tsx).
 */
export const createRenewalChannel = async () => {
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Renewal Reminders',
      description: 'Upcoming subscription and bill renewal alerts',
      importance: 4, // HIGH
      visibility: 1, // PUBLIC
      vibration: true,
      sound: 'default',
    });
  } catch {
    // Channel creation is only needed on Android — silently ignore on web/iOS
  }
};

/**
 * Requests notification permission from the OS.
 * Returns true if granted, false otherwise.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  } catch {
    return false;
  }
};

/**
 * Schedules local notifications for subscriptions renewing in 1, 3, or 7 days.
 *
 * Safe to call repeatedly — it cancels the previous batch of renewal
 * notifications before scheduling a fresh set. Call this:
 *   - After the user logs in
 *   - Whenever the subscriptions list changes (debounce if needed)
 */
export const scheduleRenewalNotifications = async (subscriptions: Subscription[]) => {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') return;

    // Cancel existing renewal batch before rescheduling
    const { notifications: pending } = await LocalNotifications.getPending();
    const toCancel = pending
      .filter((n) => n.id >= RENEWAL_ID_START && n.id <= RENEWAL_ID_END)
      .map((n) => ({ id: n.id }));
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel });
    }

    const now = new Date();
    const NOTIFY_DAYS = [7, 3, 1]; // days-before thresholds
    const batch: Parameters<typeof LocalNotifications.schedule>[0]['notifications'] = [];
    let idCounter = RENEWAL_ID_START;

    for (const sub of subscriptions) {
      if (sub.status !== 'Active') continue;

      const paymentDate = new Date(sub.nextPaymentDate);
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysUntil = Math.ceil((paymentDate.getTime() - now.getTime()) / msPerDay);

      if (!NOTIFY_DAYS.includes(daysUntil)) continue;

      const symbol = sub.currency === 'EUR' ? '€' : sub.currency === 'INR' ? '₹' : sub.currency;
      const title =
        daysUntil === 1
          ? '⚠️ Subscription due tomorrow'
          : `📅 Subscription renewing in ${daysUntil} days`;
      const body = `${sub.name} — ${symbol}${sub.amount} (${sub.billingCycle})`;

      // Schedule for 9 AM on the notification day
      const scheduleAt = new Date(paymentDate);
      scheduleAt.setDate(paymentDate.getDate() - daysUntil);
      scheduleAt.setHours(9, 0, 0, 0);

      // Only schedule if that moment is still in the future
      if (scheduleAt > now) {
        batch.push({
          id: idCounter++,
          title,
          body,
          sound: 'default',
          channelId: CHANNEL_ID,
          schedule: { at: scheduleAt },
          // Extra data available if the app handles notification tap events
          extra: { subscriptionId: sub.id, route: '/dashboard' },
        });
      }

      if (idCounter > RENEWAL_ID_END) break; // guard against overflow
    }

    if (batch.length > 0) {
      await LocalNotifications.schedule({ notifications: batch });
    }
  } catch (err) {
    // Local notifications not available (web browser, simulator without support)
    console.warn('[localNotifications] scheduleRenewalNotifications failed:', err);
  }
};
