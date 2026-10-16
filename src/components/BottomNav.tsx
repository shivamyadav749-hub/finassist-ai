import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  return (
    <nav
      aria-label="Application Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe bg-[#faf8ff]/92 backdrop-blur-xl border-t border-[#eaedff]/90 shadow-[0_-2px_14px_rgba(0,0,0,0.06)]"
    >
      <div className="max-w-[500px] mx-auto flex items-center justify-around h-16 px-1">
        {/* 1. Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          aria-current={currentTab === 'dashboard' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'dashboard'
              ? 'text-[#1d4ed8] font-bold'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: currentTab === 'dashboard' ? '"FILL" 1' : '"FILL" 0' }}
          >
            grid_view
          </span>
          <span className="text-[11px] font-medium mt-0.5">Dashboard</span>
        </button>

        {/* 2. Transactions */}
        <button
          onClick={() => onNavigate('transactions')}
          aria-current={currentTab === 'transactions' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'transactions'
              ? 'text-[#1d4ed8] font-bold'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: currentTab === 'transactions' ? '"FILL" 1' : '"FILL" 0' }}
          >
            receipt_long
          </span>
          <span className="text-[11px] font-medium mt-0.5">Transactions</span>
        </button>

        {/* 3. AI Copilot (Center Elevated) */}
        <button
          onClick={() => onNavigate('ai-assistant')}
          aria-current={currentTab === 'ai-assistant' ? 'page' : undefined}
          className="flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] -mt-3 group focus:outline-none"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-95 ${
              currentTab === 'ai-assistant'
                ? 'bg-[#1d4ed8] text-white shadow-[#1d4ed8]/35 ring-2 ring-[#cad3ff]'
                : 'bg-[#1d4ed8] text-white shadow-[#1d4ed8]/25 group-hover:brightness-105'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
          </div>
          <span
            className={`text-[11px] mt-1 font-medium ${
              currentTab === 'ai-assistant' ? 'text-[#1d4ed8] font-bold' : 'text-[#434655]'
            }`}
          >
            AI Copilot
          </span>
        </button>

        {/* 4. Insights */}
        <button
          onClick={() => onNavigate('insights')}
          aria-current={currentTab === 'insights' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'insights'
              ? 'text-[#1d4ed8] font-bold'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: currentTab === 'insights' ? '"FILL" 1' : '"FILL" 0' }}
          >
            trending_up
          </span>
          <span className="text-[11px] font-medium mt-0.5">Insights</span>
        </button>

        {/* 5. Payments */}
        <button
          onClick={() => onNavigate('payments')}
          aria-current={currentTab === 'payments' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'payments'
              ? 'text-[#1d4ed8] font-bold'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: currentTab === 'payments' ? '"FILL" 1' : '"FILL" 0' }}
          >
            account_balance_wallet
          </span>
          <span className="text-[11px] font-medium mt-0.5">Payments</span>
        </button>
      </div>
    </nav>
  );
};
