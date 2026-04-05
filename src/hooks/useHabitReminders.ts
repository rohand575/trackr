import { useEffect } from 'react';
import type { Habit } from '../types/habits';

/**
 * Fires browser notifications for habits that have a reminderTime set
 * and haven't been completed yet today.
 * Aligns to the next minute boundary for precision.
 */
export const useHabitReminders = (habits: Habit[]) => {
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'denied') return;

    // Request permission once (no-op if already granted)
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];

      habits
        .filter((h) => !h.isArchived && h.reminderTime === currentTime)
        .filter((h) => !h.completions.includes(today))
        .forEach((h) => {
          new Notification(`${h.icon} ${h.name}`, {
            body: h.description || `Time to ${h.name}! Keep your streak going.`,
            icon: '/pwa-192x192.png',
            tag: `habit-reminder-${h.id}`, // deduplicates if fired twice
          });
        });
    };

    // Align to the next full minute so checks fire at :00 seconds
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      checkReminders();
      interval = setInterval(checkReminders, 60_000);
    }, msToNextMinute);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [habits]);
};
