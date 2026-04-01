import { useEffect } from 'react';
import { subscribeToSubscriptions } from '../services/subscriptionService';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useAuthStore } from '../store/useAuthStore';

export const useSubscriptions = () => {
  const { user } = useAuthStore();
  const { subscriptions, filters, loading, setSubscriptions, setLoading } =
    useSubscriptionStore();

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToSubscriptions(user.uid, (subs) => {
      setSubscriptions(subs);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, setSubscriptions, setLoading]);

  return { subscriptions, filters, loading };
};
