import { useEffect } from 'react';
import { subscribeToDocuments } from '../services/documentsService';
import { useDocumentsStore } from '../store/useDocumentsStore';
import { useAuthStore } from '../store/useAuthStore';

export const useDocuments = () => {
  const { user } = useAuthStore();
  const { documents, loading, setDocuments, setLoading } = useDocumentsStore();

  useEffect(() => {
    if (!user) { setDocuments([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToDocuments(user.uid, (d) => { setDocuments(d); setLoading(false); });
    return unsub;
  }, [user, setDocuments, setLoading]);

  return { documents, loading };
};
