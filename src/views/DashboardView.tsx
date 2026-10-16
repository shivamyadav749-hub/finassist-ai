import React, { useState } from 'react';
import { ActiveTab, FinancialSummary, TransactionItem } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  summary: FinancialSummary;
  transactions: TransactionItem[];
  onReviewAnomaly: () => void;
  onReloadTransactions: () => Promise<void>;
  onTriggerToast: (msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  summary,
  transactions,
  onReviewAnomaly,
  onReloadTransactions,
  onTriggerToast,
}) => {
  const [activePeriod, setActivePeriod] = useState<'30days' | 'month' | 'quarter'>('30days');
  const [anomalyDismissed, setAnomalyDismissed] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Dynamic KPI scaling based on timeframe
  const periodMultiplier = activePeriod === 'month' ? 0.65 : activePeriod === 'quarter' ? 3.0 : 1.0;
  const displayRevenue = Math.round(summary.totalRevenue * periodMultiplier);
  const displayExpenses = Math.round(summary.totalExpenses * periodMultiplier);
  const displayNetFlow = Math.round(summary.netCashFlow * periodMultiplier);

  const handleSimulateOCR = async () => {
    setIsScanning(true);
    try {
      let currentUserId = '';
      try {
        const saved = localStorage.getItem('finassist_user');
        if (saved) currentUserId = JSON.parse(saved)?.id || '';
      } catch (e) {
        // ignore
      }

      const res = await fetch('/api/ocr/scan-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUserId ? { 'x-user-id': currentUserId } : {}),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setScanModalOpen(false);
        await onReloadTransactions();
        onTriggerToast(data.message);
      }
    } catch (err) {
      console.error('OCR ingest failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Filter 4 recent transactions
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="w-full max-w-[440px] md:max-w-[760px] lg:max-w-[960px] mx-auto px-4 pb-24 pt-2 flex flex-col gap-3 text-left">
      {/* Interactive Date Filter Pills */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 bg-[#f2f3ff] p-1 rounded-full shadow-xs w-full">
          <button
            onClick={() => setActivePeriod('30days')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center text-[12px] font-semibold transition-all ${
              activePeriod === '30days'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setActivePeriod('month')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center text-[12px] font-semibold transition-all ${
              activePeriod === 'month'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setActivePeriod('quarter')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center text-[12px] font-semibold transition-all ${
              activePeriod === 'quarter'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Demo Data Notice */}
      <div className="flex items-center justify-between px-2 py-1 rounded bg-[#eaedff]/60 border border-[#cad3ff] text-[11px] text-[#0037b0]">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px]">info</span>
          <span>Verified Sandbox Environment • Live calculations reflect ledger state</span>
        </div>
        <span className="font-semibold uppercase tracking-wider text-[10px] bg-[#dce1ff] px-1.5 py-0.2 rounded">
          Demo Ledger
        </span>
      </div>

      {/* AI Anomaly Alert Banner */}
      {!anomalyDismissed && (
        <div className="relative overflow-hidden bg-[#ffdad6] text-[#93000a] rounded-xl p-3.5 shadow-sm border border-[#ffb3b6] transition-all">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] uppercase tracking-wider text-[#ba1a1a] font-bold">
                  AI Copilot Flag
                </span>
                <span className="text-[11px] opacity-75">3h ago</span>
              </div>
              <p className="text-[14px] font-bold text-[#93000a] mt-0.5 leading-snug">
                Duplicate charge: Figma (₹450.00)
              </p>
              <p className="text-[12px] opacity-80 mt-0.5">
                Two matching invoices posted to Chase ending in ••4021.
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={onReviewAnomaly}
                  className="px-3 py-1.5 rounded-lg bg-[#ba1a1a] text-white text-[12px] font-semibold shadow-sm hover:opacity-95 active:scale-95 transition-all"
                >
                  Review Now
                </button>
                <button
                  onClick={() => setAnomalyDismissed(true)}
                  className="px-2.5 py-1.5 rounded-lg text-[#93000a] text-[12px] opacity-75 hover:opacity-100 transition-opacity font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive KPI 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card 1: Revenue */}
        <div className="bg-[#ffffff] p-3.5 rounded-xl shadow-xs border border-[#cbd5e1]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#434655] font-medium">Total Revenue</span>
            <span className="w-6 h-6 rounded-full bg-[#82f5c1] text-[#005137] flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">trending_up</span>
            </span>
          </div>
          <div className="my-2">
            <span className="text-[22px] font-bold text-[#006c4a] tabular-nums font-financial">
              ₹{displayRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#006c4a] font-semibold">
            <span className="material-symbols-outlined text-[14px]">arrow_drop_up</span>
            <span>+14.2% MoM</span>
          </div>
        </div>

        {/* Card 2: Expenses */}
        <div className="bg-[#ffffff] p-3.5 rounded-xl shadow-xs border border-[#cbd5e1]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#434655] font-medium">Total Expenses</span>
            <span className="w-6 h-6 rounded-full bg-[#e2e7ff] text-[#434655] flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">credit_card</span>
            </span>
          </div>
          <div className="my-2">
            <span className="text-[22px] font-bold text-[#131b2e] tabular-nums font-financial">
              ₹{displayExpenses.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#006c4a] font-semibold">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>-3.1% budget</span>
          </div>
        </div>

        {/* Card 3: Net Cash Flow */}
        <div className="bg-[#ffffff] p-3.5 rounded-xl shadow-xs border border-[#cbd5e1]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#434655] font-medium">Net Cash Flow</span>
            <span className="w-6 h-6 rounded-full bg-[#dce1ff] text-[#0037b0] flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">savings</span>
            </span>
          </div>
          <div className="my-2">
            <span className="text-[22px] font-bold text-[#0037b0] tabular-nums font-financial">
              +₹{displayNetFlow.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-[11px] text-[#434655]">
            Runway: <span className="text-[#131b2e] font-semibold">{summary.estimatedRunwayMonths} mos</span>
          </div>
        </div>

        {/* Card 4: Reconciled */}
        <div className="bg-[#ffffff] p-3.5 rounded-xl shadow-xs border border-[#cbd5e1]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#434655] font-medium">Reconciled</span>
            <span className="w-6 h-6 rounded-full bg-[#82f5c1] text-[#005137] flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">fact_check</span>
            </span>
          </div>
          <div className="my-2">
            <span className="text-[22px] font-bold text-[#131b2e] tabular-nums font-financial">
              {summary.totalCount.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-[#006c4a] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>99.8% AI sync</span>
          </div>
        </div>
      </div>

      {/* Cash Momentum Sparkline Widget */}
      <div className="bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#cbd5e1]/60">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-[15px] font-bold text-[#131b2e]">Revenue vs Outflow</h2>
            <p className="text-[12px] text-[#434655]">Monthly velocity comparison</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] text-[#434655]">
              <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span> Rev
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#434655]">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span> Exp
            </div>
          </div>
        </div>

        {/* Inline SVG Sparkline Graph */}
        <div className="w-full h-24 relative mt-1">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 80">
            <line stroke="#E2E8F0" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="320" y1="20" y2="20" />
            <line stroke="#E2E8F0" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="320" y1="50" y2="50" />
            <polygon fill="#ECFDF5" opacity="0.8" points="0,65 50,48 105,52 160,35 215,38 270,18 320,12 320,80 0,80" />
            <path
              d="M0,65 Q25,56 50,48 T105,52 T160,35 T215,38 T270,18 T320,12"
              fill="none"
              stroke="#006c4a"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
            <path
              d="M0,50 Q25,44 50,42 T105,39 T160,46 T215,41 T270,44 T320,38"
              fill="none"
              stroke="#ba1a1a"
              strokeDasharray="4,3"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <circle cx="320" cy="12" fill="#006c4a" r="3.5" />
          </svg>
        </div>
        <div className="flex items-center justify-between text-[#434655] text-[11px] pt-1">
          <span>Wk 1</span>
          <span>Wk 2</span>
          <span>Wk 3</span>
          <span>Wk 4</span>
          <span className="font-semibold text-[#006c4a]">Today</span>
        </div>
      </div>

      {/* Outflow Breakdown Donut Summary */}
      <div className="bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#cbd5e1]/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[15px] font-bold text-[#131b2e]">Capital Allocation</h2>
            <p className="text-[12px] text-[#434655]">Outflow by category</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[11px] text-[#131b2e] font-semibold">
            ₹68.3k Total
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Donut Chart SVG */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="38" stroke="#E2E8F0" strokeWidth="12" />
              {/* Payroll: 47.4% */}
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#0037b0"
                strokeDasharray="113.2 238.7"
                strokeDashoffset="0"
                strokeWidth="12"
              />
              {/* Cloud: 20.8% */}
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#1d4ed8"
                strokeDasharray="49.6 238.7"
                strokeDashoffset="-113.2"
                strokeWidth="12"
              />
              {/* Marketing: 15.4% */}
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#006c4a"
                strokeDasharray="36.7 238.7"
                strokeDashoffset="-162.8"
                strokeWidth="12"
              />
              {/* SaaS: 9.1% */}
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#ba0035"
                strokeDasharray="21.7 238.7"
                strokeDashoffset="-199.5"
                strokeWidth="12"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-[#434655]">Top</span>
              <span className="text-[12px] font-bold text-[#131b2e]">Payroll</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center justify-between text-[#131b2e] text-[12px]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded bg-[#0037b0] shrink-0"></span>
                <span className="truncate">Payroll</span>
              </div>
              <span className="font-semibold text-right tabular-nums">₹32.4k</span>
            </div>
            <div className="flex items-center justify-between text-[#131b2e] text-[12px]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded bg-[#1d4ed8] shrink-0"></span>
                <span className="truncate">Cloud Infra</span>
              </div>
              <span className="font-semibold text-right tabular-nums">₹14.2k</span>
            </div>
            <div className="flex items-center justify-between text-[#131b2e] text-[12px]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded bg-[#006c4a] shrink-0"></span>
                <span className="truncate">Marketing</span>
              </div>
              <span className="font-semibold text-right tabular-nums">₹10.5k</span>
            </div>
            <div className="flex items-center justify-between text-[#131b2e] text-[12px]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded bg-[#ba0035] shrink-0"></span>
                <span className="truncate">SaaS Tools</span>
              </div>
              <span className="font-semibold text-right tabular-nums">₹6.2k</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#cbd5e1]/60 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#131b2e]">Recent Activity</h2>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-[12px] text-[#1d4ed8] font-semibold hover:underline"
          >
            View All ({summary.totalCount})
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onNavigate('transactions')}
              className="flex items-center justify-between p-2 rounded-lg bg-[#faf8ff] hover:bg-[#eaedff]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.amount > 0
                      ? 'bg-[#82f5c1] text-[#005137]'
                      : tx.status === 'flagged'
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : 'bg-[#dae2fd] text-[#1d4ed8]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {tx.amount > 0 ? 'account_balance' : tx.category === 'Cloud' ? 'cloud' : tx.category === 'Payroll' ? 'groups' : 'receipt'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#131b2e] truncate">{tx.counterparty}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                        tx.status === 'flagged'
                          ? 'bg-[#ffdada] text-[#40000c]'
                          : tx.amount > 0
                          ? 'bg-[#85f8c4] text-[#005137]'
                          : 'bg-[#eaedff] text-[#434655]'
                      }`}
                    >
                      {tx.category}
                    </span>
                    <span className="text-[11px] text-[#434655]">{tx.date}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p
                  className={`text-[13px] font-bold tabular-nums font-financial ${
                    tx.amount > 0 ? 'text-[#006c4a]' : 'text-[#ba1a1a]'
                  }`}
                >
                  {tx.amount > 0 ? '+' : '-'}₹ {Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <span
                  className={`text-[11px] font-medium ${
                    tx.status === 'flagged'
                      ? 'text-[#ba1a1a]'
                      : tx.amount > 0
                      ? 'text-[#006c4a]'
                      : 'text-[#434655]'
                  }`}
                >
                  {tx.status === 'flagged' ? 'Flagged Hold' : tx.status === 'pending' ? 'Pending' : 'Cleared'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Strip */}
      <div className="sticky bottom-20 z-40 bg-[#ffffff]/95 backdrop-blur-md rounded-full shadow-lg border border-[#cbd5e1] p-1.5 flex items-center justify-between gap-1.5 max-w-sm mx-auto w-full">
        <button
          onClick={() => setScanModalOpen(true)}
          className="flex-1 py-2 px-2 rounded-full bg-[#eaedff] hover:bg-[#e2e7ff] text-[#131b2e] flex items-center justify-center gap-1 text-[11px] font-semibold active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px] text-[#1d4ed8]">document_scanner</span>
          <span>Scan Invoice</span>
        </button>
        <button
          onClick={() => onNavigate('ai-assistant')}
          className="flex-1 py-2 px-2 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center gap-1 text-[11px] font-semibold shadow-md shadow-[#1d4ed8]/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          <span>Ask AI</span>
        </button>
        <button
          onClick={() => onNavigate('payments')}
          className="flex-1 py-2 px-2 rounded-full bg-[#eaedff] hover:bg-[#e2e7ff] text-[#131b2e] flex items-center justify-center gap-1 text-[11px] font-semibold active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px] text-[#006c4a]">payments</span>
          <span>Payout</span>
        </button>
      </div>

      {/* Simple Scan Modal Simulation */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#283044]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-center shadow-xl border border-[#cbd5e1]">
            <div className="w-12 h-12 rounded-full bg-[#eaedff] text-[#1d4ed8] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">document_scanner</span>
            </div>
            <h3 className="font-bold text-[16px] text-[#131b2e]">Autonomous Invoice Scanner</h3>
            <p className="text-[12px] text-[#434655] mt-1">
              Drag &amp; drop PDF or receipt photo to ingest line items into your audited ledger automatically.
            </p>
            <div className="mt-4 border-2 border-dashed border-[#cbd5e1] rounded-xl p-6 bg-[#f8fafc]">
              <span className="material-symbols-outlined text-[32px] text-[#747686]">cloud_upload</span>
              <p className="text-[12px] text-[#434655] mt-1 font-medium">Select file or take camera photo</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setScanModalOpen(false)}
                className="flex-1 py-2 rounded-lg text-[12px] font-medium text-[#434655] hover:bg-[#eaedff]"
              >
                Close
              </button>
              <button
                disabled={isScanning}
                onClick={handleSimulateOCR}
                className="flex-1 py-2 rounded-lg bg-[#1d4ed8] text-white text-[12px] font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {isScanning && <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>}
                <span>{isScanning ? 'Ingesting Receipt...' : 'Simulate OCR Sync'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
