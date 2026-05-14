import { useMemo } from 'react';
import { useTradingStore } from '../stores/tradingStore';
import type { TradeEntry, TradingMistakeTag, TradingSession } from '../types/trading';

const weekLabels = ['W1 (1-7)', 'W2 (8-14)', 'W3 (15-21)', 'W4 (22-28)', 'W5 (29-31)'];
const tradingHours = Array.from({ length: 12 }, (_, index) => index * 2);
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const sessionOrder: TradingSession[] = ['London', 'New York', 'Asia', 'Overlap'];

function toTimeValue(trade: TradeEntry) {
  return `${trade.date}T${trade.entryTime ?? '00:00'}:00`;
}

function sortTrades(a: TradeEntry, b: TradeEntry) {
  return new Date(toTimeValue(a)).getTime() - new Date(toTimeValue(b)).getTime();
}

function tradePnl(trade: TradeEntry) {
  return trade.resultR * trade.riskAmount - (trade.commission ?? 0);
}

function targetR(trade: TradeEntry) {
  if (trade.rrTarget) return trade.rrTarget;
  const riskDistance = Math.abs(trade.entryPrice - trade.stopLoss);
  if (!riskDistance) return 0;
  return Number((Math.abs(trade.takeProfit - trade.entryPrice) / riskDistance).toFixed(2));
}

function dayLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function weekday(date: string) {
  const day = new Date(`${date}T00:00:00`).getDay();
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
}

function resultLabel(trade: TradeEntry) {
  if (trade.resultR > 0) return 'Win';
  if (trade.resultR < 0) return 'Loss';
  return 'BE';
}

