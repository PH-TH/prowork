import { create } from 'zustand';
import { mockInvestmentData } from '../data/mockInvestment';
import { generateInvestmentInsights } from '../lib/investmentCalculations';
import type { Asset, DCAPlan, DividendPayment, GoldHolding, Holding, InvestmentDataset, PortfolioReview, Transaction } from '../types/investment';

interface InvestmentState extends InvestmentDataset {
  addAsset: (asset: Omit<Asset, 'asset_id'>) => Asset;
  addHolding: (holding: Omit<Holding, 'holding_id' | 'market_value' | 'invested_amount' | 'unrealized_gain' | 'unrealized_gain_percent' | 'portfolio_weight' | 'ytd_dividend'> & { notes?: string }) => void;
  addTransaction: (tx: Omit<Transaction, 'transaction_id' | 'amount'>) => void;
  addDCAPlan: (plan: Omit<DCAPlan, 'dca_plan_id' | 'last_buy_date' | 'next_buy_date'>) => void;
  addDividend: (payment: Omit<DividendPayment, 'dividend_id' | 'ex_dividend_date'>) => void;
  addGoldPurchase: (gold: Omit<GoldHolding, 'gold_id' | 'market_value' | 'gain' | 'gain_percent'>) => void;
  addReviewNote: (payload: { period: string; summary: string; nextActions: string; concerns: string; rebalanceDecision: string }) => void;
}

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

function recomputeWeights(holdings: Holding[]) {
  const total = holdings.reduce((sum, h) => sum + h.market_value, 0) || 1;
  return holdings.map((h) => ({ ...h, portfolio_weight: Number(((h.market_value / total) * 100).toFixed(2)) }));
}

export const useInvestmentStore = create<InvestmentState>((set, get) => ({
  ...mockInvestmentData,
  addAsset: (asset) => {
    const next: Asset = { ...asset, asset_id: uid('a') };
    set({ assets: [...get().assets, next] });
    return next;
  },
  addHolding: (holding) => {
    const next: Holding = {
      holding_id: uid('h'),
      asset_id: holding.asset_id,
      quantity: holding.quantity,
      average_cost: holding.average_cost,
      current_price: holding.current_price,
      currency: holding.currency,
      market_value: Number((holding.quantity * holding.current_price).toFixed(2)),
      invested_amount: Number((holding.quantity * holding.average_cost).toFixed(2)),
      unrealized_gain: Number(((holding.current_price - holding.average_cost) * holding.quantity).toFixed(2)),
      unrealized_gain_percent: holding.average_cost > 0 ? Number((((holding.current_price - holding.average_cost) / holding.average_cost) * 100).toFixed(2)) : 0,
      portfolio_weight: 0,
      ytd_dividend: 0,
    };
    const holdings = recomputeWeights([...get().holdings, next]);
    const temp = { ...get(), holdings } as InvestmentDataset;
    set({ holdings, investmentInsights: generateInvestmentInsights(temp) });
  },
  addTransaction: (tx) => {
    const amount = Number((tx.quantity * tx.price + tx.fee).toFixed(2));
    const nextTx: Transaction = { ...tx, transaction_id: uid('t'), amount };
    const holdings = [...get().holdings];
    const index = holdings.findIndex((h) => h.asset_id === tx.asset_id);
    if (index >= 0) {
      const h = holdings[index];
      const sign = tx.type === 'sell' ? -1 : 1;
      const quantity = Math.max(0, h.quantity + sign * tx.quantity);
      const invested = Math.max(0, h.invested_amount + (tx.type === 'sell' ? -amount : amount));
      const avgCost = quantity > 0 ? invested / quantity : 0;
      const marketValue = quantity * h.current_price;
      const gain = marketValue - invested;
      holdings[index] = { ...h, quantity, invested_amount: Number(invested.toFixed(2)), average_cost: Number(avgCost.toFixed(2)), market_value: Number(marketValue.toFixed(2)), unrealized_gain: Number(gain.toFixed(2)), unrealized_gain_percent: invested > 0 ? Number(((gain / invested) * 100).toFixed(2)) : 0 };
    }
    const weighted = recomputeWeights(holdings);
    const temp = { ...get(), holdings: weighted, transactions: [...get().transactions, nextTx] } as InvestmentDataset;
    set({ holdings: weighted, transactions: [...get().transactions, nextTx], investmentInsights: generateInvestmentInsights(temp) });
  },
  addDCAPlan: (plan) => {
    const next: DCAPlan = { ...plan, dca_plan_id: uid('dca'), last_buy_date: '', next_buy_date: `2025-06-${String(plan.day_of_month).padStart(2, '0')}` };
    set({ dcaPlans: [...get().dcaPlans, next] });
  },
  addDividend: (payment) => {
    const next: DividendPayment = { ...payment, dividend_id: uid('div'), ex_dividend_date: payment.payment_date, status: payment.status ?? 'Paid' };
    set({ dividendPayments: [...get().dividendPayments, next] });
  },
  addGoldPurchase: (gold) => {
    const market = Number((gold.weight * gold.current_price).toFixed(2));
    const invested = Number((gold.weight * gold.purchase_price).toFixed(2));
    const gain = market - invested;
    const next: GoldHolding = { ...gold, gold_id: uid('g'), market_value: market, gain: Number(gain.toFixed(2)), gain_percent: invested > 0 ? Number(((gain / invested) * 100).toFixed(2)) : 0 };
    set({ goldHoldings: [...get().goldHoldings, next] });
  },
  addReviewNote: (payload) => {
    const reviews = [...get().portfolioReviews];
    const latest = reviews[0];
    if (latest && latest.period === payload.period) {
      latest.review_notes = [payload.summary, ...latest.review_notes];
      latest.action_plan = [payload.nextActions, ...latest.action_plan];
      latest.top_concerns = [payload.concerns, ...latest.top_concerns];
      latest.rebalance_status = payload.rebalanceDecision;
      set({ portfolioReviews: [...reviews] });
      return;
    }
    const next: PortfolioReview = {
      review_id: uid('review'),
      period: payload.period,
      review_date: new Date().toISOString().slice(0, 10),
      review_score: 80,
      rebalance_status: payload.rebalanceDecision,
      dca_completion: 90,
      dividend_goal_progress: 100,
      risk_alignment: 'Good',
      checklist_items: [{ label: 'Monthly review note added', done: true }],
      drift_summary: 'Pending new drift check',
      review_notes: [payload.summary],
      top_concerns: [payload.concerns],
      action_plan: [payload.nextActions],
      next_review_date: '2025-07-15',
    };
    set({ portfolioReviews: [next, ...reviews] });
  },
}));
