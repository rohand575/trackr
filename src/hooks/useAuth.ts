import { useEffect } from 'react';
import { subscribeToAuthChanges } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Fallback: if onAuthStateChanged never fires (e.g. IndexedDB unavailable),
    // force loading off after 8 s so the user reaches the login screen.
    const timeout = setTimeout(() => setLoading(false), 8000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [setUser, setLoading]);

  return { user, loading };
};
