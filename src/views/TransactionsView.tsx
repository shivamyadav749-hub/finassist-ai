import React, { useState } from 'react';
import { FinancialSummary, TransactionItem } from '../types';

interface TransactionsViewProps {
  summary: FinancialSummary;
  transactions: TransactionItem[];
  onOpenAddModal: () => void;
  onUpdateStatus: (id: string, newStatus: 'settled' | 'pending' | 'flagged', reason?: string) => Promise<void>;
  onDeleteTransaction?: (id: string) => Promise<void>;
  onTriggerToast: (msg: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  summary,
  transactions,
  onOpenAddModal,
  onUpdateStatus,
  onDeleteTransaction,
  onTriggerToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'settled' | 'pending' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filter !== 'all' && tx.status !== filter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.counterparty.toLowerCase().includes(q) ||
      tx.refId.toLowerCase().includes(q) ||
      tx.category.toLowerCase().includes(q) ||
      String(tx.amount).includes(q)
    );
  });

  const handleSyncBanks = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onTriggerToast('Ledger reconciled: 6 financial feeds verified via read-only Plaid');
    }, 1200);
  };

  const handleExportCSV = () => {
    const header = 'ID,Reference,Counterparty,Category,Amount,Currency,Date,Status,PaymentMethod,IsDemo\n';
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.id}","${t.refId}","${t.counterparty}","${t.category}","${t.amount}","${t.currency}","${t.date}","${t.status}","${t.paymentMethod}","${t.isDemo ? 'DEMO' : 'LIVE'}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `finassist_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onTriggerToast('Exported verified ledger CSV from Firestore.');
  };

  const handleDispute = async (tx: TransactionItem) => {
    await onUpdateStatus(tx.id, 'settled', 'Dispute lodged: Credit memo request posted to vendor.');
    onTriggerToast(`Dispute opened for ${tx.counterparty}. Credit memo generated.`);
  };

  const handleReview = async (tx: TransactionItem) => {
    setSelectedTx(tx);
  };

  return (
    <div className="w-full max-w-[440px] md:max-w-[760px] lg:max-w-[960px] mx-auto px-4 pb-28 pt-2 flex flex-col gap-3 text-left">
      {/* Interactive Audit Status & Liquidity Overview */}
      <div className="bg-[#eaedff] rounded-xl p-3.5 shadow-xs border border-[#cbd5e1]/50 relative overflow-hidden">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#0037b0] text-[18px]">verified_user</span>
            <span className="text-[12px] font-bold text-[#131b2e]">Ledger Audit Ready</span>
          </div>
          <span className="text-[11px] text-[#434655] flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a] animate-pulse"></span>
            Live Feed
          </span>
        </div>

        {/* Liquidity Balance Strip */}
        <div className="grid grid-cols-2 gap-2 pt-1.5">
          <div className="bg-white p-2.5 rounded-lg flex flex-col shadow-xs border border-[#cbd5e1]/40">
            <span className="text-[11px] text-[#434655]">Settled Liquidity</span>
            <span className="text-[16px] font-bold text-[#006c4a] tabular-nums font-financial mt-0.5">
              ₹ {summary.settledLiquidity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-lg flex flex-col shadow-xs border border-[#cbd5e1]/40">
            <span className="text-[11px] text-[#434655]">Pending In-Flight</span>
            <span className="text-[16px] font-bold text-[#1d4ed8] tabular-nums font-financial mt-0.5">
              ₹ {summary.pendingLiquidity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Search & Filter Toolbar */}
      <div className="sticky top-14 z-30 pt-1 pb-1 bg-[#faf8ff]/95 backdrop-blur-md space-y-2 border-b border-[#eaedff]/60">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search counterparty, ref, amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-[#131b2e] placeholder:text-[#747686] text-[13px] pl-9 pr-8 py-2 rounded-lg border border-[#cbd5e1]/80 shadow-xs focus:outline-none focus:border-[#1d4ed8]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-[#747686] hover:text-[#131b2e] p-1"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>
          <button
            onClick={onOpenAddModal}
            className="bg-[#1d4ed8] text-white min-h-[38px] px-3 rounded-lg shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-all text-[12px] font-semibold hover:bg-[#0037b0]"
            title="Record New Transaction"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Scrollable Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setFilter('all')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-xs flex items-center gap-1.5 shrink-0 transition-all ${
              filter === 'all'
                ? 'bg-[#1d4ed8] text-white'
                : 'bg-white text-[#434655] border border-[#cbd5e1]/60 hover:bg-[#eaedff]'
            }`}
          >
            <span>All</span>
            <span className="bg-[#0037b0]/30 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {summary.totalCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('settled')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-xs flex items-center gap-1.5 shrink-0 transition-all ${
              filter === 'settled'
                ? 'bg-[#1d4ed8] text-white'
                : 'bg-white text-[#434655] border border-[#cbd5e1]/60 hover:bg-[#eaedff]'
            }`}
          >
            <span>Settled</span>
            <span className="bg-[#eaedff] text-[#131b2e] px-1.5 py-0.2 rounded-full text-[10px]">
              {summary.settledCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-xs flex items-center gap-1.5 shrink-0 transition-all ${
              filter === 'pending'
                ? 'bg-[#1d4ed8] text-white'
                : 'bg-white text-[#434655] border border-[#cbd5e1]/60 hover:bg-[#eaedff]'
            }`}
          >
            <span>Pending</span>
            <span className="bg-[#eaedff] text-[#131b2e] px-1.5 py-0.2 rounded-full text-[10px]">
              {summary.pendingCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('flagged')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-xs flex items-center gap-1.5 shrink-0 transition-all ${
              filter === 'flagged'
                ? 'bg-[#ba1a1a] text-white'
                : 'bg-white text-[#ba1a1a] border border-[#ffdad6] hover:bg-[#ffdad6]/40'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>Flagged</span>
            <span className="bg-[#ffdad6] text-[#93000a] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {summary.flaggedCount} Anomaly
            </span>
          </button>
        </div>
      </div>

      {/* AI Ledger Anomaly Notification Banner */}
      <div className="bg-gradient-to-r from-[#dae2fd] to-[#eaedff] rounded-lg p-2.5 flex items-start gap-2 shadow-xs border border-[#cad3ff]">
        <div className="w-6 h-6 rounded-full bg-[#0037b0] flex items-center justify-center shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-white text-[14px]">auto_awesome</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#131b2e] font-bold">AI Auditor Insight</p>
            <span className="text-[10px] text-[#434655]">Just now</span>
          </div>
          <p className="text-[12px] text-[#434655] mt-0.5 leading-snug">
            2 unusual duplicate invoices identified in Software &amp; Marketing categories. Action required.
          </p>
        </div>
      </div>

      {/* Transactions List Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <span className="text-[11px] text-[#434655] uppercase tracking-wider font-semibold">
          OCTOBER 2024
        </span>
        <button className="flex items-center gap-0.5 text-[11px] text-[#0037b0] font-medium hover:underline">
          <span>Latest first</span>
          <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
        </button>
      </div>

      {/* Transaction Card Items Stack */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-[#cbd5e1] text-[#434655]">
            <span className="material-symbols-outlined text-[32px] text-[#747686] mb-1">search_off</span>
            <p className="font-semibold text-[14px]">No transactions match your filter</p>
            <button
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 text-[12px] text-[#1d4ed8] font-bold hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className={`rounded-xl p-3.5 shadow-xs border transition-all cursor-pointer flex flex-col gap-2 ${
                tx.status === 'flagged'
                  ? 'bg-gradient-to-r from-[#ffdad6]/25 to-white border-[#ffdad6]'
                  : 'bg-white border-[#cbd5e1]/60 hover:border-[#1d4ed8]/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.amount > 0
                        ? 'bg-[#85f8c4] text-[#002114]'
                        : tx.status === 'flagged'
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : 'bg-[#eaedff] text-[#0037b0]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {tx.amount > 0
                        ? 'south_west'
                        : tx.category === 'Marketing'
                        ? 'campaign'
                        : tx.category === 'Cloud'
                        ? 'cloud'
                        : tx.category === 'Payroll'
                        ? 'groups'
                        : tx.category === 'Office & Facilities'
                        ? 'apartment'
                        : 'receipt'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-[14px] text-[#131b2e] truncate">{tx.counterparty}</h4>
                      {tx.status === 'flagged' && (
                        <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">priority_high</span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#434655]">
                      {tx.category} • {tx.date}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[14px] font-bold tabular-nums font-financial ${
                      tx.amount > 0 ? 'text-[#006c4a]' : tx.status === 'flagged' ? 'text-[#ba1a1a]' : 'text-[#131b2e]'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : '-'}₹ {Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="mt-1 flex justify-end">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        tx.status === 'settled'
                          ? 'bg-[#82f5c1] text-[#005137]'
                          : tx.status === 'flagged'
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : 'bg-[#eaedff] text-[#434655]'
                      }`}
                    >
                      {tx.status === 'settled' && <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>}
                      {tx.status === 'flagged' && <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-ping"></span>}
                      {tx.status === 'settled' ? 'Settled' : tx.status === 'flagged' ? 'Flagged Anomaly' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Anomaly Bar if flagged */}
              {tx.anomalyReason && tx.status === 'flagged' && (
                <div className="bg-[#faf8ff] p-2 rounded-lg flex items-center justify-between text-[11px] border border-[#eaedff]">
                  <span className="text-[#ba1a1a] font-medium flex items-center gap-1 truncate pr-2">
                    <span className="material-symbols-outlined text-[14px] shrink-0">psychology</span>
                    <span className="truncate">{tx.anomalyReason}</span>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReview(tx);
                      }}
                      className="text-[#0037b0] font-semibold hover:underline"
                    >
                      Review
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDispute(tx);
                      }}
                      className="text-[#ba1a1a] font-semibold hover:underline"
                    >
                      Dispute
                    </button>
                  </div>
                </div>
              )}

              {/* Pending clearance note */}
              {tx.status === 'pending' && (
                <div className="pt-1 flex items-center justify-between text-[#434655] text-[11px]">
                  <span className="text-[#747686]">Processing bank clearance (Est. 24h)</span>
                  <span className="material-symbols-outlined text-[16px] text-[#747686]">chevron_right</span>
                </div>
              )}

              {/* Settled Ref */}
              {tx.status === 'settled' && (
                <div className="pt-1 flex items-center justify-between text-[#434655] text-[11px]">
                  <span className="text-[#747686]">
                    Ref: {tx.refId} • {tx.paymentMethod}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#747686]">chevron_right</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination state */}
      <div className="pt-2 pb-6 flex flex-col items-center justify-center gap-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaedff] text-[#434655] text-[11px] font-medium">
          <span>Showing {filteredTransactions.length} of {summary.totalCount} entries</span>
        </div>
        <button
          onClick={() => onTriggerToast('All records synced up-to-date with live cloud ledger.')}
          className="text-[12px] text-[#0037b0] font-semibold hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">keyboard_double_arrow_down</span>
          Load older ledger records
        </button>
      </div>

      {/* Floating Action Control Bar */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pointer-events-none z-40 flex justify-center">
        <div className="pointer-events-auto bg-[#283044]/95 backdrop-blur-md text-[#eef0ff] rounded-full shadow-xl p-1.5 flex items-center gap-1.5 border border-[#c4c5d7]/20">
          <button
            onClick={handleSyncBanks}
            disabled={isSyncing}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#1d4ed8] text-white text-[12px] font-semibold shadow-sm hover:brightness-110 active:scale-95 transition-all"
          >
            <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isSyncing ? 'Syncing...' : 'Sync Banks'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[#eef0ff] hover:bg-[#dae2fd]/20 text-[12px] font-medium active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Record</span>
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-[#283044]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-[#cbd5e1] text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">warning</span>
                <h3 className="font-bold text-[15px] text-[#131b2e]">Audit Investigation</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded hover:bg-[#eaedff] flex items-center justify-center text-[#434655]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="my-3 space-y-2 text-[12px]">
              <div>
                <span className="text-[#434655]">Counterparty:</span>
                <p className="font-bold text-[14px] text-[#131b2e]">{selectedTx.counterparty}</p>
              </div>
              <div>
                <span className="text-[#434655]">Amount &amp; Category:</span>
                <p className="font-bold text-[#ba1a1a]">₹ {Math.abs(selectedTx.amount).toLocaleString()} ({selectedTx.category})</p>
              </div>
              <div className="p-2.5 rounded bg-[#ffdad6]/40 text-[#93000a] text-[11px] font-medium">
                AI Reasoning: {selectedTx.anomalyReason || 'Outflow exceeds monthly projected variance.'}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                {selectedTx.status === 'flagged' ? (
                  <>
                    <button
                      onClick={() => {
                        handleDispute(selectedTx);
                        setSelectedTx(null);
                      }}
                      className="flex-1 py-2 rounded-lg bg-[#ba1a1a] text-white text-[12px] font-semibold hover:brightness-110 active:scale-95 transition-all"
                    >
                      Dispute Charge
                    </button>
                    <button
                      onClick={async () => {
                        await onUpdateStatus(selectedTx.id, 'settled', undefined);
                        onTriggerToast(`Approved ${selectedTx.counterparty} as verified expense.`);
                        setSelectedTx(null);
                      }}
                      className="flex-1 py-2 rounded-lg bg-[#eaedff] text-[#0037b0] text-[12px] font-semibold hover:bg-[#d8e2fd] active:scale-95 transition-all"
                    >
                      Mark Cleared
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        const newStatus = selectedTx.status === 'settled' ? 'pending' : 'settled';
                        await onUpdateStatus(selectedTx.id, newStatus, undefined);
                        onTriggerToast(`Marked ${selectedTx.counterparty} as ${newStatus}.`);
                        setSelectedTx(null);
                      }}
                      className="flex-1 py-2 rounded-lg bg-[#eaedff] text-[#0037b0] text-[12px] font-semibold hover:bg-[#d8e2fd] active:scale-95 transition-all"
                    >
                      Toggle {selectedTx.status === 'settled' ? 'Pending' : 'Settled'}
                    </button>
                    <button
                      onClick={async () => {
                        await onUpdateStatus(selectedTx.id, 'flagged', 'Flagged for audit review by finance manager');
                        onTriggerToast(`Flagged ${selectedTx.counterparty} for audit review.`);
                        setSelectedTx(null);
                      }}
                      className="flex-1 py-2 rounded-lg bg-[#ffdad6] text-[#93000a] text-[12px] font-semibold hover:brightness-95 active:scale-95 transition-all"
                    >
                      Flag for Audit
                    </button>
                  </>
                )}
              </div>

              {onDeleteTransaction && (
                <button
                  onClick={async () => {
                    await onDeleteTransaction(selectedTx.id);
                    onTriggerToast(`Removed transaction for ${selectedTx.counterparty}`);
                    setSelectedTx(null);
                  }}
                  className="w-full py-1.5 rounded-lg border border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 text-[11px] font-medium transition-colors"
                >
                  Delete Transaction
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
