export type TradeDirection = 'Long' | 'Short';
export type TradeStatus = 'Planned' | 'Open' | 'Closed' | 'Missed';
export type FundingAccountStatus = 'Active' | 'Challenge' | 'Funded' | 'Passed' | 'Failed' | 'Paused';
export type TradingSession = 'Asia' | 'London' | 'New York' | 'Overlap';
export type TradingEmotion = 'Calm' | 'Confident' | 'Fearful' | 'Greedy' | 'Revenge' | 'Patient';
export type TradingMistakeTag =
  | 'None'
  | 'Overconfidence'
  | 'Revenge Trade'
  | 'FOMO'
  | 'Early Exit'
  | 'Moved Stop'
  | 'Late Entry'
  | 'Patience';

export interface TradingAccount {
  id: string;
  name: string;
  broker: string;
  balance: number;
  currency: string;
  maxDailyRiskPct: number;
  maxTradeRiskPct: number;
}

export interface TradingFundingAccount {
  id: string;
  provider: string;
  accountName: string;
  accountType: string;
  iconUrl: string;
  iconLabel: string;
  status: FundingAccountStatus;
  purchaseDate: string;
  deadlineDate: string;
  minimumTradingDays: number;
  completedTradingDays: number;
  accountSize: number;
  startingBalance: number;
  currentBalance: number;
  purchaseFee: number;
  resetFees: number;
  monthlyFee: number;
  profitTarget: number;
  maxDrawdownLimit: number;
  dailyDrawdownLimit: number;
  currentDrawdownPct: number;
  currency: string;
  platform: string;
  accountNumber: string;
  notes: string;
}

export interface TradeEntry {
  id: string;
  fundingAccountId?: string;
  date: string;
  entryTime?: string;
  exitTime?: string;
  symbol: string;
  direction: TradeDirection;
  session: TradingSession;
  timeframe: string;
  setup: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice?: number;
  riskAmount: number;
  resultR: number;
  mfeR?: number;
  maeR?: number;
  rrTarget?: number;
  confidenceScore?: number;
  commission?: number;
  status: TradeStatus;
  emotion: TradingEmotion;
  mistakeTags?: TradingMistakeTag[];
  ruleFollowed: boolean;
  exitReason?: string;
  screenshotUrl?: string;
  preTradeImageUrl?: string;
  postTradeImageUrl?: string;
  checklistItems?: string[];
  checklistPassed?: boolean;
  notes: string;
}

export interface TradingWatchlistItem {
  id: string;
  symbol: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  keyLevel: string;
  plan: string;
  alert: string;
}

export interface TradingRule {
  id: string;
  title: string;
  description: string;
  active: boolean;
}
