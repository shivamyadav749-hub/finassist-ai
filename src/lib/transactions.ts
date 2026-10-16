import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { TransactionItem, FinancialSummary } from '../types';

const SEED_TRANSACTIONS: Omit<TransactionItem, 'id'>[] = [
  {
    refId: 'TXN-99824',
    counterparty: 'Stripe Settlement',
    category: 'Revenue',
    amount: 42850.0,
    currency: 'INR',
    date: 'Today, 09:14 AM',
    status: 'settled',
    paymentMethod: 'ACH Inbound',
    isDemo: true,
  },
  {
    refId: 'INV-8721',
    counterparty: 'AWS Cloud Hosting',
    category: 'Software',
    amount: -8412.3,
    currency: 'INR',
    date: 'Oct 13',
    status: 'settled',
    paymentMethod: 'Virtual Card 0482',
    isDemo: true,
  },
  {
    refId: 'INV-APX-44',
    counterparty: 'Apex Media Digital',
    category: 'Marketing',
    amount: -14500.0,
    currency: 'INR',
    date: 'Oct 13',
    status: 'flagged',
    anomalyReason: '140% above typical monthly spend',
    paymentMethod: 'Corporate Visa',
    isDemo: true,
  },
  {
    refId: 'PAY-2024-10A',
    counterparty: 'Gusto Payroll',
    category: 'Payroll',
    amount: -68120.4,
    currency: 'INR',
    date: 'Oct 12',
    status: 'settled',
    paymentMethod: 'Direct Debit',
    isDemo: true,
  },
  {
    refId: 'LEAS-9921',
    counterparty: 'WeWork Global Lease',
    category: 'Office & Facilities',
    amount: -4200.0,
    currency: 'INR',
    date: 'Oct 11',
    status: 'pending',
    anomalyReason: 'Processing bank clearance (Est. 24h)',
    paymentMethod: 'ACH Wire',
    isDemo: true,
  },
  {
    refId: 'SUB-FIG-90',
    counterparty: 'Figma Inc',
    category: 'Software',
    amount: -450.0,
    currency: 'INR',
    date: 'Oct 07',
    status: 'flagged',
    anomalyReason: 'Billed twice within 48h (Card #9012 & #0482)',
    paymentMethod: 'Chase ••4021',
    isDemo: true,
  },
  {
    refId: 'STR-9912',
    counterparty: 'Stripe Payout - Enterprise',
    category: 'Revenue',
    amount: 18450.0,
    currency: 'INR',
    date: 'Today, 2:14 PM',
    status: 'settled',
    paymentMethod: 'Stripe Direct',
    isDemo: true,
  },
  {
    refId: 'AWS-291',
    counterparty: 'Amazon Web Services',
    category: 'Cloud',
    amount: -4210.5,
    currency: 'INR',
    date: 'Today, 08:30 AM',
    status: 'settled',
    paymentMethod: 'Auto-Debit',
    isDemo: true,
  },
  {
    refId: 'GST-998',
    counterparty: 'Gusto Bi-Weekly Payroll',
    category: 'Payroll',
    amount: -16200.0,
    currency: 'INR',
    date: 'Yesterday',
    status: 'settled',
    paymentMethod: 'Processed',
    isDemo: true,
  },
  {
    refId: 'FIG-441',
    counterparty: 'Figma Inc. (Duplicated)',
    category: 'Software',
    amount: -450.0,
    currency: 'INR',
    date: 'May 14',
    status: 'flagged',
    anomalyReason: 'Duplicate invoice flagged • ₹450.00 saved on hold',
    paymentMethod: 'Hold',
    isDemo: true,
  },
];

/**
 * Real-time subscription to user transactions in Firestore
 * Path: users/{userId}/transactions
 */
export function subscribeUserTransactions(
  userId: string,
  onUpdate: (txs: TransactionItem[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const userTxCol = collection(db, 'users', userId, 'transactions');

  return onSnapshot(
    userTxCol,
    async (snapshot) => {
      // If collection is empty for this user, seed it once
      if (snapshot.empty) {
        try {
          await seedUserDefaultTransactions(userId);
          return;
        } catch (err) {
          console.warn('Could not seed initial user transactions:', err);
        }
      }

      const txs: TransactionItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          refId: data.refId || `TXN-${docSnap.id.slice(0, 5)}`,
          counterparty: data.counterparty || 'Unknown Vendor',
          category: data.category || 'Software',
          amount: typeof data.amount === 'number' ? data.amount : Number(data.amount) || 0,
          currency: data.currency || 'INR',
          date: data.date || 'Recently',
          status: (data.status as 'settled' | 'pending' | 'flagged') || 'settled',
          anomalyReason: data.anomalyReason,
          paymentMethod: data.paymentMethod || 'Corporate Card',
          isDemo: Boolean(data.isDemo),
        };
      });

      // Sort by status or natural order
      onUpdate(txs);
    },
    (error) => {
      console.error('Error listening to user transactions:', error);
      try {
        handleFirestoreError(error, OperationType.LIST, `users/${userId}/transactions`);
      } catch (e) {
        // logged
      }
      if (onError) onError(error);
    }
  );
}

