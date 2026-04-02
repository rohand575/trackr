import { useEffect } from 'react';
import { subscribeToBills } from '../services/billsService';
import { useBillsStore } from '../store/useBillsStore';
import { useAuthStore } from '../store/useAuthStore';

export const useBills = () => {
  const { user } = useAuthStore();
  const { bills, filters, loading, setBills, setLoading } = useBillsStore();

  useEffect(() => {
    if (!user) {
      setBills([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToBills(user.uid, (b) => {
      setBills(b);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, setBills, setLoading]);

  return { bills, filters, loading };
};
