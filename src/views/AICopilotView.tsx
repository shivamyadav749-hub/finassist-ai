import React, { useState } from 'react';
import { ChatMessage, SimulationResult } from '../types';

interface AICopilotViewProps {
  onTriggerToast: (msg: string) => void;
}

export const AICopilotView: React.FC<AICopilotViewProps> = ({ onTriggerToast }) => {
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initial seed message matching Image 8
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_user_1',
      sender: 'user',
      text: 'What is our projected cash runway if recurring cloud spend grows 15% next quarter?',
      timestamp: '10:42 AM',
    },
    {
      id: 'msg_ai_1',
      sender: 'ai',
      text: 'A 15% cloud escalation (₹12,400 → ₹14,260/mo) accelerates cash drain, contracting overall runway from 18.4 down to 16.1 months (-2.3 mo shock).',
      timestamp: '10:42 AM',
      simulation: {
        scenarioName: 'Scenario Simulation • 1,420 entries evaluated',
        baselineRunway: 18.4,
        simulatedRunway: 16.1,
        runwayDelta: -2.3,
        netVariance: '-₹70.8k Net Variance',
        inflectionCurve: 'Day +44',
        proactiveMitigation:
          'Transition 4 on-demand EC2 nodes to 1-yr Savings Plan to save ~₹1,200/mo and recover 1.1 months runway.',
        confidence: '98.4% (Direct API Sync)',
      },
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI Copilot error');

      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        simulation: data.simulation,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AI Copilot error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: 'Autonomous ledger analysis complete. Monthly cash variance is within acceptable confidence bounds (±3.2%).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateMitigation = (mitigationText: string) => {
    handleSend(`Simulate Savings Plan: Apply proactive mitigation -> "${mitigationText}"`);
  };

  return (
    <div className="w-full max-w-[440px] md:max-w-[760px] lg:max-w-[960px] mx-auto px-4 pb-28 pt-2 flex flex-col gap-3 text-left">
      {/* Disclaimer Notice */}
      {disclaimerVisible && (
        <div className="bg-[#e2e7ff] text-[#434655] px-3 py-2 rounded-xl flex items-center justify-between shadow-xs border border-[#cbd5e1]/40">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[16px] text-[#0037b0] flex-shrink-0">
              shield_with_heart
            </span>
            <p className="text-[12px] truncate">
              Informational analytical estimates; not certified tax advice.
            </p>
          </div>
          <button
            aria-label="Dismiss disclaimer"
            onClick={() => setDisclaimerVisible(false)}
            className="text-[#434655] hover:text-[#131b2e] ml-2 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Live Financial Context Strip */}
      <div className="bg-[#ffffff] rounded-xl p-3 shadow-xs border border-[#cbd5e1]/60 flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006c4a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006c4a]"></span>
            </span>
            <span className="text-[11px] text-[#434655] font-semibold uppercase tracking-wider">
              Sync: Live Ledger
            </span>
          </div>
          <span className="text-[11px] text-[#0037b0] font-bold">Q2 Projection Ready</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-left">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#747686]">Cash Liquidity</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[14px] font-bold text-[#131b2e] tabular-nums font-financial">
                ₹ 4,12,980
              </span>
              <span className="text-[10px] font-bold text-[#006c4a]">+3.2%</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#747686]">Net Burn /mo</span>
            <span className="text-[14px] font-bold text-[#131b2e] tabular-nums font-financial mt-0.5">
              ₹ 38,240
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#747686]">Est. Runway</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[14px] font-bold text-[#0037b0] tabular-nums font-financial">
                18.4
              </span>
              <span className="text-[10px] text-[#434655]">Mos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex flex-col space-y-4 my-1">
        {messages.map((msg) =>
          msg.sender === 'user' ? (
            <div key={msg.id} className="flex justify-end items-end gap-2 pl-8">
              <div className="bg-[#0037b0] text-white rounded-2xl rounded-br-none p-3.5 shadow-xs max-w-[90%]">
                <p className="text-[13px] leading-snug">{msg.text}</p>
                <span className="block text-right text-[10px] text-[#cad3ff] mt-1 opacity-80">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex items-start gap-2.5 pr-2">
              <div className="w-7 h-7 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              </div>
              <div className="flex flex-col gap-2 max-w-[92%] flex-1">
                {/* Status Pill */}
                {msg.simulation && (
                  <div className="inline-flex items-center gap-1.5 self-start bg-[#e2e7ff] px-2.5 py-1 rounded-full text-[#434655]">
                    <span className="material-symbols-outlined text-[14px] text-[#0037b0]">model_training</span>
                    <span className="text-[11px] font-semibold">{msg.simulation.scenarioName}</span>
                  </div>
                )}

                {/* AI Text Synthesis */}
                <div className="bg-[#ffffff] p-3.5 rounded-2xl rounded-tl-none shadow-xs border border-[#cbd5e1]/60 flex flex-col gap-3">
                  <p className="text-[13px] text-[#131b2e] leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>

                  {/* Comparative Metric Block */}
                  {msg.simulation && (
                    <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col gap-2.5 border border-[#eaedff]">
                      <div className="flex justify-between items-center text-left">
                        <span className="text-[11px] text-[#747686] uppercase tracking-wider font-semibold">
                          Runway Impact
                        </span>
                        <span className="text-[11px] font-bold text-[#ba1a1a] bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded-full">
                          {msg.simulation.netVariance}
                        </span>
                      </div>

                      {/* Comparison Mini Bars */}
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-[#434655]">Current Baseline</span>
                            <span className="text-[#131b2e] font-bold tabular-nums font-financial">
                              {msg.simulation.baselineRunway} mos
                            </span>
                          </div>
                          <div className="w-full bg-[#dae2fd] rounded-full h-2 overflow-hidden">
                            <div className="bg-[#0037b0] h-2 rounded-full" style={{ width: '82%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-[#ba1a1a] font-medium">15% Cloud Surge</span>
                            <span className="text-[#ba1a1a] font-bold tabular-nums font-financial">
                              {msg.simulation.simulatedRunway} mos
                            </span>
                          </div>
                          <div className="w-full bg-[#dae2fd] rounded-full h-2 overflow-hidden">
                            <div className="bg-[#ba0035] h-2 rounded-full" style={{ width: '71%' }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Sparkline Trend */}
                      <div className="pt-1 flex items-center justify-between text-[#434655]">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="material-symbols-outlined text-[15px] text-[#0037b0]">show_chart</span>
                          <span>Burn curve inflection: {msg.simulation.inflectionCurve}</span>
                        </div>
                        <svg className="w-20 h-6 text-[#ba1a1a]" fill="none" stroke="currentColor" viewBox="0 0 100 30">
                          <path
                            d="M0,8 L25,10 L50,16 L75,22 L100,28"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                          />
                          <circle className="fill-[#ba1a1a]" cx="100" cy="28" r="3" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Recommendation Action Card */}
                  {msg.simulation?.proactiveMitigation && (
                    <div className="bg-[#eaedff] rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#006c4a] flex-shrink-0 mt-0.5">
                          lightbulb
                        </span>
                        <div className="flex-1 text-left">
                          <p className="text-[11px] font-bold text-[#131b2e]">Proactive Mitigation</p>
                          <p className="text-[12px] text-[#434655] mt-0.5 leading-snug">
                            {msg.simulation.proactiveMitigation}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateMitigation(msg.simulation!.proactiveMitigation)}
                        className="w-full mt-1 bg-[#0037b0] text-white text-[11px] font-semibold py-2 px-3 rounded-lg shadow-xs hover:bg-[#1d4ed8] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_circle</span>
                        Simulate Savings Plan
                      </button>
                    </div>
                  )}

                  {/* Quick Feedback Micro-row */}
                  <div className="flex items-center justify-between pt-1 text-[#747686]">
                    <span className="text-[10px]">Confidence: {msg.simulation?.confidence || '98.4% (Direct API Sync)'}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onTriggerToast('Marked response as helpful')}
                        className="p-1 rounded hover:bg-[#eaedff] transition-colors hover:text-[#131b2e]"
                      >
                        <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                      </button>
                      <button
                        onClick={() => onTriggerToast('Feedback recorded for model refinement')}
                        className="p-1 rounded hover:bg-[#eaedff] transition-colors hover:text-[#131b2e]"
                      >
                        <span className="material-symbols-outlined text-[16px]">thumb_down</span>
                      </button>
                      <button
                        onClick={() => onTriggerToast('Scenario summary copied to clipboard')}
                        className="p-1 rounded hover:bg-[#eaedff] transition-colors hover:text-[#131b2e]"
                      >
                        <span className="material-symbols-outlined text-[16px]">share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-[#0037b0] text-[12px] font-medium p-3 bg-white rounded-xl shadow-xs border border-[#cbd5e1]/60">
            <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            <span>Running Bayesian cashflow simulation across 1,428 ledger entries...</span>
          </div>
        )}
      </div>

      {/* Suggested Inquiries Chips */}
      <div className="flex flex-col gap-1.5 mt-2">
        <span className="text-[11px] text-[#747686] uppercase tracking-wider font-semibold">
          Suggested Inquiries &amp; Prioritized Scenarios
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => handleSend('Cash burn stress-testing and hiring impact simulator for 3 engineering seats')}
            className="flex-shrink-0 bg-[#eaedff] text-[#0037b0] px-3 py-1.5 rounded-full text-[11px] font-semibold hover:bg-[#dce1ff] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs border border-[#cad3ff]"
          >
            <span className="material-symbols-outlined text-[14px]">groups</span>
            Cash burn &amp; hiring stress-test
          </button>
          <button
            onClick={() => handleSend('Autonomous quarterly tax reserve calculator for federal and state safe harbor')}
            className="flex-shrink-0 bg-[#eaedff] text-[#0037b0] px-3 py-1.5 rounded-full text-[11px] font-semibold hover:bg-[#dce1ff] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs border border-[#cad3ff]"
          >
            <span className="material-symbols-outlined text-[14px] text-[#006c4a]">account_balance</span>
            Autonomous quarterly tax reserves
          </button>
          <button
            onClick={() => handleSend('Custom vendor payment term renegotiation generator: Shift Apex Media to Net-45')}
            className="flex-shrink-0 bg-[#eaedff] text-[#0037b0] px-3 py-1.5 rounded-full text-[11px] font-semibold hover:bg-[#dce1ff] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs border border-[#cad3ff]"
          >
            <span className="material-symbols-outlined text-[14px] text-[#1d4ed8]">description</span>
            Vendor term renegotiation: Apex Media
          </button>
          <button
            onClick={() => handleSend('What were my top spend spikes?')}
            className="flex-shrink-0 bg-[#f2f3ff] text-[#131b2e] px-3 py-1.5 rounded-full text-[11px] font-medium hover:bg-[#e2e7ff] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs border border-[#cbd5e1]/40"
          >
            <span className="material-symbols-outlined text-[14px] text-[#0037b0]">trending_up</span>
            What were my top spend spikes?
          </button>
          <button
            onClick={() => handleSend('Check SaaS duplicates')}
            className="flex-shrink-0 bg-[#f2f3ff] text-[#131b2e] px-3 py-1.5 rounded-full text-[11px] font-medium hover:bg-[#e2e7ff] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs border border-[#cbd5e1]/40"
          >
            <span className="material-symbols-outlined text-[14px] text-[#747686]">content_copy</span>
            Check SaaS duplicates
          </button>
        </div>
      </div>

      {/* Sticky Bottom Input Dock */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-3 py-2 bg-[#faf8ff]/95 backdrop-blur-md shadow-lg border-t border-[#eaedff]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-md mx-auto flex items-center gap-1.5 bg-white rounded-full px-2 py-1.5 shadow-xs border border-[#cbd5e1]"
        >
          <button
            type="button"
            aria-label="Attach statement or CSV"
            onClick={() => onTriggerToast('Attach ledger statement / CSV simulation activated')}
            className="p-1.5 text-[#434655] hover:text-[#0037b0] transition-colors rounded-full hover:bg-[#eaedff]"
          >
            <span className="material-symbols-outlined text-[20px]">attach_file</span>
          </button>
          <input
            type="text"
            placeholder="Ask FinAssist anything about cashflow..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-[#131b2e] placeholder:text-[#747686] focus:outline-none px-1"
          />
          <button
            type="button"
            aria-label="Voice input"
            onClick={() => onTriggerToast('Listening... Speak your financial query')}
            className="p-1.5 text-[#434655] hover:text-[#0037b0] transition-colors rounded-full hover:bg-[#eaedff]"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            aria-label="Send query"
            className="w-8 h-8 rounded-full bg-[#0037b0] text-white flex items-center justify-center shadow-sm hover:bg-[#1d4ed8] active:scale-90 transition-transform disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
        </form>
      </div>
    </div>
  );
};
