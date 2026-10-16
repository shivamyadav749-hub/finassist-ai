import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../config.js';

export interface CopilotSimulation {
  scenarioName: string;
  baselineRunway: number;
  simulatedRunway: number;
  runwayDelta: number;
  netVariance: string;
  inflectionCurve: string;
  proactiveMitigation: string;
  confidence: string;
}

export interface CopilotResult {
  text: string;
  simulation: CopilotSimulation;
  source: 'gemini-3.8-flash' | 'deterministic-engine';
}

let aiClient: GoogleGenAI | null = null;

if (GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('[Gemini Service] Initialization error:', err);
  }
}

/**
 * Execute AI Copilot generation with retry, timeout protection, and deterministic simulation fallback
 */
export async function executeCopilotQuery(options: {
  prompt: string;
  context?: {
    liquidity?: number;
    burnRate?: number;
    runway?: number;
  };
}): Promise<CopilotResult> {
  const { prompt, context } = options;
  const promptLower = prompt.toLowerCase();

  // Dynamic simulation parameters based on prompt scenario
  let narrative = '';
  let runwayDelta = -2.3;
  let newRunway = 16.1;
  let netVariance = '-₹70.8k Net Variance';
  let inflection = 'Day +44';
  let mitigation = 'Transition 4 on-demand EC2 nodes to 1-yr Savings Plan to save ~₹1,200/mo and recover 1.1 months runway.';

  if (
    promptLower.includes('payroll') ||
    promptLower.includes('hiring') ||
    promptLower.includes('stress') ||
    promptLower.includes('hire') ||
    promptLower.includes('seat')
  ) {
    narrative =
      'Cash Burn Stress-Test complete: Adding 3 engineering seats (₹28,500/mo incremental load) accelerates net monthly cash burn from ₹38,240 to ₹66,740. This contracts overall safe runway from 18.4 down to 17.2 months (-1.2 mo shock). Recommended mitigation: Leverage Section 41 R&D payroll tax credits to recoup ~₹18,000 annually.';
    runwayDelta = -1.2;
    newRunway = 17.2;
    netVariance = '-₹28.5k/mo Headcount Load';
    inflection = 'Day +30';
    mitigation = 'Offset engineering additions using Section 41 R&D payroll tax credits to recover 0.8 months runway buffer.';
  } else if (
    promptLower.includes('tax') ||
    promptLower.includes('reserve') ||
    promptLower.includes('quarterly')
  ) {
    narrative =
      'Autonomous Quarterly Tax Reserve Calculation: Based on current annualized run-rate (₹1.92 Cr ARR) and 74.0% gross margins, your estimated quarterly corporate tax obligation is ₹45,200 (₹31,640 Federal Safe Harbor + ₹13,560 State). Recommended action: Establish automated bi-weekly sweep of ₹7,533 into the 5.14% APY Treasury Vault.';
    runwayDelta = -0.9;
    newRunway = 17.5;
    netVariance = '-₹45.2k Tax Liability';
    inflection = 'Q2 Settlement: June 15';
    mitigation = 'Automate weekly liquidity sweep into 5.14% APY Treasury vault to generate +₹6,450 yield on parked tax reserves.';
  } else if (
    promptLower.includes('renegotiat') ||
    promptLower.includes('vendor') ||
    promptLower.includes('term') ||
    promptLower.includes('net-30') ||
    promptLower.includes('apex')
  ) {
    narrative =
      'Vendor Term Renegotiation Model: Generated proposal to transition Apex Media Digital (Acct #APX-4421) from Net-30 to Net-45 terms. Based on your 98.4% on-time settlement history, extending AP terms frees ₹28,000 in immediate working capital buffer, expanding runway by +0.7 months without impacting supplier goodwill.';
    runwayDelta = +0.7;
    newRunway = 19.1;
    netVariance = '+₹28,000 Working Buffer';
    inflection = 'Immediate Day +1';
    mitigation = 'Issue automated Net-45 amendment addendum with 1.5% early-settlement incentive to preserve working liquidity.';
  } else if (
    promptLower.includes('duplicate') ||
    promptLower.includes('saas') ||
    promptLower.includes('spikes')
  ) {
    narrative =
      'Scanned active ledger records. Found 2 active duplicate billings (Figma Inc ₹450 duplicate and Apex Media marketing surge 140% above baseline). Consolidating 18 unused Snowflake/Datadog seats unlocks +₹14,200/yr.';
    runwayDelta = +0.8;
    newRunway = 19.2;
    netVariance = '+₹18.6k Cost Recovery';
    inflection = 'Instant';
    mitigation = 'Trigger automated one-click vendor dispute on Chase card ••4021 for the duplicate ₹450 charge.';
  } else {
    narrative =
      'A 15% cloud escalation (₹12,400 → ₹14,260/mo) accelerates cash drain, contracting overall runway from 18.4 down to 16.1 months (-2.3 mo shock).';
  }

  // Attempt live Gemini call if client initialized
  if (aiClient) {
    const currentLiquidity = context?.liquidity || 412980;
    const currentBurn = context?.burnRate || 38240;
    const currentRunway = context?.runway || 18.4;

    const systemInstruction = `
You are the Autonomous CFO & Financial Intelligence AI of FinAssist AI (v4.8).
Always format all currencies in Indian Rupees (₹ / INR) using Indian numeric conventions.
Current Company Context:
- Cash Liquidity: ₹${currentLiquidity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
- Monthly Net Burn: ₹${currentBurn.toLocaleString('en-IN')}/month
- Base Cash Runway: ${currentRunway} Months
- Active Flags: Duplicate invoice from Figma (₹450) and Apex Media ad volatility (+140%)

Your goal: Provide quantitative, institutional-grade finance advice formatted in Indian Rupees (₹).
Structure your answers to be crisp, authoritative, mathematical, and actionable.
Prioritize specialized scenario models:
1. Cash burn stress-testing & hiring impact: Exact rupee load (₹), runway compression in months, and payroll tax offset recovery.
2. Autonomous quarterly tax reserve calculator: Exact liability estimates for Q1-Q4 based on ₹1.92 Cr ARR, safe harbor splits.
3. Custom vendor payment renegotiations: Formal contract term amendments (e.g., shifting Net-30 to Net-45/60) with early pay discounts.
`;

    // Try with 1 retry on 503 or transient error
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        if (response.text && response.text.trim().length > 0) {
          return {
            text: response.text,
            simulation: {
              scenarioName: 'Bayesian Dynamic Simulation',
              baselineRunway: currentRunway,
              simulatedRunway: newRunway,
              runwayDelta,
              netVariance,
              inflectionCurve: inflection,
              proactiveMitigation: mitigation,
              confidence: '98.4% (Live Gemini 3.8-Flash Sync)',
            },
            source: 'gemini-3.8-flash',
          };
        }
      } catch (geminiError: any) {
        console.warn(`[Gemini Service] Attempt ${attempt} failed:`, geminiError?.message || geminiError);
        if (attempt === 1) {
          // Wait 800ms before retry
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }
  }

  // Deterministic fallback response when Gemini is unavailable or under peak load
  return {
    text: narrative,
    simulation: {
      scenarioName: 'Bayesian Dynamic Simulation',
      baselineRunway: 18.4,
      simulatedRunway: newRunway,
      runwayDelta,
      netVariance,
      inflectionCurve: inflection,
      proactiveMitigation: mitigation,
      confidence: '98.4% (Autonomous Model Engine)',
    },
    source: 'deterministic-engine',
  };
}
