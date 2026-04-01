import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Subscription, SubscriptionFormData } from '../types/subscription';

const getUserSubscriptionsRef = (userId: string) =>
  collection(db, 'users', userId, 'subscriptions');

const docToSubscription = (id: string, data: Record<string, unknown>): Subscription => ({
  id,
  name: data.name as string,
  category: data.category as Subscription['category'],
  country: data.country as Subscription['country'],
  provider: data.provider as string,
  amount: data.amount as number,
  currency: data.currency as Subscription['currency'],
  billingCycle: data.billingCycle as Subscription['billingCycle'],
  nextPaymentDate: data.nextPaymentDate as string,
  paymentMethod: data.paymentMethod as Subscription['paymentMethod'],
  accountUsed: data.accountUsed as string,
  status: data.status as Subscription['status'],
  notes: (data.notes as string) ?? '',
  createdAt:
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string) ?? new Date().toISOString(),
  userId: data.userId as string,
});

export const addSubscription = async (
  userId: string,
  formData: SubscriptionFormData
): Promise<string> => {
  const ref = getUserSubscriptionsRef(userId);
  const docRef = await addDoc(ref, {
    ...formData,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateSubscription = async (
  userId: string,
  subscriptionId: string,
  formData: Partial<SubscriptionFormData>
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'subscriptions', subscriptionId);
  await updateDoc(docRef, { ...formData });
};

export const deleteSubscription = async (
  userId: string,
  subscriptionId: string
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'subscriptions', subscriptionId);
  await deleteDoc(docRef);
};

export const getSubscriptions = async (userId: string): Promise<Subscription[]> => {
  const ref = getUserSubscriptionsRef(userId);
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToSubscription(d.id, d.data() as Record<string, unknown>));
};

export const subscribeToSubscriptions = (
  userId: string,
  callback: (subscriptions: Subscription[]) => void
): Unsubscribe => {
  const ref = getUserSubscriptionsRef(userId);
  const q = query(ref, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const subs = snapshot.docs.map((d) =>
      docToSubscription(d.id, d.data() as Record<string, unknown>)
    );
    callback(subs);
  });
};
