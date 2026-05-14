import { create } from 'zustand';
import { backtestSessions, backtestTrades } from '../data/mockBacktest';
import { uid } from '../lib/utils';
import type { BacktestSession, BacktestTrade } from '../types/backtest';

interface BacktestState {
  sessions: BacktestSession[];
  trades: BacktestTrade[];
  addSession: (session: Omit<BacktestSession, 'id'>) => void;
  addTrade: (trade: Omit<BacktestTrade, 'id'>) => void;
}

export const useBacktestStore = create<BacktestState>((set) => ({
  sessions: backtestSessions,
  trades: backtestTrades,
  addSession: (session) => set((state) => ({ sessions: [{ id: uid('bt'), ...session }, ...state.sessions] })),
  addTrade: (trade) => set((state) => ({ trades: [{ id: uid('bt-trade'), ...trade }, ...state.trades] })),
}));
