import { useEffect } from 'react';
import { subscribeToHabits } from '../services/habitsService';
import { useHabitsStore } from '../store/useHabitsStore';
import { useAuthStore } from '../store/useAuthStore';
import { syncHabitsToWidget } from '../services/widgetSyncService';

export const useHabits = () => {
  const { user } = useAuthStore();
  const { habits, loading, setHabits, setLoading } = useHabitsStore();

  useEffect(() => {
    if (!user) { setHabits([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToHabits(user.uid, (h) => { setHabits(h); setLoading(false); syncHabitsToWidget(h); });
    return unsub;
  }, [user, setHabits, setLoading]);

  return { habits, loading };
};
