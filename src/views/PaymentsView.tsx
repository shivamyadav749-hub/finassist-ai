import React, { useState, useEffect } from 'react';
import { MockDisbursement } from '../types';

interface PaymentsViewProps {
  onTriggerToast: (msg: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ onTriggerToast }) => {
  const [sandboxEnabled, setSandboxEnabled] = useState(true);
  const [selectedTier, setSelectedTier] = useState<'growth' | 'starter' | 'scale'>('growth');
  const [selectedInstrument, setSelectedInstrument] = useState<'paypal' | 'card'>('paypal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const [ledger, setLedger] = useState<MockDisbursement[]>([
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
  ]);

  // Fetch initial ledger from server
  useEffect(() => {
    fetch('/api/paypal/ledger')
      .then((res) => res.json())
      .then((data) => {
        if (data.ledger && data.ledger.length > 0) {
          setLedger(data.ledger);
        }
      })
      .catch((err) => console.log('Could not load paypal ledger from server:', err));
  }, []);

  const getTierPrice = () => {
    if (selectedTier === 'starter') return '₹2,499.00 INR';
    if (selectedTier === 'scale') return '₹19,999.00 INR';
    return '₹6,499.00 INR';
  };

  const handleLaunchModal = async () => {
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier: selectedTier }),
      });
      const data = await res.json();
      setActiveOrderId(data.orderId);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to create PayPal sandbox order:', err);
      onTriggerToast('Could not reach PayPal sandbox server.');
    }
  };

  const handleConfirmMockPayment = async () => {
    if (!activeOrderId) return;
    setIsAuthorizing(true);

    try {
      // Server-side verification constraint: Do not claim payment succeeded without server verification
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrderId,
          instrument: selectedInstrument,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server capture verification failed');
      }

      setIsModalOpen(false);
      onTriggerToast(`Server Verified: Order ${data.orderId} captured (₹${Number(data.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}) via PayPal Sandbox v2.`);

      // Refresh ledger
      const ledgerRes = await fetch('/api/paypal/ledger');
      const ledgerData = await ledgerRes.json();
      if (ledgerData.ledger) setLedger(ledgerData.ledger);
    } catch (err: any) {
      console.error('Payment capture error:', err);
      alert(`Server Capture Failed: ${err.message}`);
    } finally {
      setIsAuthorizing(false);
      setActiveOrderId(null);
    }
  };

  const handleFireWebhook = async (eventType: string) => {
    try {
      const res = await fetch('/api/paypal/webhook/fire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType }),
      });
      const data = await res.json();
      onTriggerToast(`Webhook Fired: ${eventType} (Server ACK: 200 OK)`);

      const ledgerRes = await fetch('/api/paypal/ledger');
      const ledgerData = await ledgerRes.json();
      if (ledgerData.ledger) setLedger(ledgerData.ledger);
    } catch (err) {
      console.error('Webhook dispatcher error:', err);
    }
  };

  return (
    <div className="w-full max-w-[440px] md:max-w-[760px] lg:max-w-[960px] mx-auto px-4 pb-28 pt-2 flex flex-col gap-3.5 text-left">
      {/* Persistent Sandbox Environment Alert Banner */}
      <div className="w-full bg-[#e2e7ff] rounded-xl p-3 flex items-center justify-between shadow-xs border border-[#cbd5e1]/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006c4a] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#006c4a]"></span>
          </span>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[12px] font-bold text-[#131b2e] uppercase tracking-wider">
                Sandbox Active
              </span>
              <span className="bg-[#dae2fd] text-[#434655] text-[10px] px-1.5 py-0.2 rounded font-semibold">
                Dev-Node-04
              </span>
            </div>
            <span className="text-[11px] text-[#434655] truncate">
              PayPal v2 • Mock Orchestrator
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
          <input
            type="checkbox"
            checked={sandboxEnabled}
            onChange={(e) => {
              setSandboxEnabled(e.target.checked);
              onTriggerToast(
                e.target.checked
                  ? 'PayPal Sandbox mode active (Test Credentials)'
                  : 'Live Production Gateway requires PayPal Merchant verification'
              );
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-[#cbd5e1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006c4a]"></div>
        </label>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {/* Webhook Pulse */}
        <div className="bg-white rounded-xl p-2.5 shadow-xs border border-[#cbd5e1]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#006c4a]">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span className="bg-[#82f5c1] text-[#005137] text-[10px] px-1 py-0.2 rounded font-bold">
              200 OK
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[11px] text-[#434655] block">Webhook</span>
            <span className="text-[13px] font-bold text-[#131b2e] block truncate">Active</span>
          </div>
        </div>

        {/* Last Payout */}
        <div className="bg-white rounded-xl p-2.5 shadow-xs border border-[#cbd5e1]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#1d4ed8]">
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span className="bg-[#dce1ff] text-[#001551] text-[10px] px-1 py-0.2 rounded font-bold">
              Live
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[11px] text-[#434655] block">Last Payout</span>
            <span className="text-[13px] font-bold text-[#131b2e] block truncate tabular-nums font-financial">
              ₹ 6,499.00
            </span>
          </div>
        </div>

        {/* Gateway Latency */}
        <div className="bg-white rounded-xl p-2.5 shadow-xs border border-[#cbd5e1]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#434655]">
            <span className="material-symbols-outlined text-[18px]">speed</span>
            <span className="bg-[#dae2fd] text-[#434655] text-[10px] px-1 py-0.2 rounded font-bold">
              East
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[11px] text-[#434655] block">Latency</span>
            <span className="text-[13px] font-bold text-[#131b2e] block truncate tabular-nums">
              142 ms
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Sandbox Simulator Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#cbd5e1]/60 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#1d4ed8] text-[20px]">
              shopping_cart_checkout
            </span>
            <h2 className="text-[15px] font-bold text-[#131b2e]">Simulate Checkout</h2>
          </div>
          <span className="bg-[#eaedff] text-[#434655] text-[11px] font-medium px-2 py-0.5 rounded">
            Client Flow
          </span>
        </div>

        {/* Tier Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[#434655] font-semibold" htmlFor="tierSelect">
            Target Subscription
          </label>
          <div className="relative w-full">
            <select
              id="tierSelect"
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="w-full h-10 px-3 bg-[#f2f3ff] rounded-lg text-[13px] text-[#131b2e] font-medium appearance-none focus:outline-none border border-[#cbd5e1]/60"
            >
              <option value="growth">Growth Tier — ₹6,499.00 / mo</option>
              <option value="starter">Starter Pilot — ₹2,499.00 / mo</option>
              <option value="scale">Enterprise Scale — ₹19,999.00 / mo</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-[#434655] text-[20px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Mock Payment Instruments */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] text-[#434655] font-semibold">Select Test Instrument</span>

          {/* Option 1: PayPal Wallet */}
          <label className="relative flex items-center p-3 rounded-lg bg-[#f2f3ff] cursor-pointer transition-colors has-[:checked]:bg-[#dce1ff]/50 border border-[#cbd5e1]/40">
            <input
              type="radio"
              name="payment_instrument"
              value="paypal"
              checked={selectedInstrument === 'paypal'}
              onChange={() => setSelectedInstrument('paypal')}
              className="w-4 h-4 text-[#1d4ed8] accent-[#1d4ed8]"
            />
            <div className="flex items-center justify-between w-full ml-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1d4ed8] text-[20px]">
                  account_balance_wallet
                </span>
                <div className="flex flex-col">
                  <span className="text-[13px] text-[#131b2e] font-semibold">
                    PayPal Sandbox Wallet
                  </span>
                  <span className="text-[11px] text-[#434655]">sandbox-buyer@finassist.ai</span>
                </div>
              </div>
              <span className="bg-[#82f5c1] text-[#005137] text-[10px] px-1.5 py-0.5 rounded font-bold">
                Prefunded
              </span>
            </div>
          </label>

          {/* Option 2: Mock Visa */}
          <label className="relative flex items-center p-3 rounded-lg bg-[#f2f3ff] cursor-pointer transition-colors has-[:checked]:bg-[#dce1ff]/50 border border-[#cbd5e1]/40">
            <input
              type="radio"
              name="payment_instrument"
              value="card"
              checked={selectedInstrument === 'card'}
              onChange={() => setSelectedInstrument('card')}
              className="w-4 h-4 text-[#1d4ed8] accent-[#1d4ed8]"
            />
            <div className="flex items-center justify-between w-full ml-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#434655] text-[20px]">credit_card</span>
                <div className="flex flex-col">
                  <span className="text-[13px] text-[#131b2e] font-semibold">
                    Mock Visa (•••• 4032)
                  </span>
                  <span className="text-[11px] text-[#434655]">Exp 12/28 • 3DS Bypass</span>
                </div>
              </div>
              <span className="bg-[#dae2fd] text-[#434655] text-[10px] px-1.5 py-0.5 rounded font-medium">
                Test Card
              </span>
            </div>
          </label>
        </div>

        {/* Big Action Button */}
        <button
          onClick={handleLaunchModal}
          className="w-full h-12 bg-[#85f8c4] hover:bg-[#82f5c1] text-[#002114] text-[14px] rounded-lg flex items-center justify-center gap-2 font-bold shadow-xs active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">bolt</span>
          <span>Launch PayPal Sandbox Modal</span>
        </button>
      </div>

      {/* Quick Webhook Dispatcher Tiles */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#434655] text-[18px]">terminal</span>
            <h3 className="text-[14px] font-bold text-[#131b2e]">Quick Webhook Dispatcher</h3>
          </div>
          <span className="text-[11px] text-[#434655]">Async Mock Events</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Success Event */}
          <div className="bg-white p-3 rounded-lg flex items-center justify-between shadow-xs border border-[#cbd5e1]/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#82f5c1] flex items-center justify-center text-[#005137] flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
              <div>
                <span className="text-[13px] font-semibold text-[#131b2e] block">
                  PAYMENT.CAPTURE.COMPLETED
                </span>
                <span className="text-[11px] text-[#434655]">Instant full capture simulation</span>
              </div>
            </div>
            <button
              onClick={() => handleFireWebhook('PAYMENT.CAPTURE.COMPLETED')}
              className="bg-[#eaedff] hover:bg-[#dae2fd] text-[#0037b0] text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 flex-shrink-0 active:scale-95 transition-all"
            >
              <span>Fire</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Dispute Event */}
          <div className="bg-white p-3 rounded-lg flex items-center justify-between shadow-xs border border-[#cbd5e1]/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">shield_with_heart</span>
              </div>
              <div>
                <span className="text-[13px] font-semibold text-[#131b2e] block">
                  CUSTOMER.DISPUTE.CREATED
                </span>
                <span className="text-[11px] text-[#434655]">Trigger synthetic buyer dispute</span>
              </div>
            </div>
            <button
              onClick={() => handleFireWebhook('CUSTOMER.DISPUTE.CREATED')}
              className="bg-[#eaedff] hover:bg-[#dae2fd] text-[#0037b0] text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 flex-shrink-0 active:scale-95 transition-all"
            >
              <span>Fire</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Insufficient Funds Event */}
          <div className="bg-white p-3 rounded-lg flex items-center justify-between shadow-xs border border-[#cbd5e1]/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#dae2fd] flex items-center justify-center text-[#434655] flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">remove_shopping_cart</span>
              </div>
              <div>
                <span className="text-[13px] font-semibold text-[#131b2e] block">
                  PAYMENT.CAPTURE.DENIED
                </span>
                <span className="text-[11px] text-[#434655]">Simulate insufficient buyer balance</span>
              </div>
            </div>
            <button
              onClick={() => handleFireWebhook('PAYMENT.CAPTURE.DENIED')}
              className="bg-[#eaedff] hover:bg-[#dae2fd] text-[#0037b0] text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 flex-shrink-0 active:scale-95 transition-all"
            >
              <span>Fire</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Mock Ledger Feed */}
      <div className="flex flex-col gap-2 w-full mt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#434655] text-[18px]">receipt</span>
            <h3 className="text-[14px] font-bold text-[#131b2e]">Recent Mock Ledger</h3>
          </div>
          <span className="text-[11px] text-[#1d4ed8] font-semibold">Verified Log</span>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-xs border border-[#cbd5e1]/60 flex flex-col divide-y divide-[#eaedff]">
          {ledger.map((item) => (
            <div key={item.id} className="p-3 flex items-center justify-between hover:bg-[#faf8ff] transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.status === 'Settled'
                      ? 'bg-[#82f5c1] text-[#005137]'
                      : item.status === 'Denied'
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : 'bg-[#eaedff] text-[#1d4ed8]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {item.status === 'Settled' ? 'call_received' : item.status === 'Denied' ? 'close' : 'hourglass_top'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold text-[#131b2e] truncate">{item.title}</span>
                  <span className="text-[11px] text-[#434655]">
                    {item.txId} • {item.method} • {item.timestamp}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0 ml-2">
                <span
                  className={`text-[13px] font-bold tabular-nums font-financial ${
                    item.status === 'Denied' ? 'text-[#ba1a1a]' : 'text-[#131b2e]'
                  }`}
                >
                  ₹ {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold mt-0.5 ${
                    item.status === 'Settled'
                      ? 'bg-[#82f5c1] text-[#005137]'
                      : item.status === 'Denied'
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : 'bg-[#eaedff] text-[#1d4ed8]'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live PayPal Sandbox Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#283044]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl border border-[#cbd5e1] flex flex-col gap-3 text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center text-[16px]">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-[#131b2e]">PayPal Sandbox Gateway</h4>
                  <span className="text-[11px] text-[#434655]">Dev-Node-04 Simulated Checkout</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#eaedff] flex items-center justify-center text-[#434655] hover:text-[#131b2e]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Test Order Summary */}
            <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[#131b2e]">
                <span className="text-[13px] font-medium">Subtotal</span>
                <span className="text-[14px] font-bold tabular-nums font-financial">{getTierPrice()}</span>
              </div>
              <div className="flex justify-between items-center text-[#434655] text-[12px]">
                <span>Sandbox Buyer Account</span>
                <span className="font-mono text-[11px]">sandbox-buyer@finassist.ai</span>
              </div>
              <div className="flex justify-between items-center text-[#434655] text-[12px]">
                <span>Payment Method</span>
                <span className="font-medium text-[#131b2e]">
                  {selectedInstrument === 'card' ? 'Mock Visa (•••• 4032)' : 'PayPal Sandbox Wallet'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#434655] text-[12px]">
                <span>Shipping &amp; Taxes</span>
                <span className="text-[#006c4a] font-medium">₹0.00 (Sandbox waived)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#eaedff] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-[18px]">verified_user</span>
              <span className="text-[12px] text-[#131b2e]">
                Server-side capture verification required. No actual credit card charged.
              </span>
            </div>

            {/* Confirmation CTA */}
            <button
              onClick={handleConfirmMockPayment}
              disabled={isAuthorizing}
              className="w-full h-11 bg-[#1d4ed8] text-white rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#0037b0] active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isAuthorizing ? 'sync' : 'check'}
              </span>
              <span>{isAuthorizing ? 'Verifying on Server...' : 'Authorize & Settle Sandbox Order'}</span>
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-1 text-center text-[12px] text-[#434655] hover:text-[#131b2e]"
            >
              Cancel Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
