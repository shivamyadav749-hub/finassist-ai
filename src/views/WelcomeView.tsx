import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { ModalType } from '../components/InfoModal';

interface WelcomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onSimulatePayroll?: () => void;
  onOpenInfoModal: (type: ModalType) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onNavigate,
  onSimulatePayroll,
  onOpenInfoModal,
}) => {
  const [simulatedPayrollOutput, setSimulatedPayrollOutput] = useState<string | null>(null);

  const handleSimulateMini = () => {
    setSimulatedPayrollOutput(
      'Monte Carlo variance simulation for 3 engineering hires running... Runway impact: -1.2 months (contracts from 18.4 down to 17.2 mos). Estimated burn increases +₹28,500/mo.'
    );
  };

  return (
    <div className="w-full max-w-[440px] md:max-w-[760px] lg:max-w-[960px] mx-auto px-4 pb-20 pt-2 flex flex-col">
      {/* Sticky Micro-Nav / Anchor Controls */}
      <nav className="sticky top-14 z-40 -mx-4 px-4 py-2 bg-[#faf8ff]/90 backdrop-blur-md mb-4 flex items-center justify-between border-b border-[#eaedff]/60">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#006c4a] animate-pulse"></span>
          <span className="text-[11px] text-[#006c4a] font-bold uppercase tracking-wider">Engine Live</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#features"
            className="text-[12px] text-[#434655] hover:text-[#0037b0] px-2 py-1 flex items-center font-medium"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-[12px] text-[#434655] hover:text-[#0037b0] px-2 py-1 flex items-center font-medium"
          >
            Pricing
          </a>
          <button
            onClick={() => onNavigate('signin')}
            className="bg-[#0037b0] text-white text-[12px] px-3.5 h-8 rounded-lg flex items-center justify-center transition-transform active:scale-95 shadow-sm font-semibold hover:bg-[#1d4ed8]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col pt-1 pb-6 text-left">
        {/* Version Tag */}
        <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-[#eaedff] text-[#0037b0] mb-3">
          <span className="material-symbols-outlined text-[14px]">bolt</span>
          <span className="text-[11px] font-bold tracking-wide">AI Financial Intelligence v4.8</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-[28px] md:text-[36px] font-bold text-[#131b2e] leading-tight tracking-tight mb-2">
          Autonomous Financial Intelligence for Growing Businesses
        </h1>
        <p className="text-[14px] md:text-[16px] text-[#434655] leading-relaxed mb-5">
          Real-time cash runway forecasting, autonomous expense anomaly detection, and automated CFO insights built for modern founders.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full mb-2" id="cta">
          <button
            onClick={() => onNavigate('signin')}
            className="w-full sm:flex-1 min-h-[48px] bg-[#1d4ed8] text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-[#0037b0] active:scale-[0.98] transition-all"
          >
            <span>Start Free 14-Day Trial</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenInfoModal('schedule-demo')}
            className="w-full sm:flex-1 min-h-[48px] bg-[#e2e7ff] text-[#131b2e] rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#dae2fd] active:scale-[0.98] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0037b0]">calendar_month</span>
            <span>Book Live Demo</span>
          </button>
        </div>

        {/* Trust Microcopy */}
        <div className="flex items-center justify-center gap-1.5 py-1 text-[#434655]">
          <span className="material-symbols-outlined text-[15px] text-[#006c4a]">verified_user</span>
          <span className="text-[11px]">No credit card required • Instant bank sync via Plaid</span>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-3 mb-4">
        <div className="bg-[#f2f3ff] rounded-xl p-3.5 flex flex-col items-center text-center">
          <p className="text-[10px] text-[#434655] font-semibold tracking-wider uppercase mb-2">
            TRUSTED BY 2,500+ HIGH-GROWTH STARTUPS &amp; SMBs
          </p>
          <div className="flex items-center justify-around w-full opacity-80 pt-1 text-[#747686] font-bold text-[18px] tracking-wider">
            <span>NEXUS</span>
            <span>KINETIC</span>
            <span>SYNAPSE</span>
            <span>VORTEX</span>
          </div>
        </div>
      </section>

      {/* Interactive Mock Engine Card (Visual Hook) */}
      <section className="mb-6 text-left">
        <div className="bg-[#ffffff] rounded-xl p-4 shadow-sm border border-[#cbd5e1]/60 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#1d4ed8]/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Top Header Card */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#0037b0]">
                <span className="material-symbols-outlined text-[18px]">auto_graph</span>
              </div>
              <div>
                <h3 className="font-bold text-[15px] leading-tight text-[#131b2e]">Copilot Telemetry</h3>
                <span className="text-[11px] text-[#434655]">Continuous Sync: Silicon Valley Bank</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#82f5c1] text-[#005137] text-[10px] font-bold uppercase">
              LIVE
            </span>
          </div>

          {/* AI Alert Pill: Anomaly Detected */}
          <div className="bg-[#ffdad6] text-[#93000a] p-2.5 rounded-lg mb-3 flex items-start gap-2 shadow-xs">
            <span className="material-symbols-outlined text-[18px] text-[#ba1a1a] flex-shrink-0 mt-0.5">
              report_problem
            </span>
            <div className="flex flex-col text-[12px]">
              <span className="font-bold">Duplicate Invoice Detected</span>
              <span>
                AWS CloudFront duplicate bill flagged • <strong>₹450.00 saved</strong>
              </span>
            </div>
          </div>

          {/* Cash Runway Metric Gauge */}
          <div className="bg-[#f2f3ff] rounded-lg p-3.5 flex flex-col gap-1 mb-3">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-[#434655]">Real-time Runway Safe Buffer</span>
              <span className="text-[#006c4a] font-bold">+2.4 Mo vs Q2</span>
            </div>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-[26px] font-bold text-[#131b2e] tabular-nums">18.4</span>
              <span className="text-[14px] text-[#434655] font-medium">Months</span>
            </div>

            {/* Progress bar visualization */}
            <div className="w-full bg-[#e2e7ff] h-2.5 rounded-full overflow-hidden mt-1 flex">
              <div className="bg-[#006c4a] h-full rounded-full transition-all duration-1000" style={{ width: '76%' }}></div>
            </div>
            <div className="flex justify-between items-center pt-1 text-[11px] text-[#747686]">
              <span>Target: 12 Mo Minimum</span>
              <span>Zero-Burn Date: Nov 2026</span>
            </div>
          </div>

          {/* Interactive Mini Question Prompt */}
          <div className="bg-[#eaedff] rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="material-symbols-outlined text-[16px] text-[#0037b0]">chat_bubble</span>
              <span className="text-[11px] text-[#434655] truncate">"What happens if payroll expands by 3 seats?"</span>
            </div>
            <button
              type="button"
              onClick={handleSimulateMini}
              className="text-[#0037b0] text-[11px] font-bold shrink-0 min-h-[36px] flex items-center px-2 hover:underline"
            >
              Simulate
            </button>
          </div>

          {simulatedPayrollOutput && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-[#ffffff] border border-[#cbd5e1] text-[12px] text-[#131b2e] leading-snug animate-fadeIn">
              <div className="flex items-center gap-1 text-[#0037b0] font-bold text-[11px] mb-1">
                <span className="material-symbols-outlined text-[14px]">model_training</span>
                Simulation Output
              </div>
              <p>{simulatedPayrollOutput}</p>
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="mt-2 text-[11px] text-[#1d4ed8] font-bold hover:underline flex items-center gap-0.5"
              >
                Open Full Scenario Sandbox in AI Copilot →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Core Architecture */}
      <section className="flex flex-col gap-3 mb-6 text-left" id="features">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider text-[#0037b0] font-bold">Core Architecture</span>
          <h2 className="text-[20px] font-bold text-[#131b2e]">Precision Cash Intelligence</h2>
        </div>

        {/* Feature Card 1 */}
        <div className="bg-[#ffffff] rounded-xl p-4 shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-1.5">
          <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#0037b0] mb-1">
            <span className="material-symbols-outlined text-[24px]">query_stats</span>
          </div>
          <h3 className="font-bold text-[15px] text-[#131b2e]">Autonomous Cash Flow Forecasting</h3>
          <p className="text-[13px] text-[#434655] leading-relaxed">
            90-day predictive runway modeling using deep Bayesian variance. Projects customer receivables delays, auto-reconciling payroll trends dynamically.
          </p>
          <div
            onClick={() => onNavigate('insights')}
            className="mt-1 inline-flex items-center gap-1 text-[#0037b0] text-[12px] font-semibold cursor-pointer hover:underline"
          >
            <span>Dynamic P&amp;L Sync</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </div>
        </div>

        {/* Feature Card 2 */}
        <div className="bg-[#ffffff] rounded-xl p-4 shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-1.5">
          <div className="w-10 h-10 rounded-lg bg-[#82f5c1] flex items-center justify-center text-[#005137] mb-1">
            <span className="material-symbols-outlined text-[24px]">shield_with_heart</span>
          </div>
          <h3 className="font-bold text-[15px] text-[#131b2e]">Automated Anomaly &amp; Duplicate Shield</h3>
          <p className="text-[13px] text-[#434655] leading-relaxed">
            Real-time multi-ledger scanner flagging subtle shadow recurring costs, double billings, and vendor price escalations before payments clear.
          </p>
          <div
            onClick={() => onNavigate('transactions')}
            className="mt-1 inline-flex items-center gap-1 text-[#006c4a] text-[12px] font-semibold cursor-pointer hover:underline"
          >
            <span>Zero Human Intervention</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </div>
        </div>

        {/* Feature Card 3 */}
        <div className="bg-[#ffffff] rounded-xl p-4 shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-1.5">
          <div className="w-10 h-10 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-[#0037b0] mb-1">
            <span className="material-symbols-outlined text-[24px]">psychology</span>
          </div>
          <h3 className="font-bold text-[15px] text-[#131b2e]">AI Copilot Scenario Sandbox</h3>
          <p className="text-[13px] text-[#434655] leading-relaxed">
            Ask natural questions directly to your company ledger: "What happens if cloud costs rise 15%?" Get instant mathematically validated balance sheets.
          </p>
          <div
            onClick={() => onNavigate('ai-assistant')}
            className="mt-1 inline-flex items-center gap-1 text-[#0037b0] text-[12px] font-semibold cursor-pointer hover:underline"
          >
            <span>Instant Executive Summaries</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </div>
        </div>
      </section>

      {/* Live Impact Stats Grid */}
      <section className="mb-6">
        <div className="bg-[#e2e7ff] rounded-xl p-4">
          <div className="text-center mb-3">
            <span className="text-[11px] text-[#0037b0] uppercase font-bold tracking-wider">Quantifiable ROI</span>
            <h2 className="text-[20px] font-bold text-[#131b2e]">Performance at Institutional Scale</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
            <div className="bg-[#ffffff] rounded-lg p-3.5 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[22px] font-bold text-[#0037b0] tabular-nums">₹48.6k</div>
                <div className="text-[12px] text-[#434655]">Avg. Annual Savings Unlocked</div>
              </div>
              <span className="material-symbols-outlined text-[#006c4a] text-[28px]">trending_up</span>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-3.5 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[22px] font-bold text-[#131b2e] tabular-nums">14.2 hrs</div>
                <div className="text-[12px] text-[#434655]">Weekly Finance Ops Saved</div>
              </div>
              <span className="material-symbols-outlined text-[#0037b0] text-[28px]">schedule</span>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-3.5 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[22px] font-bold text-[#006c4a] tabular-nums">99.8%</div>
                <div className="text-[12px] text-[#434655]">Target Reconciliation Accuracy</div>
              </div>
              <span className="material-symbols-outlined text-[#006c4a] text-[28px]">check_circle</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Testimonial */}
      <section className="mb-6 text-left">
        <div className="bg-[#ffffff] rounded-xl p-4 shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-2.5 relative overflow-hidden">
          <span className="material-symbols-outlined absolute -bottom-3 -right-3 text-[#e2e7ff] text-[80px] opacity-40 select-none pointer-events-none">
            format_quote
          </span>
          <div className="flex items-center gap-1 text-[#8e0026]">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="material-symbols-outlined text-[18px]">
                star
              </span>
            ))}
          </div>
          <blockquote className="text-[15px] text-[#131b2e] leading-snug">
            "FinAssist detected a <strong>₹1,40,000 SaaS seat leakage</strong> within 48 hours of initial onboarding. It provides our board with exact zero-burn projections without waiting on fractional accounting updates."
          </blockquote>
          <div className="flex items-center gap-3 pt-1">
            <div className="w-11 h-11 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-[#eaedff]">
              MV
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[14px] text-[#131b2e] leading-tight">Marcus Vance</span>
              <span className="text-[11px] text-[#434655]">CEO &amp; Founder, HyperScale Data (Series A)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="flex flex-col gap-3 mb-6 text-left" id="pricing">
        <div className="text-center mb-1">
          <span className="text-[11px] text-[#0037b0] uppercase font-bold tracking-wider">Transparent Growth Tiers</span>
          <h2 className="text-[20px] font-bold text-[#131b2e]">Predictable Investment</h2>
          <p className="text-[12px] text-[#434655]">Switch plans or cancel anytime with single-tap control.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tier 1: Starter */}
          <div className="bg-[#ffffff] rounded-xl p-4 shadow-sm border border-[#cbd5e1]/60 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-[16px] text-[#131b2e]">Starter</h3>
                  <p className="text-[12px] text-[#434655]">For seed stage &amp; lean teams</p>
                </div>
                <div className="text-right">
                  <span className="text-[24px] font-bold text-[#131b2e] tabular-nums">₹2,499</span>
                  <span className="text-[11px] text-[#434655]">/mo</span>
                </div>
              </div>
              <ul className="flex flex-col gap-1.5 py-2 text-[12px] text-[#131b2e]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c4a]">check</span>
                  <span>Up to 2 connected institutions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c4a]">check</span>
                  <span>60-Day Runway &amp; Burn Projection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c4a]">check</span>
                  <span>Basic weekly automated CFO digests</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="mt-3 w-full min-h-[40px] bg-[#eaedff] text-[#0037b0] text-[12px] font-semibold rounded-lg flex items-center justify-center hover:bg-[#dae2fd] transition-colors"
            >
              Select Starter
            </button>
          </div>

          {/* Tier 2: Growth AI (Flagship) */}
          <div className="bg-[#ffffff] rounded-xl p-4 shadow-md border-2 border-[#1d4ed8] flex flex-col justify-between relative overflow-hidden">
            <div className="bg-[#0037b0] text-white text-center py-1 -mx-4 -mt-4 mb-2">
              <span className="text-[10px] font-bold tracking-wider uppercase">Most Popular for Scaling Startups</span>
            </div>
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-[16px] text-[#131b2e]">Growth AI</h3>
                  <p className="text-[12px] text-[#434655]">For Series A &amp; scaling SMBs</p>
                </div>
                <div className="text-right">
                  <span className="text-[24px] font-bold text-[#1d4ed8] tabular-nums">₹6,499</span>
                  <span className="text-[11px] text-[#434655]">/mo</span>
                </div>
              </div>
              <ul className="flex flex-col gap-1.5 py-2 text-[12px] text-[#131b2e]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c4a]">check</span>
                  <span><strong>Unlimited</strong> accounts &amp; credit lines</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c4a]">check</span>
                  <span>Autonomous Anomaly &amp; Double-Billing Blocker</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c4a]">check</span>
                  <span>Custom Scenario Sandbox &amp; Slack alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c4a]">check</span>
                  <span>Dedicated Institutional Account Specialist</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="mt-3 w-full min-h-[40px] bg-[#0037b0] text-white text-[12px] font-semibold rounded-lg flex items-center justify-center hover:bg-[#1d4ed8] shadow-sm transition-colors"
            >
              Start 14-Day Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Final Urgent CTA Block */}
      <section className="bg-[#0037b0] text-white rounded-xl p-5 text-center flex flex-col items-center gap-2 mb-6 shadow-md">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white mb-1">
          <span className="material-symbols-outlined text-[28px]">rocket_launch</span>
        </div>
        <h2 className="text-[22px] font-bold leading-tight">Master Your Runway Today</h2>
        <p className="text-[14px] text-[#cad3ff] max-w-[360px]">
          Join 2,500+ operators running resilient, AI-monitored cash reserves.
        </p>
        <button
          onClick={() => onNavigate('signin')}
          className="w-full max-w-xs min-h-[44px] bg-white text-[#0037b0] rounded-xl text-[13px] font-bold flex items-center justify-center mt-2 hover:bg-[#f2f3ff] transition-transform active:scale-[0.98]"
        >
          Get Started Instantly
        </button>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#f2f3ff] px-4 py-6 rounded-xl text-center text-[#434655]">
        <div className="flex flex-wrap justify-center gap-4 text-[12px] font-medium mb-3">
          <button onClick={() => onOpenInfoModal('terms')} className="hover:text-[#131b2e]">Terms</button>
          <button onClick={() => onOpenInfoModal('privacy')} className="hover:text-[#131b2e]">Privacy</button>
          <button onClick={() => onOpenInfoModal('security')} className="hover:text-[#131b2e]">Security</button>
          <button onClick={() => onOpenInfoModal('contact')} className="hover:text-[#131b2e]">Contact</button>
        </div>
        <p className="text-[12px] text-[#434655]">© 2024 FinAssist AI, Inc. Institutional Precision.</p>
        <p className="text-[10px] text-[#747686] mt-0.5">256-bit Encrypted Cloud Financial Architecture</p>
      </footer>
    </div>
  );
};
