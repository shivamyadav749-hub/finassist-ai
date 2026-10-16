import React, { useState } from 'react';
import { TransactionItem } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Partial<TransactionItem>) => Promise<void>;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [counterparty, setCounterparty] = useState('');
  const [category, setCategory] = useState<TransactionItem['category']>('Software');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'revenue'>('expense');
  const [paymentMethod, setPaymentMethod] = useState('Corporate Card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterparty || !amount) return;

    const numericAmount = parseFloat(amount);
    const finalAmount = type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

    setIsSubmitting(true);
    try {
      await onAdd({
        counterparty,
        category,
        amount: finalAmount,
        currency: 'INR',
        paymentMethod,
        status: 'settled',
        isDemo: false,
      });
      setCounterparty('');
      setAmount('');
      onClose();
    } catch (err) {
      console.error('Failed to create transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#283044]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#ffffff] rounded-2xl p-5 shadow-2xl border border-[#cbd5e1] text-left">
        <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1d4ed8] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_card</span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#131b2e]">Record Transaction</h3>
              <p className="text-[11px] text-[#434655]">Append to real-time verified ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#eaedff] flex items-center justify-center text-[#434655]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Revenue vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-[#f2f3ff] p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 text-[12px] font-semibold rounded-md transition-all ${
                type === 'expense'
                  ? 'bg-white text-[#ba1a1a] shadow-sm'
                  : 'text-[#434655] hover:text-[#131b2e]'
              }`}
            >
              Expense / Outflow (-)
            </button>
            <button
              type="button"
              onClick={() => setType('revenue')}
              className={`py-1.5 text-[12px] font-semibold rounded-md transition-all ${
                type === 'revenue'
                  ? 'bg-white text-[#006c4a] shadow-sm'
                  : 'text-[#434655] hover:text-[#131b2e]'
              }`}
            >
              Revenue / Inflow (+)
            </button>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#131b2e] mb-1">
              Counterparty / Vendor
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Snowflake Data, Microsoft, Stripe"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] text-[#131b2e] text-[13px] focus:outline-none focus:border-[#1d4ed8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#131b2e] mb-1">
                Amount (₹ INR)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="450.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] text-[#131b2e] text-[13px] focus:outline-none focus:border-[#1d4ed8]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#131b2e] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-10 px-2.5 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] text-[#131b2e] text-[13px] focus:outline-none focus:border-[#1d4ed8]"
              >
                <option value="Software">Software</option>
                <option value="Cloud">Cloud</option>
                <option value="Marketing">Marketing</option>
                <option value="Payroll">Payroll</option>
                <option value="Office & Facilities">Office & Facilities</option>
                <option value="Revenue">Revenue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#131b2e] mb-1">
              Payment Method / Account
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-10 px-2.5 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] text-[#131b2e] text-[13px] focus:outline-none focus:border-[#1d4ed8]"
            >
              <option value="Virtual Card 0482">Virtual Card 0482</option>
              <option value="Corporate Visa">Corporate Visa</option>
              <option value="ACH Inbound">ACH Inbound</option>
              <option value="Direct Debit">Direct Debit</option>
              <option value="PayPal Express">PayPal Express</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#434655] hover:bg-[#eaedff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#1d4ed8] text-white text-[13px] font-semibold hover:bg-[#0037b0] transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Posting to Ledger...' : 'Commit Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
