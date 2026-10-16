import React, { useState } from 'react';
import { FinancialSummary } from '../types';
import { ModalType } from '../components/InfoModal';

interface InsightsViewProps {
  summary: FinancialSummary;
  onTriggerToast: (msg: string) => void;
  onOpenInfoModal: (type: ModalType) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  summary,
  onTriggerToast,
  onOpenInfoModal,
}) => {
  const [timeframe, setTimeframe] = useState<'12m' | 'q3' | 'ytd' | 'prev'>('12m');
  const [appliedRecommendations, setAppliedRecommendations] = useState<string[]>([]);
  const [unlockedSavings, setUnlockedSavings] = useState(48650);

  const handleApplyAction = (recId: string, amount: number, title: string) => {
    if (appliedRecommendations.includes(recId)) return;
    setAppliedRecommendations((prev) => [...prev, recId]);
    setUnlockedSavings((prev) => prev + amount);
    onTriggerToast(`Applied optimization: ${title}. Potential annual savings secured.`);
  };

  const handleExportCFOReport = () => {
    window.location.href = '/api/reports/cfo-export';
    onTriggerToast('Downloading CFO Executive Risk & Runway Briefing report...');
  };

  return (
    <div className="w-full max-w-[440px] md:max-w-[760px] lg:max-w-[960px] mx-auto px-4 pb-28 pt-2 flex flex-col gap-4 text-left">
      {/* Top Command Context Bar */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e2e7ff] text-[#434655] text-[11px] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#006c4a] animate-pulse"></span>
            <span className="font-bold text-[#131b2e]">AI Model v4.8 Active</span>
          </div>
          <button
            onClick={handleExportCFOReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#cbd5e1] text-[#1d4ed8] text-[12px] font-semibold active:bg-[#eaedff] transition-colors shadow-xs min-h-[38px]"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export CFO
          </button>
        </div>

        <div>
          <div className="flex items-center gap-1 text-[11px] text-[#434655] uppercase tracking-wider font-semibold">
            <span>Overview</span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#1d4ed8]">Analytics</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#131b2e] tracking-tight mt-0.5 leading-tight">
            Financial Insights &amp; Performance
          </h1>
          <p className="text-[12px] text-[#434655] mt-0.5">
            Autonomous risk modeling, cash burn curves &amp; decile benchmarks
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setTimeframe('12m')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all shadow-xs ${
              timeframe === '12m'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'bg-white border border-[#cbd5e1] text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            Trailing 12M
          </button>
          <button
            onClick={() => setTimeframe('q3')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              timeframe === 'q3'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'bg-white border border-[#cbd5e1] text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            Q3 2024
          </button>
          <button
            onClick={() => setTimeframe('ytd')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              timeframe === 'ytd'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'bg-white border border-[#cbd5e1] text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            YTD
          </button>
          <button
            onClick={() => setTimeframe('prev')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              timeframe === 'prev'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'bg-white border border-[#cbd5e1] text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            vs Prev Year
          </button>
        </div>
      </div>

      {/* Macro Financial Health Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card 1: Health Index */}
        <div className="col-span-2 p-4 rounded-xl bg-white border border-[#cbd5e1]/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#434655] font-semibold">
                Financial Health
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#85f8c4] text-[#005137]">
                AAA Tier
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-[28px] font-bold text-[#131b2e] tabular-nums font-financial">
                92<span className="text-[#434655] text-[14px] font-normal">/100</span>
              </span>
              <span className="inline-flex items-center text-[11px] text-[#006c4a] font-bold">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> +4 pts vs last quarter
              </span>
            </div>
            <span className="text-[11px] text-[#434655] flex items-center gap-1">
              <span className="material-symbols-outlined text-[#006c4a] text-[14px]">shield</span>
              Top 2% capital resilience among Series B
            </span>
          </div>

          {/* Ring Progress */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle className="stroke-[#eaedff]" cx="18" cy="18" fill="none" r="14.5" strokeWidth="3.2" />
              <circle
                className="stroke-[#006c4a]"
                cx="18"
                cy="18"
                fill="none"
                r="14.5"
                strokeDasharray="91.1"
                strokeDashoffset="7.3"
                strokeLinecap="round"
                strokeWidth="3.2"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#006c4a] text-[22px]">verified</span>
            </div>
          </div>
        </div>

        {/* Card 2: Operating Efficiency */}
        <div className="p-3.5 rounded-xl bg-white border border-[#cbd5e1]/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#434655] uppercase font-semibold">Op. Efficiency</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eaedff] text-[#1d4ed8]">
                Top 10% SaaS
              </span>
            </div>
            <div className="text-[22px] font-bold text-[#131b2e] mt-1.5 tabular-nums font-financial">1.83x</div>
            <div className="text-[11px] text-[#434655]">Rev / OpEx Ratio</div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eaedff]">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#006c4a] font-bold">+35.5% delta</span>
              <span className="text-[#434655]">Peer: 1.35x</span>
            </div>
            <div className="w-full bg-[#eaedff] rounded-full h-1.5 mt-1 overflow-hidden">
              <div className="bg-[#006c4a] h-full rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Cash Buffer */}
        <div className="p-3.5 rounded-xl bg-white border border-[#cbd5e1]/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#434655] uppercase font-semibold">Cash Buffer</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#85f8c4] text-[#005137]">
                Safe Zone
              </span>
            </div>
            <div className="text-[22px] font-bold text-[#131b2e] mt-1.5 tabular-nums font-financial">
              ₹ 394,200
            </div>
            <div className="text-[11px] text-[#434655]">18.4 Mos Runway eq.</div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eaedff] flex items-center justify-between">
            <span className="text-[10px] text-[#434655]">Confidence</span>
            <span className="text-[11px] text-[#1d4ed8] font-bold tabular-nums">99.4% stat.</span>
          </div>
        </div>
      </div>

      {/* Revenue vs Expense Forecast */}
      <div className="p-4 rounded-xl bg-white border border-[#cbd5e1]/80 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#434655] font-semibold">
              Runway &amp; Trajectory
            </span>
            <h2 className="text-[15px] text-[#131b2e] font-bold">Revenue vs Expense Forecast</h2>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0037b0] bg-[#dce1ff] px-2 py-0.5 rounded-md">
            <span className="material-symbols-outlined text-[14px]">smart_toy</span> 90D Projection
          </span>
        </div>

        {/* Chart Graphics */}
        <div className="mt-3 relative">
          <div className="flex justify-between text-[10px] text-[#434655] pb-1 font-semibold">
            <span>May</span>
            <span>Jul</span>
            <span className="text-[#131b2e] font-bold">Sep (Now)</span>
            <span className="text-[#1d4ed8] font-bold">Nov (AI)</span>
            <span className="text-[#1d4ed8] font-bold">Jan '25</span>
          </div>

          <svg className="w-full h-36" fill="none" viewBox="0 0 340 140">
            <defs>
              <linearGradient id="corridorGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* Grid */}
            <line stroke="#eaedff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="340" y1="25" y2="25" />
            <line stroke="#eaedff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="340" y1="70" y2="70" />
            <line stroke="#eaedff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="340" y1="115" y2="115" />

            {/* Vertical dividing line for today */}
            <line opacity="0.7" stroke="#747686" strokeDasharray="2 2" strokeWidth="1.2" x1="170" x2="170" y1="10" y2="135" />
            <rect fill="#faf8ff" height="14" rx="2" width="34" x="153" y="4" />
            <text fill="#434655" fontSize="9" fontWeight="600" textAnchor="middle" x="170" y="14">
              TODAY
            </text>

            {/* Shaded 90-day corridor */}
            <polygon fill="url(#corridorGrad)" points="170,55 250,30 330,18 330,58 250,72 170,55" />
            <path d="M 170 55 Q 250 30, 330 18" fill="none" opacity="0.6" stroke="#1d4ed8" strokeDasharray="2 2" strokeWidth="1" />
            <path d="M 170 55 Q 250 72, 330 58" fill="none" opacity="0.6" stroke="#1d4ed8" strokeDasharray="2 2" strokeWidth="1" />

            {/* Revenue Historical */}
            <path d="M 10 98 Q 90 85, 170 55" fill="none" stroke="#006c4a" strokeLinecap="round" strokeWidth="2.5" />
            {/* Revenue Projected */}
            <path d="M 170 55 Q 250 42, 330 25" fill="none" stroke="#006c4a" strokeDasharray="4 3" strokeLinecap="round" strokeWidth="2.5" />

            {/* OpEx */}
            <path d="M 10 110 Q 90 102, 170 94" fill="none" stroke="#ba1a1a" strokeLinecap="round" strokeWidth="2" />
            <path d="M 170 94 Q 250 90, 330 84" fill="none" stroke="#ba1a1a" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="2" />

            {/* Dots */}
            <circle cx="170" cy="55" fill="#006c4a" r="4.5" stroke="#ffffff" strokeWidth="2" />
            <circle cx="330" cy="25" fill="#1d4ed8" r="4" stroke="#ffffff" strokeWidth="2" />
            <circle cx="170" cy="94" fill="#ba1a1a" r="4" stroke="#ffffff" strokeWidth="2" />
          </svg>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[#006c4a] font-semibold">
                <span className="w-2.5 h-1 bg-[#006c4a] rounded-full inline-block"></span> Revenue
              </span>
              <span className="flex items-center gap-1 text-[#ba1a1a] font-semibold">
                <span className="w-2.5 h-1 bg-[#ba1a1a] rounded-full inline-block"></span> OpEx Line
              </span>
            </div>
            <span className="text-[#1d4ed8] text-[11px] font-semibold">
              Conf. Interval <strong className="font-bold">±4.1%</strong>
            </span>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="mt-3 pt-3 border-t border-[#eaedff] grid grid-cols-2 gap-2 bg-[#f2f3ff]/70 p-2.5 rounded-lg">
          <div>
            <span className="text-[11px] text-[#434655] block">Projected Net ARR</span>
            <div className="text-[14px] text-[#131b2e] font-bold mt-0.5 tabular-nums font-financial">
              ₹ 1.92M <span className="text-[#006c4a] text-[11px] font-bold">+24% YoY</span>
            </div>
          </div>
          <div>
            <span className="text-[11px] text-[#434655] block">Average Burn Rate</span>
            <div className="text-[14px] text-[#ba1a1a] font-bold mt-0.5 tabular-nums font-financial">
              -₹ 21,400<span className="text-[#434655] font-normal text-[11px]">/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Autonomous Recommendations */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-[#1d4ed8] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
            </div>
            <h2 className="text-[17px] font-bold text-[#131b2e]">AI Recommendations</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#85f8c4] text-[#005137] text-[11px] font-bold tabular-nums">
            +₹ {unlockedSavings.toLocaleString()}/yr unlocked
          </span>
        </div>

        {/* Recommendation Cards */}
        <div className="flex flex-col gap-3">
          {/* Card 1 */}
          <div className="p-3.5 rounded-xl bg-white border border-[#cbd5e1]/80 shadow-xs relative overflow-hidden flex flex-col gap-2">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1d4ed8]"></div>
            <div className="flex items-start justify-between pl-1">
              <div>
                <span className="text-[10px] text-[#434655] uppercase tracking-wider font-semibold">
                  SaaS License Audit
                </span>
                <h3 className="font-bold text-[14px] text-[#131b2e]">Consolidate Cloud Seats</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#85f8c4]/80 text-[#005137] text-[11px] font-bold tabular-nums">
                +₹ 14,200/yr
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-[#434655] pl-1">
              18 inactive Snowflake &amp; Datadog seats detected without queries in 45 days. Auto-deprovisioning eliminates recurring waste immediately.
            </p>
            <div className="flex items-center gap-2 pl-1 pt-1">
              <button
                onClick={() => handleApplyAction('cloud_seats', 14200, 'Consolidate Cloud Seats')}
                className={`flex-1 min-h-[38px] px-3 rounded-lg text-[12px] font-semibold text-center shadow-xs transition-transform flex items-center justify-center gap-1 ${
                  appliedRecommendations.includes('cloud_seats')
                    ? 'bg-[#82f5c1] text-[#005137]'
                    : 'bg-[#1d4ed8] text-white hover:bg-[#0037b0] active:scale-[0.98]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {appliedRecommendations.includes('cloud_seats') ? 'check' : 'bolt'}
                </span>
                <span>{appliedRecommendations.includes('cloud_seats') ? 'Action Applied' : 'Apply Action'}</span>
              </button>
              <button
                onClick={() => onTriggerToast('Recommendation archived')}
                className="min-h-[38px] px-3 rounded-lg bg-[#eaedff] text-[#434655] text-[12px] font-semibold hover:bg-[#dae2fd] transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-3.5 rounded-xl bg-white border border-[#cbd5e1]/80 shadow-xs relative overflow-hidden flex flex-col gap-2">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1d4ed8]"></div>
            <div className="flex items-start justify-between pl-1">
              <div>
                <span className="text-[10px] text-[#434655] uppercase tracking-wider font-semibold">
                  Working Capital Optimization
                </span>
                <h3 className="font-bold text-[14px] text-[#131b2e]">Adjust Net-30: Apex Media</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#85f8c4]/80 text-[#005137] text-[11px] font-bold tabular-nums">
                +₹ 28,000 buffer
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-[#434655] pl-1">
              Shift terms to Net-45 based on historic prompt-payment index. Releases immediate cash reserves and expands buffer window.
            </p>
            <div className="flex items-center gap-2 pl-1 pt-1">
              <button
                onClick={() => onOpenInfoModal('contract-draft')}
                className="flex-1 min-h-[38px] px-3 rounded-lg bg-[#eaedff] text-[#0037b0] text-[12px] font-semibold text-center hover:bg-[#dae2fd] transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                <span>Review Draft</span>
              </button>
              <button
                onClick={() => onTriggerToast('Options: Edit vendor contract, Request early-pay discount')}
                className="min-h-[38px] min-w-[38px] rounded-lg text-[#434655] hover:text-[#131b2e] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-3.5 rounded-xl bg-white border border-[#cbd5e1]/80 shadow-xs relative overflow-hidden flex flex-col gap-2">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006c4a]"></div>
            <div className="flex items-start justify-between pl-1">
              <div>
                <span className="text-[10px] text-[#434655] uppercase tracking-wider font-semibold">
                  Yield Enhancement
                </span>
                <h3 className="font-bold text-[14px] text-[#131b2e]">Shift Idle Vault Cash</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#85f8c4]/80 text-[#005137] text-[11px] font-bold tabular-nums">
                +₹ 6,450 yield
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-[#434655] pl-1">
              Move ₹1,50,000 non-operating checking reserves into high-yield liquid treasury vault (7.2% yield) with full liquidity access.
            </p>
            <div className="flex items-center gap-2 pl-1 pt-1">
              <button
                onClick={() => handleApplyAction('t_bill_vault', 6450, 'Shift Idle Vault Cash')}
                className="flex-1 min-h-[38px] px-3 rounded-lg bg-[#006c4a] text-white text-[12px] font-semibold text-center shadow-xs active:scale-[0.98] transition-transform flex items-center justify-center gap-1 hover:bg-[#005137]"
              >
                <span className="material-symbols-outlined text-[16px]">account_balance</span>
                <span>Explore Integration</span>
              </button>
              <button
                onClick={() => onOpenInfoModal('treasury-details')}
                className="min-h-[38px] px-3 rounded-lg bg-[#eaedff] text-[#434655] text-[12px] font-semibold hover:bg-[#dae2fd] transition-colors"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Volatility & Anomaly Index */}
      <div className="p-4 rounded-xl bg-white border border-[#cbd5e1]/80 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#eaedff]">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#434655] font-semibold">
              Variance Radar
            </span>
            <h2 className="text-[15px] font-bold text-[#131b2e]">Expense Volatility &amp; Anomaly Index</h2>
          </div>
          <span className="material-symbols-outlined text-[#747686] text-[20px]">troubleshoot</span>
        </div>

        <div className="mt-3 flex flex-col gap-3.5">
          {/* Item 1 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[#131b2e] flex items-center gap-1.5 truncate pr-2">
                <span className="w-2 h-2 rounded-full bg-[#1d4ed8]"></span>
                Cloud &amp; Infrastructure (AWS, Snowflake, Vercel)
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-1.5 py-0.2 rounded bg-[#eaedff] text-[10px] text-[#131b2e] font-semibold">
                  Moderate
                </span>
                <span className="font-bold text-[#131b2e] tabular-nums">14.2% σ</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-[#eaedff] overflow-hidden">
              <div className="h-full bg-[#1d4ed8] rounded-full" style={{ width: '48%' }}></div>
            </div>
            <span className="text-[11px] text-[#434655]">+₹3,820 unallocated compute job detected on Sept 14</span>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[#131b2e] flex items-center gap-1.5 truncate pr-2">
                <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
                Payroll &amp; Executive Salaries (Gusto)
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-1.5 py-0.2 rounded bg-[#85f8c4] text-[#005137] text-[10px] font-bold">
                  Very Low
                </span>
                <span className="font-bold text-[#006c4a] tabular-nums">1.1% σ</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-[#eaedff] overflow-hidden">
              <div className="h-full bg-[#006c4a] rounded-full" style={{ width: '12%' }}></div>
            </div>
            <span className="text-[11px] text-[#434655]">All 32 salaries aligned with FY24 planned headcount</span>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[#131b2e] flex items-center gap-1.5 truncate pr-2">
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                Advertising &amp; Customer Acquisition (Google, Meta)
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-1.5 py-0.2 rounded bg-[#ffdad6] text-[#93000a] text-[10px] font-bold">
                  High Volatility
                </span>
                <span className="font-bold text-[#ba1a1a] tabular-nums">31.8% σ</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-[#eaedff] overflow-hidden">
              <div className="h-full bg-[#ba1a1a] rounded-full" style={{ width: '82%' }}></div>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-[#ba1a1a] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">warning</span> Bidding surge detected
              </span>
              <button
                onClick={() => onTriggerToast('Ad set budget cap applied: ₹4,500/wk active in Google Ads API.')}
                className="text-[#1d4ed8] font-bold hover:underline"
              >
                Cap Ad Sets at ₹4,500/wk →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Peer Benchmarking */}
      <div className="p-4 rounded-xl bg-white border border-[#cbd5e1]/80 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#eaedff]">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#434655] font-semibold">
              SaaS Peer Group
            </span>
            <h2 className="text-[15px] font-bold text-[#131b2e]">Industry Peer Benchmarking</h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e2e7ff] text-[#131b2e]">
            B2B ₹1 Cr - ₹5 Cr ARR
          </span>
        </div>

        {/* Peer 1 */}
        <div className="py-2.5 border-b border-[#eaedff] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-[#131b2e]">Gross Margin</span>
            <span className="text-[11px] text-[#006c4a] font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px]">arrow_upward</span> Top Decile (+600 bps)
            </span>
          </div>
          <div className="text-right">
            <div className="text-[14px] font-bold text-[#131b2e] tabular-nums">74.0%</div>
            <div className="text-[11px] text-[#434655]">Median: 68.0%</div>
          </div>
        </div>

        {/* Peer 2 */}
        <div className="py-2.5 border-b border-[#eaedff] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-[#131b2e]">CAC Payback Time</span>
            <span className="text-[11px] text-[#006c4a] font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px]">speed</span> 2.0x faster conversion
            </span>
          </div>
          <div className="text-right">
            <div className="text-[14px] font-bold text-[#006c4a] tabular-nums">7.2 Mos</div>
            <div className="text-[11px] text-[#434655]">Median: 14.5 Mos</div>
          </div>
        </div>

        {/* Peer 3 */}
        <div className="pt-2.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-[#131b2e]">Cash Runway</span>
            <span className="text-[11px] text-[#1d4ed8] font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px]">verified_user</span> Extended Buffer
            </span>
          </div>
          <div className="text-right">
            <div className="text-[14px] font-bold text-[#131b2e] tabular-nums">18.0 Mos</div>
            <div className="text-[11px] text-[#434655]">Median: 11.0 Mos</div>
          </div>
        </div>
      </div>
    </div>
  );
};
