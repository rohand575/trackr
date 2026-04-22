import { useState, useEffect } from 'react';
import { subscribeToProgressLogs } from '../services/progressLogService';
import { useAuthStore } from '../store/useAuthStore';
import type { ProgressLog } from '../types/progressLog';

export const useProgressLogs = (goalId: string | undefined) => {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !goalId) { setLogs([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToProgressLogs(user.uid, goalId, (l) => {
      setLogs(l);
      setLoading(false);
    });
    return unsub;
  }, [user, goalId]);

  return { logs, loading };
};
