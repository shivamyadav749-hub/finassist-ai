import { Router, Request, Response } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import {
  getUserTransactions,
  addUserTransaction,
  updateUserTransaction,
  deleteUserTransaction,
  calculateFinancialSummary,
  validateTransactionInput,
  ServerTransaction,
} from '../services/firestoreService.js';

export const transactionRouter = Router();

/**
 * GET /api/transactions
 * Retrieve transactions for the authenticated user with optional filtering
 */
transactionRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.uid;
  const { status, search, category } = req.query;

  try {
    const rawTransactions = await getUserTransactions(userId);
    let filtered = [...rawTransactions];

    if (status && status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }

    if (category) {
      filtered = filtered.filter((t) => t.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.counterparty.toLowerCase().includes(q) ||
          t.refId.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          String(t.amount).includes(q)
      );
    }

    const summary = calculateFinancialSummary(rawTransactions);

    return res.json({
      transactions: filtered,
      summary,
    });
  } catch (err: any) {
    console.error('[Transactions API] Error fetching transactions:', err);
    return res.status(500).json({ error: 'Failed to retrieve transactions from database.' });
  }
});

/**
 * POST /api/transactions
 * Create a new transaction in Firestore under users/{userId}/transactions
 */
transactionRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.uid;
  const validation = validateTransactionInput(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      error: 'Invalid transaction data',
      details: validation.errors,
    });
  }

  try {
    const created = await addUserTransaction(userId, req.body);
    return res.status(201).json({
      transaction: created,
      message: 'Transaction saved successfully to Cloud Firestore.',
    });
  } catch (err: any) {
    console.error('[Transactions API] Error creating transaction:', err);
    return res.status(500).json({ error: 'Failed to record transaction in database.' });
  }
});

/**
 * PATCH /api/transactions/:id
 * Update status or metadata for a transaction
 */
transactionRouter.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.uid;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Transaction ID is required.' });
  }

  const { status, anomalyReason, counterparty, amount, category, paymentMethod } = req.body;

  try {
    const updated = await updateUserTransaction(userId, id, {
      status,
      anomalyReason,
      counterparty,
      amount,
      category,
      paymentMethod,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized.' });
    }

    return res.json({
      transaction: updated,
      message: 'Transaction successfully updated in Cloud Firestore.',
    });
  } catch (err: any) {
    console.error('[Transactions API] Error updating transaction:', err);
    return res.status(500).json({ error: 'Failed to update transaction in database.' });
  }
});

/**
 * DELETE /api/transactions/:id
 * Delete a transaction from Cloud Firestore
 */
transactionRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.uid;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Transaction ID is required.' });
  }

  try {
    const deleted = await deleteUserTransaction(userId, id);
    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found or already deleted.' });
    }

    return res.json({ message: 'Transaction removed successfully from Cloud Firestore.' });
  } catch (err: any) {
    console.error('[Transactions API] Error deleting transaction:', err);
    return res.status(500).json({ error: 'Failed to delete transaction from database.' });
  }
});

/**
 * GET /api/transactions/export
 * Export the authenticated user's ledger as verified CSV
 */
transactionRouter.get('/export', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.uid;

  try {
    const txs = await getUserTransactions(userId);
    const header = 'ID,Reference,Counterparty,Category,Amount,Currency,Date,Status,PaymentMethod,IsDemo\n';
    const rows = txs
      .map(
        (t) =>
          `"${t.id}","${t.refId}","${t.counterparty}","${t.category}","${t.amount}","${t.currency}","${t.date}","${t.status}","${t.paymentMethod}","${t.isDemo ? 'DEMO' : 'LIVE'}"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="finassist_ledger_${new Date().toISOString().split('T')[0]}.csv"`
    );
    return res.send(header + rows);
  } catch (err: any) {
    console.error('[Transactions API] Export error:', err);
    return res.status(500).json({ error: 'Failed to export transaction ledger.' });
  }
});
