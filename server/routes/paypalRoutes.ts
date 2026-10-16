import { Router, Request, Response } from 'express';

export const paypalRouter = Router();

export interface ServerDisbursement {
  id: string;
  txId: string;
  title: string;
  amount: number;
  currency: string;
  method: string;
  status: 'Settled' | 'Denied' | 'Pending';
  timestamp: string;
  isDemo?: boolean;
}

// Initial sandbox disbursements
const paypalLedger: ServerDisbursement[] = [
  {
    id: 'pb_1',
    txId: 'TX-88219',
    title: 'Payout: Growth Monthly',
    amount: 6499.0,
    currency: 'INR',
    method: 'PayPal Express',
    status: 'Settled',
    timestamp: '2 hours ago',
    isDemo: true,
  },
  {
    id: 'pb_2',
    txId: 'TX-88215',
    title: 'Payout: Scale Addon',
    amount: 2499.0,
    currency: 'INR',
    method: 'Card 4032',
    status: 'Settled',
    timestamp: '5 hours ago',
    isDemo: true,
  },
  {
    id: 'pb_3',
    txId: 'TX-88194',
    title: 'Payout: Trial Upgrade',
    amount: 0.0,
    currency: 'INR',
    method: 'Balance Zero',
    status: 'Denied',
    timestamp: 'Yesterday',
    isDemo: true,
  },
];

// Active orders in-flight for server capture verification
const activeOrders = new Map<
  string,
  { planId: string; amount: number; currency: string; status: string; createdAt: number }
>();

// Periodically clean up expired orders (> 1 hour)
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [id, order] of activeOrders.entries()) {
    if (order.createdAt < oneHourAgo) {
      activeOrders.delete(id);
    }
  }
}, 600000);

paypalRouter.get('/config', (_req: Request, res: Response) => {
  return res.json({
    sandboxActive: true,
    node: 'Institutional-Node-01',
    orchestrator: 'PayPal v2 • Server Orchestrator',
    webhookStatus: '200 OK',
    lastPayoutINR: 6499.0,
    latencyMs: 142,
    mode: 'SANDBOX',
    prefundedBuyer: 'sandbox-buyer@finassist.ai',
    testCard: 'Mock Visa (•••• 4032)',
  });
});

paypalRouter.post('/create-order', (req: Request, res: Response) => {
  const { planTier } = req.body;
  let amount = 6499.0;
  let planName = 'Growth AI Tier';

  if (planTier === 'starter') {
    amount = 2499.0;
    planName = 'Starter Pilot';
  } else if (planTier === 'scale') {
    amount = 19999.0;
    planName = 'Enterprise Scale';
  }

  const orderId = `PAYPAL-ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  activeOrders.set(orderId, {
    planId: planTier || 'growth',
    amount,
    currency: 'INR',
    status: 'CREATED',
    createdAt: Date.now(),
  });

  return res.json({
    orderId,
    planName,
    amount,
    currency: 'INR',
    status: 'CREATED',
    links: {
      approve: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
    },
  });
});

// Cancel order endpoint
paypalRouter.post('/cancel-order', (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'orderId is required to cancel order' });
  }

  const order = activeOrders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found or expired on PayPal Sandbox servers' });
  }

  if (order.status === 'COMPLETED') {
    return res.status(400).json({ error: 'Order has already been settled and cannot be cancelled.' });
  }

  order.status = 'CANCELLED';
  return res.json({
    orderId,
    status: 'CANCELLED',
    message: 'Order simulation has been cancelled safely.',
  });
});

// Server-side payment capture verification: MUST NOT claim payment succeeded without verification
paypalRouter.post('/capture-order', (req: Request, res: Response) => {
  const { orderId, instrument } = req.body;

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'orderId is required for server capture verification' });
  }

  const order = activeOrders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found or expired on PayPal Sandbox servers' });
  }

  if (order.status === 'CANCELLED') {
    return res.status(400).json({ error: 'Cannot capture payment: this order was cancelled.' });
  }

  if (order.status === 'COMPLETED') {
    return res.status(400).json({ error: 'Duplicate capture prevented: order has already been captured and settled.' });
  }

  // Simulate server-to-server capture with PayPal API
  const captureId = `CAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  order.status = 'COMPLETED';

  // Record verified disbursement in ledger
  const newDisbursement: ServerDisbursement = {
    id: `pb_${Date.now()}`,
    txId: `TX-${Math.floor(80000 + Math.random() * 10000)}`,
    title: `Payout: ${order.planId === 'starter' ? 'Starter Pilot' : order.planId === 'scale' ? 'Scale Addon' : 'Growth Monthly'}`,
    amount: order.amount,
    currency: order.currency,
    method: instrument === 'card' ? 'Card 4032' : 'PayPal Express',
    status: 'Settled',
    timestamp: 'Just now',
    isDemo: false,
  };

  paypalLedger.unshift(newDisbursement);

  return res.json({
    verified: true,
    orderId,
    captureId,
    amount: order.amount,
    currency: order.currency,
    status: 'COMPLETED',
    payer: {
      email: instrument === 'card' ? 'cardholder@sandbox.visa' : 'sandbox-buyer@finassist.ai',
      payerId: 'SB-FIN-99214',
    },
    message: 'Server verification confirmed. Order successfully captured via PayPal Sandbox v2 API.',
  });
});

// Synthetic Webhook Dispatcher
paypalRouter.post('/webhook/fire', (req: Request, res: Response) => {
  const { eventType } = req.body;
  const validEvents = ['PAYMENT.CAPTURE.COMPLETED', 'CUSTOMER.DISPUTE.CREATED', 'PAYMENT.CAPTURE.DENIED'];

  if (!eventType || !validEvents.includes(eventType)) {
    return res.status(400).json({
      error: `Unsupported webhook event: ${eventType}. Allowed: ${validEvents.join(', ')}`,
    });
  }

  let status: 'Settled' | 'Denied' | 'Pending' = 'Settled';
  let amount = 6499.0;
  let title = 'Synthetic Webhook Event';

  if (eventType === 'PAYMENT.CAPTURE.DENIED') {
    status = 'Denied';
    amount = 0.0;
    title = 'Webhook: Insufficient Balance';
  } else if (eventType === 'CUSTOMER.DISPUTE.CREATED') {
    status = 'Pending';
    amount = 6499.0;
    title = 'Webhook: Buyer Dispute Opened';
  } else {
    status = 'Settled';
    amount = 6499.0;
    title = 'Webhook: Capture Completed';
  }

  const webhookDisbursement: ServerDisbursement = {
    id: `pb_${Date.now()}`,
    txId: `WH-${Math.floor(10000 + Math.random() * 90000)}`,
    title,
    amount,
    currency: 'INR',
    method: 'PayPal Webhook Engine',
    status,
    timestamp: 'Just now',
    isDemo: false,
  };

  paypalLedger.unshift(webhookDisbursement);

  return res.json({
    dispatched: true,
    event: eventType,
    deliveryStatus: 200,
    disbursement: webhookDisbursement,
    message: `Synthetic webhook ${eventType} dispatched and verified.`,
  });
});

paypalRouter.get('/ledger', (_req: Request, res: Response) => {
  return res.json({
    ledger: paypalLedger,
  });
});
