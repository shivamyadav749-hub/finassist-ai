import React from 'react';

export type ModalType =
  | 'terms'
  | 'privacy'
  | 'security'
  | 'contact'
  | 'forgot-password'
  | 'contract-draft'
  | 'treasury-details'
  | 'schedule-demo'
  | null;

interface InfoModalProps {
  type: ModalType;
  onClose: () => void;
  onAction?: (actionName: string) => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose, onAction }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#283044]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#cbd5e1] text-left max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#eaedff] text-[#0037b0] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                {type === 'terms'
                  ? 'gavel'
                  : type === 'privacy'
                  ? 'policy'
                  : type === 'security'
                  ? 'shield'
                  : type === 'contact' || type === 'schedule-demo'
                  ? 'support_agent'
                  : type === 'forgot-password'
                  ? 'lock_reset'
                  : type === 'contract-draft'
                  ? 'description'
                  : 'account_balance'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#131b2e]">
                {type === 'terms' && 'Institutional Terms of Service'}
                {type === 'privacy' && 'Enterprise Privacy Policy'}
                {type === 'security' && 'SOC2 Type II Security Protocol'}
                {type === 'contact' && 'Enterprise Solutions & SAML 2.0'}
                {type === 'forgot-password' && 'Master Password Recovery'}
                {type === 'contract-draft' && 'Vendor Net-45 Renegotiation Draft'}
                {type === 'treasury-details' && 'Treasury Yield & Liquidity Allocation'}
                {type === 'schedule-demo' && 'Schedule Institutional Live Demo'}
              </h3>
              <p className="text-[11px] text-[#434655]">FinAssist AI Institutional Precision Governance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#eaedff] flex items-center justify-center text-[#434655] hover:text-[#131b2e]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="py-4 text-[13px] text-[#434655] leading-relaxed space-y-3">
          {type === 'terms' && (
            <>
              <p>
                FinAssist AI operates under strict enterprise SLA agreements (99.99% uptime). All autonomous telemetry and cashflow forecasts are derived from verified banking webhooks and double-entry general ledger reconciliation.
              </p>
              <div className="p-3 bg-[#f2f3ff] rounded-lg border border-[#eaedff] text-[12px] space-y-1">
                <span className="font-bold text-[#131b2e] block">Key Terms Highlights:</span>
                <p>• Multi-ledger sync operates strictly in read-only mode via financial bridges.</p>
                <p>• Zero training on private customer accounting ledgers without explicit opt-in.</p>
                <p>• Automated anomaly alerts are advisory and do not constitute certified CPA tax filings.</p>
              </div>
            </>
          )}

          {type === 'privacy' && (
            <>
              <p>
                Our privacy framework enforces zero-knowledge architecture. All sensitive bank credentials and employee compensation details are encrypted in transit with TLS 1.3 and at rest with 256-bit AES.
              </p>
              <div className="p-3 bg-[#f2f3ff] rounded-lg border border-[#eaedff] text-[12px] space-y-1">
                <span className="font-bold text-[#131b2e] block">Data Handling Safeguards:</span>
                <p>• Zero data reselling to ad networks or third-party data brokers.</p>
                <p>• Granular RBAC permissions ensuring restricted executive ledger viewing.</p>
                <p>• Instant GDPR and CCPA compliant data deletion upon workspace termination.</p>
              </div>
            </>
          )}

          {type === 'security' && (
            <>
              <div className="grid grid-cols-2 gap-2 text-center my-1">
                <div className="p-2.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff]">
                  <span className="material-symbols-outlined text-[#006c4a] text-[20px]">verified</span>
                  <div className="text-[12px] font-bold text-[#131b2e] mt-0.5">SOC2 Type II</div>
                  <span className="text-[10px] text-[#434655]">Audited Annually</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff]">
                  <span className="material-symbols-outlined text-[#0037b0] text-[20px]">enhanced_encryption</span>
                  <div className="text-[12px] font-bold text-[#131b2e] mt-0.5">AES-256 Bit</div>
                  <span className="text-[10px] text-[#434655]">Hardware Security Keys</span>
                </div>
              </div>
              <p>
                Continuous vulnerability scanning, automated penetration audits, and immutable write logs protect against account spoofing and malicious transaction alterations.
              </p>
            </>
          )}

          {type === 'contact' && (
            <>
              <p>
                Need custom Okta, Azure AD, or SAML 2.0 single sign-on integration for 50+ employees? Our Enterprise Architecture team provisions custom deployment nodes with dedicated VPC peering.
              </p>
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-[12px] text-[#131b2e]">
                  <span className="material-symbols-outlined text-[#0037b0] text-[18px]">mail</span>
                  <span>enterprise-sso@finassist.ai</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#131b2e]">
                  <span className="material-symbols-outlined text-[#006c4a] text-[18px]">call</span>
                  <span>+1 (800) 554-CFO-AI (Dedicated Hotline)</span>
                </div>
              </div>
            </>
          )}

          {type === 'forgot-password' && (
            <>
              <p>
                Enter your work email address to receive an institutional one-time password reset bridge.
              </p>
              <input
                type="email"
                placeholder="founder@company.com"
                defaultValue="founder@company.com"
                className="w-full h-10 px-3 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] text-[13px] text-[#131b2e]"
              />
              <button
                type="button"
                onClick={() => {
                  onAction?.('Reset link sent to corporate domain inbox.');
                  onClose();
                }}
                className="w-full mt-2 h-10 rounded-lg bg-[#0037b0] text-white font-semibold text-[13px] hover:bg-[#1d4ed8]"
              >
                Send Secure Reset Token
              </button>
            </>
          )}

          {type === 'contract-draft' && (
            <>
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#cbd5e1] font-mono text-[11px] text-[#131b2e] space-y-1.5">
                <p className="font-bold text-[#0037b0]">MEMORANDUM OF AMENDMENT: PAYMENT TERMS</p>
                <p>Vendor: Apex Media Digital (Acct #APX-4421)</p>
                <p>Original Terms: Net-30 Days (₹14,500/mo avg. commitment)</p>
                <p>Proposed Amendment: Net-45 Days with 1.5% Early-Pay Discount</p>
                <p className="text-[#006c4a] font-bold">Projected Working Capital Release: +₹28,000 Safe Buffer</p>
              </div>
              <p className="text-[12px]">
                FinAssist AI generated this amendment based on 98.4% on-time historical settlement records.
              </p>
            </>
          )}

          {type === 'treasury-details' && (
            <>
              <div className="p-3 bg-[#f2f3ff] rounded-lg border border-[#eaedff] space-y-2">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-[#131b2e]">Yield Vehicle:</span>
                  <span className="font-bold text-[#006c4a]">Liquid Treasury &amp; Yield Vaults</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-[#131b2e]">Current Net APY:</span>
                  <span className="font-bold text-[#006c4a]">5.14% Annual</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-[#131b2e]">Liquidity Access:</span>
                  <span className="text-[#131b2e]">T+1 Instant Sweep</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-[#131b2e]">Projected Annual Yield:</span>
                  <span className="font-bold text-[#0037b0]">+₹ 6,450 / yr</span>
                </div>
              </div>
              <p className="text-[12px]">
                Protects excess operational cash reserves from inflation while retaining full automated clearance capabilities for bi-weekly payroll obligations.
              </p>
            </>
          )}

          {type === 'schedule-demo' && (
            <>
              <p>
                Book a 20-minute tailored platform walkthrough with an Institutional Solutions Architect.
              </p>
              <div className="space-y-2.5 pt-1">
                <input
                  type="text"
                  placeholder="Your Name / Title"
                  defaultValue="Marcus Vance, CEO"
                  className="w-full h-10 px-3 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] text-[13px] text-[#131b2e]"
                />
                <input
                  type="email"
                  placeholder="Corporate Email"
                  defaultValue="founder@company.com"
                  className="w-full h-10 px-3 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] text-[13px] text-[#131b2e]"
                />
                <button
                  type="button"
                  onClick={() => {
                    onAction?.('VIP Tour Scheduled: Calendar invite sent for tomorrow at 2:00 PM EST.');
                    onClose();
                  }}
                  className="w-full h-10 rounded-lg bg-[#1d4ed8] text-white font-semibold text-[13px] hover:bg-[#0037b0]"
                >
                  Confirm Briefing Reservation
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#eaedff] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#eaedff] text-[#0037b0] text-[12px] font-semibold hover:bg-[#dae2fd] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
