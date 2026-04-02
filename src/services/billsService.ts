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
import type { Bill, BillFormData } from '../types/bills';

const getUserBillsRef = (userId: string) =>
  collection(db, 'users', userId, 'bills');

const docToBill = (id: string, data: Record<string, unknown>): Bill => ({
  id,
  name: data.name as string,
  category: data.category as Bill['category'],
  country: data.country as Bill['country'],
  provider: data.provider as string,
  amount: data.amount as number,
  currency: data.currency as Bill['currency'],
  billingCycle: data.billingCycle as Bill['billingCycle'],
  dueDate: data.dueDate as string,
  paymentMethod: data.paymentMethod as Bill['paymentMethod'],
  accountUsed: data.accountUsed as string,
  autopay: (data.autopay as boolean) ?? false,
  linkedTo: (data.linkedTo as string) ?? '',
  status: data.status as Bill['status'],
  notes: (data.notes as string) ?? '',
  createdAt:
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string) ?? new Date().toISOString(),
  userId: data.userId as string,
});

export const addBill = async (
  userId: string,
  formData: BillFormData
): Promise<string> => {
  const ref = getUserBillsRef(userId);
  const docRef = await addDoc(ref, {
    ...formData,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateBill = async (
  userId: string,
  billId: string,
  formData: Partial<BillFormData>
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'bills', billId);
  await updateDoc(docRef, { ...formData });
};

export const deleteBill = async (
  userId: string,
  billId: string
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'bills', billId);
  await deleteDoc(docRef);
};

export const getBills = async (userId: string): Promise<Bill[]> => {
  const ref = getUserBillsRef(userId);
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToBill(d.id, d.data() as Record<string, unknown>));
};

export const subscribeToBills = (
  userId: string,
  callback: (bills: Bill[]) => void
): Unsubscribe => {
  const ref = getUserBillsRef(userId);
  const q = query(ref, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const bills = snapshot.docs.map((d) =>
      docToBill(d.id, d.data() as Record<string, unknown>)
    );
    callback(bills);
  });
};
