import { useEffect } from 'react';
import { subscribeToGoals } from '../services/goalsService';
import { useGoalsStore } from '../store/useGoalsStore';
import { useAuthStore } from '../store/useAuthStore';

export const useGoals = () => {
  const { user } = useAuthStore();
  const { goals, loading, setGoals, setLoading } = useGoalsStore();

  useEffect(() => {
    if (!user) { setGoals([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToGoals(user.uid, (g) => { setGoals(g); setLoading(false); });
    return unsub;
  }, [user, setGoals, setLoading]);

  return { goals, loading };
};
