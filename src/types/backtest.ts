export type BacktestMarketCondition = 'Trending' | 'Range' | 'Breakout' | 'News' | 'Low Volatility';
export type BacktestStatus = 'Draft' | 'In Review' | 'Validated' | 'Rejected';

export interface TradeRecord {
  id: string;
  date: string;
  symbol: string;
  direction: 'Long' | 'Short';
  setup: string;
  result_r: number;
  mfe_r: number;
  mae_r: number;
  rule_score: number;
  max_rule_score: number;
}

export interface BacktestTrade {
  id: string;
  sessionId: string;
  index: number;
  date: string;
  symbol: string;
  direction: 'Long' | 'Short';
  setup: string;
  entryModel: string;
  resultR: number;
  mfeR: number;
  maeR: number;
  mistake: string;
  screenshotUrl?: string;
}

export interface BacktestSession {
  id: string;
  name: string;
  symbol: string;
  strategy: string;
  timeframe: string;
  marketCondition: BacktestMarketCondition;
  startDate: string;
  endDate: string;
  trades: number;
  wins: number;
  losses: number;
  breakeven: number;
  netR: number;
  profitFactor: number;
  expectancyR: number;
  maxDrawdownR: number;
  ruleAdherence: number;
  status: BacktestStatus;
  keyFinding: string;
  nextAction: string;
}
