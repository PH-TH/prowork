import { create } from 'zustand';
import { tradingAccount, tradingFundingAccounts, tradingRules, tradingWatchlist, tradeEntries } from '../data/mockTrading';
import { uid } from '../lib/utils';
import type { TradeEntry, TradingAccount, TradingFundingAccount, TradingRule, TradingWatchlistItem } from '../types/trading';

interface TradingState {
  account: TradingAccount;
  fundingAccounts: TradingFundingAccount[];
  trades: TradeEntry[];
  watchlist: TradingWatchlistItem[];
  rules: TradingRule[];
  addTrade: (trade: Omit<TradeEntry, 'id'>) => void;
  updateTrade: (id: string, trade: Omit<TradeEntry, 'id'>) => void;
  addFundingAccount: (account: Omit<TradingFundingAccount, 'id'>) => void;
  updateFundingAccount: (id: string, account: Omit<TradingFundingAccount, 'id'>) => void;
  failFundingAccount: (id: string) => void;
  addWatchlistItem: (item: Omit<TradingWatchlistItem, 'id'>) => void;
  toggleRule: (id: string) => void;
}

function tradePnl(trade: Omit<TradeEntry, 'id'>) {
  return trade.resultR * trade.riskAmount - (trade.commission ?? 0);
}

export const useTradingStore = create<TradingState>((set) => ({
  account: tradingAccount,
  fundingAccounts: tradingFundingAccounts,
  trades: tradeEntries,
  watchlist: tradingWatchlist,
  rules: tradingRules,
  addTrade: (trade) =>
    set((state) => ({
      trades: [{ id: uid('trade'), ...trade }, ...state.trades],
      fundingAccounts:
        trade.fundingAccountId && trade.status === 'Closed'
          ? state.fundingAccounts.map((account) =>
              account.id === trade.fundingAccountId ? { ...account, currentBalance: account.currentBalance + tradePnl(trade) } : account,
            )
          : state.fundingAccounts,
    })),
  updateTrade: (id, trade) =>
    set((state) => {
      const previousTrade = state.trades.find((item) => item.id === id);
      const previousPnl = previousTrade && previousTrade.fundingAccountId && previousTrade.status === 'Closed' ? tradePnl(previousTrade) : 0;
      const nextPnl = trade.fundingAccountId && trade.status === 'Closed' ? tradePnl(trade) : 0;

      return {
        trades: state.trades.map((item) => (item.id === id ? { id, ...trade } : item)),
        fundingAccounts: state.fundingAccounts.map((account) => {
          const removePrevious = previousTrade?.fundingAccountId === account.id ? previousPnl : 0;
          const addNext = trade.fundingAccountId === account.id ? nextPnl : 0;
          return removePrevious || addNext ? { ...account, currentBalance: account.currentBalance - removePrevious + addNext } : account;
        }),
      };
    }),
  addFundingAccount: (account) => set((state) => ({ fundingAccounts: [{ id: uid('fund'), ...account }, ...state.fundingAccounts] })),
  updateFundingAccount: (id, account) =>
    set((state) => ({
      fundingAccounts: state.fundingAccounts.map((item) => (item.id === id ? { id, ...account } : item)),
    })),
  failFundingAccount: (id) =>
    set((state) => ({
      fundingAccounts: state.fundingAccounts.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Failed',
              notes: item.notes.includes('Archived as failed') ? item.notes : `${item.notes} Archived as failed, but testing cost is still included.`,
            }
          : item,
      ),
    })),
  addWatchlistItem: (item) => set((state) => ({ watchlist: [{ id: uid('watch'), ...item }, ...state.watchlist] })),
  toggleRule: (id) =>
    set((state) => ({
      rules: state.rules.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule)),
    })),
}));
