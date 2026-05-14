import { useMemo } from 'react';
import { useBacktestStore } from '../stores/backtestStore';

export function useBacktest() {
  const state = useBacktestStore();

  const totalTrades = state.sessions.reduce((sum, session) => sum + session.trades, 0);
  const totalWins = state.sessions.reduce((sum, session) => sum + session.wins, 0);
  const totalLosses = state.sessions.reduce((sum, session) => sum + session.losses, 0);
  const totalNetR = state.sessions.reduce((sum, session) => sum + session.netR, 0);
  const winRate = totalTrades ? Math.round((totalWins / totalTrades) * 100) : 0;
  const avgProfitFactor = state.sessions.length
    ? Number((state.sessions.reduce((sum, session) => sum + session.profitFactor, 0) / state.sessions.length).toFixed(2))
    : 0;
  const expectancyR = totalTrades ? Number((totalNetR / totalTrades).toFixed(2)) : 0;
  const maxDrawdownR = state.sessions.length ? Math.max(...state.sessions.map((session) => session.maxDrawdownR)) : 0;
  const validatedCount = state.sessions.filter((session) => session.status === 'Validated').length;

  const equityCurve = useMemo(() => {
    let total = 0;
    return [...state.sessions].reverse().map((session) => {
      total += session.netR;
      return {
        day: session.name.split(' ').slice(0, 2).join(' '),
        netR: Number(total.toFixed(2)),
        expectancy: session.expectancyR,
      };
    });
  }, [state.sessions]);

  const strategyPerformance = useMemo(() => (
    state.sessions
      .map((session) => ({
        strategy: session.strategy,
        netR: session.netR,
        profitFactor: session.profitFactor,
        adherence: session.ruleAdherence,
      }))
      .sort((a, b) => b.netR - a.netR)
  ), [state.sessions]);

  const statusDistribution = useMemo(() => {
    const colors: Record<string, string> = {
      Validated: '#16A34A',
      'In Review': '#3B82F6',
      Draft: '#F59E0B',
      Rejected: '#EF4444',
    };
    return ['Validated', 'In Review', 'Draft', 'Rejected']
      .map((status) => ({
        name: status,
        value: state.sessions.filter((session) => session.status === status).length,
        color: colors[status],
      }))
      .filter((item) => item.value > 0);
  }, [state.sessions]);

  return {
    ...state,
    totalTrades,
    totalWins,
    totalLosses,
    totalNetR: Number(totalNetR.toFixed(2)),
    winRate,
    avgProfitFactor,
    expectancyR,
    maxDrawdownR,
    validatedCount,
    equityCurve,
    strategyPerformance,
    statusDistribution,
  };
}
