import { LocalNotifications } from '@capacitor/local-notifications';
import type { Habit } from '../types/habits';

// IDs 2000–2999 reserved for habit check-in notifications.
const CHECKIN_ID_START = 2000;
const CHECKIN_ID_END = 2999;

export const HABIT_CHECKIN_CHANNEL_ID = 'habit-checkins-v2';
export const HABIT_CHECKIN_ACTION_TYPE = 'HABIT_CHECKIN';
export const HABIT_DONE_ACTION_ID = 'DONE';

/**
 * Creates the Android notification channel for habit check-ins.
 * No-op on iOS. Call once on app start.
 */
export const createHabitCheckInChannel = async () => {
  try {
    await LocalNotifications.createChannel({
      id: HABIT_CHECKIN_CHANNEL_ID,
      name: 'Habit Check-ins',
      description: 'Daily reminders to log your habits',
      importance: 4, // HIGH
      visibility: 1, // PUBLIC
      vibration: true,
      sound: 'default',
    });
  } catch { /* no-op on iOS / web */ }
};

/**
 * Registers the HABIT_CHECKIN notification action type with a "Done ✓" button.
 * On Android the button shows directly on the notification.
 * On iOS it appears when long-pressing the notification.
 * Call once on app start, after createHabitCheckInChannel.
 */
export const registerHabitCheckInActions = async () => {
  try {
    await LocalNotifications.registerActionTypes({
      types: [{
        id: HABIT_CHECKIN_ACTION_TYPE,
        actions: [{ id: HABIT_DONE_ACTION_ID, title: 'Done ✓' }],
      }],
    });
  } catch { /* no-op on web */ }
};

/**
 * Cancels the current check-in batch and reschedules one daily repeating
 * notification at 21:30 for every active habit.
 *
 * Safe to call repeatedly — always cancels IDs 2000–2999 first.
 * Call whenever the habits list changes.
 */
export const scheduleHabitCheckIns = async (habits: Habit[]) => {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') return;

    // Cancel previous check-in batch
    const { notifications: pending } = await LocalNotifications.getPending();
    const toCancel = pending
      .filter((n) => n.id >= CHECKIN_ID_START && n.id <= CHECKIN_ID_END)
      .map((n) => ({ id: n.id }));
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel });
    }

    // Only schedule habits that have a reminder time set.
    const activeHabits = habits.filter((h) => !h.isArchived && !!h.reminderTime);
    if (activeHabits.length === 0) return;

    const now = new Date();

    const batch = activeHabits.slice(0, CHECKIN_ID_END - CHECKIN_ID_START + 1).map((habit, index) => {
      const [hour, minute] = habit.reminderTime!.split(':').map(Number);
      const fireTime = new Date();
      fireTime.setHours(hour, minute, 0, 0);
      // If that time has already passed today, start from tomorrow.
      if (fireTime <= now) fireTime.setDate(fireTime.getDate() + 1);

      return {
        id: CHECKIN_ID_START + index,
        title: `${habit.icon} ${habit.name}`,
        body: 'Did you complete this today?',
        sound: 'default',
        channelId: HABIT_CHECKIN_CHANNEL_ID,
        actionTypeId: HABIT_CHECKIN_ACTION_TYPE,
        schedule: {
          at: fireTime,
          repeats: true,
          every: 'day' as const,
        },
        extra: { habitId: habit.id, notificationType: 'habit-checkin' },
      };
    });

    await LocalNotifications.schedule({ notifications: batch });
  } catch (err) {
    console.warn('[habitCheckInService] scheduleHabitCheckIns failed:', err);
  }
};