/**
 * Seed initial baseline ledger transactions for new users
 */
export async function seedUserDefaultTransactions(userId: string): Promise<void> {
  const userTxCol = collection(db, 'users', userId, 'transactions');
  for (let i = 0; i < SEED_TRANSACTIONS.length; i++) {
    const seed = SEED_TRANSACTIONS[i];
    const txDocRef = doc(userTxCol, `seed_tx_${i + 1}`);
    await setDoc(txDocRef, {
      ...seed,
      userId,
    });
  }
}

/**
 * Add a transaction to Cloud Firestore under users/{userId}/transactions
 */
export async function addUserTransaction(
  userId: string,
  txData: Partial<TransactionItem>
): Promise<TransactionItem> {
  const userTxCol = collection(db, 'users', userId, 'transactions');

  const refId = txData.refId || `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = `Today, ${timeStr}`;

  const payload = {
    userId,
    refId,
    counterparty: txData.counterparty || 'Unnamed Vendor',
    category: txData.category || 'Software',
    amount: Number(txData.amount) || 0,
    currency: txData.currency || 'INR',
    date: txData.date || dateStr,
    status: txData.status || (Number(txData.amount) < -10000 ? 'flagged' : 'settled'),
    anomalyReason:
      txData.anomalyReason ||
      (Number(txData.amount) < -10000 ? 'High outflow detected above typical daily velocity' : undefined),
    paymentMethod: txData.paymentMethod || 'Corporate Card',
    isDemo: Boolean(txData.isDemo),
  };

  try {
    const docRef = await addDoc(userTxCol, payload);
    return {
      id: docRef.id,
      ...payload,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/transactions`);
    throw error;
  }
}

/**
 * Update a transaction in Cloud Firestore
 */
export async function updateUserTransaction(
  userId: string,
  txId: string,
  updates: Partial<TransactionItem>
): Promise<void> {
  const txDocRef = doc(db, 'users', userId, 'transactions', txId);

  const payload: Record<string, any> = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.anomalyReason !== undefined) payload.anomalyReason = updates.anomalyReason;
  if (updates.counterparty !== undefined) payload.counterparty = updates.counterparty;
  if (updates.amount !== undefined) payload.amount = Number(updates.amount);
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.paymentMethod !== undefined) payload.paymentMethod = updates.paymentMethod;

  try {
    await updateDoc(txDocRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/transactions/${txId}`);
    throw error;
  }
}

/**
 * Delete a transaction from Cloud Firestore
 */
export async function deleteUserTransaction(userId: string, txId: string): Promise<void> {
  const txDocRef = doc(db, 'users', userId, 'transactions', txId);
  try {
    await deleteDoc(txDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/transactions/${txId}`);
    throw error;
  }
}

/**
 * Calculate financial totals and runway metrics dynamically from transactions
 */
export function calculateFinancialSummary(transactions: TransactionItem[]): FinancialSummary {
  let settledLiquidity = 412980.0;
  let pendingLiquidity = 19410.0;
  let totalRevenue = 104850.0;
  let totalExpenses = 68320.0;

  let settledCount = 0;
  let pendingCount = 0;
  let flaggedCount = 0;

  for (const t of transactions) {
    if (t.status === 'settled') {
      settledCount++;
      if (!t.isDemo) {
        settledLiquidity += t.amount;
        if (t.amount > 0) totalRevenue += t.amount;
        else totalExpenses += Math.abs(t.amount);
      }
    } else if (t.status === 'pending') {
      pendingCount++;
      if (!t.isDemo) {
        pendingLiquidity += Math.abs(t.amount);
      }
    } else if (t.status === 'flagged') {
      flaggedCount++;
    }
  }

  const netCashFlow = totalRevenue - totalExpenses;
  const burnRatePerMo = 38240;
  const estimatedRunwayMonths = Number((settledLiquidity / burnRatePerMo).toFixed(1));

  return {
    totalCount: transactions.length,
    settledCount: settledCount,
    pendingCount: pendingCount,
    flaggedCount: flaggedCount,
    settledLiquidity,
    pendingLiquidity,
    totalRevenue,
    totalExpenses,
    netCashFlow,
    estimatedRunwayMonths,
  };
}