export function useTrading() {
  const state = useTradingStore();

  const closedTrades = useMemo(() => state.trades.filter((trade) => trade.status === 'Closed'), [state.trades]);
  const openTrades = useMemo(() => state.trades.filter((trade) => trade.status === 'Open'), [state.trades]);
  const sortedClosedTrades = useMemo(() => [...closedTrades].sort(sortTrades), [closedTrades]);
  const winners = useMemo(() => closedTrades.filter((trade) => trade.resultR > 0), [closedTrades]);
  const losers = useMemo(() => closedTrades.filter((trade) => trade.resultR < 0), [closedTrades]);
  const breakevenTrades = useMemo(() => closedTrades.filter((trade) => trade.resultR === 0), [closedTrades]);
  const netR = useMemo(() => closedTrades.reduce((sum, trade) => sum + trade.resultR, 0), [closedTrades]);
  const realizedPnl = useMemo(() => closedTrades.reduce((sum, trade) => sum + tradePnl(trade), 0), [closedTrades]);
  const grossProfit = winners.reduce((sum, trade) => sum + tradePnl(trade), 0);
  const grossLoss = Math.abs(losers.reduce((sum, trade) => sum + tradePnl(trade), 0));
  const winRate = closedTrades.length ? Number(((winners.length / closedTrades.length) * 100).toFixed(2)) : 0;
  const avgR = closedTrades.length ? Number((netR / closedTrades.length).toFixed(2)) : 0;
  const profitFactor = grossLoss ? Number((grossProfit / grossLoss).toFixed(2)) : winners.length ? 99 : 0;
  const disciplineScore = closedTrades.length ? Math.round((closedTrades.filter((trade) => trade.ruleFollowed).length / closedTrades.length) * 100) : 0;
  const riskUsed = openTrades.reduce((sum, trade) => sum + trade.riskAmount, 0);
  const riskUsedPct = Number(((riskUsed / state.account.balance) * 100).toFixed(2));
  const bestWin = winners.length ? Math.max(...winners.map((trade) => tradePnl(trade))) : 0;
  const worstLoss = losers.length ? Math.min(...losers.map((trade) => tradePnl(trade))) : 0;

  const equityCurve = useMemo(() => {
    let equity = state.account.balance;
    return sortedClosedTrades.map((trade) => {
      equity += tradePnl(trade);
      return {
        day: dayLabel(trade.date),
        equity: Math.round(equity),
        pnl: Math.round(equity - state.account.balance),
        r: Number(trade.resultR.toFixed(2)),
      };
    });
  }, [sortedClosedTrades, state.account.balance]);

  const drawdown = useMemo(() => {
    let equity = state.account.balance;
    let peakEquity = equity;
    let cumulativeR = 0;
    let peakR = 0;
    let longest = 0;
    let current = 0;
    let maxDrawdownPct = 0;
    let maxDrawdownR = 0;

    const curve = sortedClosedTrades.map((trade) => {
      equity += tradePnl(trade);
      cumulativeR += trade.resultR;
      peakEquity = Math.max(peakEquity, equity);
      peakR = Math.max(peakR, cumulativeR);
      const drawdownPct = peakEquity ? ((equity - peakEquity) / peakEquity) * 100 : 0;
      const drawdownR = cumulativeR - peakR;
      if (drawdownPct < 0) current += 1;
      else current = 0;
      longest = Math.max(longest, current);
      maxDrawdownPct = Math.min(maxDrawdownPct, drawdownPct);
      maxDrawdownR = Math.min(maxDrawdownR, drawdownR);
      return {
        day: dayLabel(trade.date),
        drawdownPct: Number(drawdownPct.toFixed(2)),
        drawdownR: Number(drawdownR.toFixed(2)),
      };
    });

    const losingTrades = sortedClosedTrades.filter((trade) => trade.resultR < 0);
    const avgDrawdown = losingTrades.length ? losingTrades.reduce((sum, trade) => sum + trade.resultR, 0) / losingTrades.length : 0;
    const recoveryFactor = Math.abs(maxDrawdownR) ? Number((netR / Math.abs(maxDrawdownR)).toFixed(2)) : netR > 0 ? 99 : 0;

    return {
      curve,
      maxDrawdownPct: Number(maxDrawdownPct.toFixed(2)),
      maxDrawdownR: Number(maxDrawdownR.toFixed(2)),
      longestDrawdown: longest,
      avgDrawdown: Number(avgDrawdown.toFixed(2)),
      recoveryFactor,
    };
  }, [netR, sortedClosedTrades, state.account.balance]);

  const pnlByPeriod = useMemo(() => {
    const map = new Map<number, { period: string; pnl: number }>();
    weekLabels.forEach((label, index) => map.set(index, { period: label, pnl: 0 }));
    closedTrades.forEach((trade) => {
      const day = new Date(`${trade.date}T00:00:00`).getDate();
      const index = Math.min(4, Math.floor((day - 1) / 7));
      const current = map.get(index) ?? { period: weekLabels[index], pnl: 0 };
      map.set(index, { ...current, pnl: Math.round(current.pnl + tradePnl(trade)) });
    });
    return Array.from(map.values());
  }, [closedTrades]);

  const setupStats = useMemo(() => {
    const map = new Map<string, { setup: string; trades: number; wins: number; netR: number; netPnl: number }>();
    closedTrades.forEach((trade) => {
      const current = map.get(trade.setup) ?? { setup: trade.setup, trades: 0, wins: 0, netR: 0, netPnl: 0 };
      map.set(trade.setup, {
        ...current,
        trades: current.trades + 1,
        wins: current.wins + (trade.resultR > 0 ? 1 : 0),
        netR: Number((current.netR + trade.resultR).toFixed(2)),
        netPnl: Math.round(current.netPnl + tradePnl(trade)),
      });
    });
    return Array.from(map.values())
      .map((item) => ({
        ...item,
        winRate: item.trades ? Number(((item.wins / item.trades) * 100).toFixed(2)) : 0,
        avgR: item.trades ? Number((item.netR / item.trades).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.netPnl - a.netPnl);
  }, [closedTrades]);

  const sessionStats = useMemo(() => {
    const map = new Map<TradingSession, { session: TradingSession; trades: number; wins: number; netR: number; netPnl: number }>();
    sessionOrder.forEach((session) => map.set(session, { session, trades: 0, wins: 0, netR: 0, netPnl: 0 }));
    closedTrades.forEach((trade) => {
      const current = map.get(trade.session) ?? { session: trade.session, trades: 0, wins: 0, netR: 0, netPnl: 0 };
      map.set(trade.session, {
        ...current,
        trades: current.trades + 1,
        wins: current.wins + (trade.resultR > 0 ? 1 : 0),
        netR: Number((current.netR + trade.resultR).toFixed(2)),
        netPnl: Math.round(current.netPnl + tradePnl(trade)),
      });
    });
    return Array.from(map.values()).map((item) => ({
      ...item,
      winRate: item.trades ? Number(((item.wins / item.trades) * 100).toFixed(2)) : 0,
      avgR: item.trades ? Number((item.netR / item.trades).toFixed(2)) : 0,
    }));
  }, [closedTrades]);

  const winLossBreakEven = useMemo(
    () => [
      { name: 'Win', value: winners.length, color: '#22C55E' },
      { name: 'Loss', value: losers.length, color: '#EF4444' },
      { name: 'BE', value: breakevenTrades.length, color: '#94A3B8' },
    ],
    [breakevenTrades.length, losers.length, winners.length],
  );

  const assetPerformance = useMemo(() => {
    const colors = ['#16A34A', '#3B82F6', '#F59E0B', '#8B5CF6', '#64748B', '#EF4444'];
    const map = new Map<string, { name: string; value: number; netPnl: number; color: string }>();
    closedTrades.forEach((trade) => {
      const current = map.get(trade.symbol) ?? { name: trade.symbol, value: 0, netPnl: 0, color: colors[map.size % colors.length] };
      map.set(trade.symbol, { ...current, value: current.value + 1, netPnl: Math.round(current.netPnl + tradePnl(trade)) });
    });
    return Array.from(map.values()).sort((a, b) => b.netPnl - a.netPnl);
  }, [closedTrades]);

  const timeHeatmap = useMemo(() => {
    const points = dayLabels.flatMap((day) => tradingHours.map((hour) => ({ day, hour, trades: 0, pnl: 0 })));
    closedTrades.forEach((trade) => {
      const hour = Number((trade.entryTime ?? '00:00').slice(0, 2));
      const bucket = Math.floor(hour / 2) * 2;
      const day = weekday(trade.date);
      const target = points.find((point) => point.day === day && point.hour === bucket);
      if (target) {
        target.trades += 1;
        target.pnl += tradePnl(trade);
      }
    });
    const maxTrades = Math.max(1, ...points.map((point) => point.trades));
    return points.map((point) => ({ ...point, intensity: point.trades / maxTrades }));
  }, [closedTrades]);

  const maeMfeData = useMemo(
    () =>
      closedTrades.map((trade) => ({
        date: trade.date,
        symbol: trade.symbol,
        setup: trade.setup,
        x: Number(trade.resultR.toFixed(2)),
        y: Number((trade.mfeR ?? Math.max(0.2, trade.resultR)).toFixed(2)),
        mae: Number((-(trade.maeR ?? Math.min(1.2, Math.abs(trade.resultR)))).toFixed(2)),
        mfe: Number((trade.mfeR ?? Math.max(0.2, trade.resultR)).toFixed(2)),
        resultR: Number(trade.resultR.toFixed(2)),
        result: resultLabel(trade),
        pnl: tradePnl(trade),
      })),
    [closedTrades],
  );

  const confidenceScoreData = useMemo(
    () =>
      closedTrades.map((trade) => ({
        x: trade.confidenceScore ?? (trade.ruleFollowed ? 75 : 45),
        y: trade.resultR,
        result: resultLabel(trade),
        symbol: trade.symbol,
        setup: trade.setup,
        pnl: tradePnl(trade),
      })),
    [closedTrades],
  );

  const rrTargetActualData = useMemo(
    () =>
      closedTrades.map((trade) => ({
        x: Number(targetR(trade).toFixed(2)),
        y: Number(trade.resultR.toFixed(2)),
        result: resultLabel(trade),
        symbol: trade.symbol,
        setup: trade.setup,
        pnl: tradePnl(trade),
      })),
    [closedTrades],
  );

  const emotionMistakeStats = useMemo(() => {
    const map = new Map<string, { tag: string; count: number; netPnl: number }>();
    closedTrades.forEach((trade) => {
      const tags = (trade.mistakeTags?.length ? trade.mistakeTags : ['None']).filter((tag) => tag !== 'None') as TradingMistakeTag[];
      const finalTags = tags.length ? tags : [trade.emotion];
      finalTags.forEach((tag) => {
        const current = map.get(tag) ?? { tag, count: 0, netPnl: 0 };
        map.set(tag, { tag, count: current.count + 1, netPnl: Math.round(current.netPnl + tradePnl(trade)) });
      });
    });
    return Array.from(map.values())
      .map((item) => ({ ...item, percent: closedTrades.length ? Number(((item.count / closedTrades.length) * 100).toFixed(2)) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [closedTrades]);

  return {
    ...state,
    totalTrades: state.trades.length,
    closedTrades,
    openTrades,
    sortedClosedTrades,
    winners,
    losers,
    breakevenTrades,
    netR: Number(netR.toFixed(2)),
    realizedPnl: Math.round(realizedPnl),
    winRate,
    avgR,
    profitFactor,
    disciplineScore,
    riskUsed,
    riskUsedPct,
    bestWin: Math.round(bestWin),
    worstLoss: Math.round(worstLoss),
    equityCurve,
    drawdown,
    pnlByPeriod,
    setupStats,
    sessionStats,
    winLossBreakEven,
    assetPerformance,
    timeHeatmap,
    maeMfeData,
    confidenceScoreData,
    rrTargetActualData,
    emotionMistakeStats,
  };
}
