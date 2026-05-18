export type InvestmentTabKey = 'overview' | 'allocation' | 'dca' | 'dividend' | 'gold' | 'review';

export interface InvestorProfile {
  profile_id: string;
  base_currency: 'THB' | 'USD';
  display_currencies: Array<'THB' | 'USD'>;
  risk_profile: string;
  investment_goal: string;
  time_horizon_years: number;
  monthly_dca_budget: number;
  max_drawdown_tolerance: number;
  emergency_fund_months: number;
}

export interface InvestmentPolicy {
  policy_id: string;
  objective: string;
  target_allocation: Record<string, number>;
  rebalance_threshold_percent: number;
  dca_rule: string;
  dividend_rule: string;
  gold_rule: string;
  what_i_will_not_do: string[];
  review_frequency: 'Monthly' | 'Quarterly';
}

export interface Asset {
  asset_id: string;
  name: string;
  ticker: string;
  asset_class: 'Equity Global' | 'Equity Thai' | 'Dividend' | 'Bonds' | 'Cash' | 'Gold' | 'REITs' | 'Alternatives';
  country: string;
  currency: 'THB' | 'USD';
  asset_type: string;
  dividend_eligible: boolean;
  hedge_asset: boolean;
  color: string;
  icon: string;
}

export interface Holding {
  holding_id: string;
  asset_id: string;
  quantity: number;
  average_cost: number;
  current_price: number;
  currency: 'THB' | 'USD';
  market_value: number;
  invested_amount: number;
  unrealized_gain: number;
  unrealized_gain_percent: number;
  portfolio_weight: number;
  ytd_dividend: number;
}

export interface Transaction {
  transaction_id: string;
  date: string;
  asset_id: string;
  type: 'buy' | 'sell' | 'dca' | 'dividend_reinvest' | 'gold_purchase';
  quantity: number;
  price: number;
  fee: number;
  currency: 'THB' | 'USD';
  amount: number;
  notes: string;
}

export interface DCAPlan {
  dca_plan_id: string;
  asset_id: string;
  asset_class: Asset['asset_class'];
  monthly_amount: number;
  day_of_month: number;
  priority: number;
  enabled: boolean;
  auto_allocation: boolean;
  last_buy_date: string;
  next_buy_date: string;
}

export interface DividendPayment {
  dividend_id: string;
  asset_id: string;
  payment_date: string;
  ex_dividend_date: string;
  amount: number;
  tax: number;
  currency: 'THB' | 'USD';
  payout_frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  status: 'Paid' | 'Upcoming';
}

export interface GoldHolding {
  gold_id: string;
  date: string;
  product: string;
  purity: string;
  weight: number;
  unit: 'gram' | 'baht';
  purchase_price: number;
  current_price: number;
  market_value: number;
  gain: number;
  gain_percent: number;
  notes: string;
}

export interface PortfolioSnapshot {
  snapshot_id: string;
  date: string;
  total_value: number;
  total_invested: number;
  unrealized_gain: number;
  unrealized_gain_percent: number;
  dividend_ytd: number;
  dca_completion: number;
  risk_score: number;
  allocation_by_asset_class: Record<string, number>;
  currency_exposure: Record<string, number>;
  country_exposure: Record<string, number>;
}

export interface PortfolioReview {
  review_id: string;
  period: string;
  review_date: string;
  review_score: number;
  rebalance_status: string;
  dca_completion: number;
  dividend_goal_progress: number;
  risk_alignment: string;
  checklist_items: Array<{ label: string; done: boolean }>;
  drift_summary: string;
  review_notes: string[];
  top_concerns: string[];
  action_plan: string[];
  next_review_date: string;
}

export interface InvestmentInsight {
  insight_id: string;
  tab: InvestmentTabKey;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description_thai: string;
  related_asset_id?: string;
  created_at: string;
}

export interface InvestmentDataset {
  investorProfile: InvestorProfile;
  investmentPolicy: InvestmentPolicy;
  assets: Asset[];
  holdings: Holding[];
  transactions: Transaction[];
  dcaPlans: DCAPlan[];
  dividendPayments: DividendPayment[];
  goldHoldings: GoldHolding[];
  portfolioSnapshots: PortfolioSnapshot[];
  portfolioReviews: PortfolioReview[];
  investmentInsights: InvestmentInsight[];
}
