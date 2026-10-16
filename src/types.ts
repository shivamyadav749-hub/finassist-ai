export type ActiveTab = 'welcome' | 'signin' | 'dashboard' | 'transactions' | 'ai-assistant' | 'insights' | 'payments';

export interface UserProfile {
  id: string;
  email: string;
  companyName: string;
  fullName: string;
  role: string;
}

export interface TransactionItem {
  id: string;
  refId: string;
  counterparty: string;
  category: 'Revenue' | 'Software' | 'Marketing' | 'Payroll' | 'Office & Facilities' | 'Cloud';
  amount: number;
  currency: string;
  date: string;
  status: 'settled' | 'pending' | 'flagged';
  anomalyReason?: string;
  paymentMethod: string;
  isDemo?: boolean;
}

export interface FinancialSummary {
  totalCount: number;
  settledCount: number;
  pendingCount: number;
  flaggedCount: number;
  settledLiquidity: number;
  pendingLiquidity: number;
  totalRevenue: number;
  totalExpenses: number;
  netCashFlow: number;
  estimatedRunwayMonths: number;
}

export interface SimulationResult {
  scenarioName: string;
  baselineRunway: number;
  simulatedRunway: number;
  runwayDelta: number;
  netVariance: string;
  inflectionCurve: string;
  proactiveMitigation: string;
  confidence: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  simulation?: SimulationResult;
}

export interface MockDisbursement {
  id: string;
  txId: string;
  title: string;
  amount: number;
  currency: string;
  method: string;
  status: 'Settled' | 'Denied' | 'Pending';
  timestamp: string;
  isDemo?: boolean;
}
