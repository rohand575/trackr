import { useEffect } from 'react';
import { subscribeToIdeas } from '../services/ideasService';
import { useIdeasStore } from '../store/useIdeasStore';
import { useAuthStore } from '../store/useAuthStore';

export const useIdeas = () => {
  const { user } = useAuthStore();
  const { ideas, loading, setIdeas, setLoading } = useIdeasStore();

  useEffect(() => {
    if (!user) { setIdeas([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToIdeas(user.uid, (i) => { setIdeas(i); setLoading(false); });
    return unsub;
  }, [user, setIdeas, setLoading]);

  return { ideas, loading };
};
