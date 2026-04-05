import { useEffect } from 'react';
import { subscribeToFolders } from '../services/foldersService';
import { useFoldersStore } from '../store/useFoldersStore';
import { useAuthStore } from '../store/useAuthStore';

export const useFolders = () => {
  const { user } = useAuthStore();
  const { folders, loading, setFolders, setLoading } = useFoldersStore();

  useEffect(() => {
    if (!user) { setFolders([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToFolders(user.uid, (f) => { setFolders(f); setLoading(false); });
    return unsub;
  }, [user, setFolders, setLoading]);

  return { folders, loading };
};
