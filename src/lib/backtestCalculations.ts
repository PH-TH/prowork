import type { TradeRecord } from '../types/backtest';

export function safeDivide(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

export function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

export function calcNetR(trades: TradeRecord[]) {
  return round(trades.reduce((sum, trade) => sum + trade.result_r, 0));
}

export function calcWinLossBreakEven(trades: TradeRecord[]) {
  const wins = trades.filter((trade) => trade.result_r > 0).length;
  const losses = trades.filter((trade) => trade.result_r < 0).length;
  const breakEven = trades.filter((trade) => trade.result_r === 0).length;
  return { wins, losses, breakEven, total: trades.length };
}

export function calcWinRate(trades: TradeRecord[]) {
  const { wins, total } = calcWinLossBreakEven(trades);
  return round(safeDivide(wins, total) * 100, 2);
}

export function calcProfitFactor(trades: TradeRecord[]) {
  const grossWin = trades.filter((trade) => trade.result_r > 0).reduce((sum, trade) => sum + trade.result_r, 0);
  const grossLoss = Math.abs(trades.filter((trade) => trade.result_r < 0).reduce((sum, trade) => sum + trade.result_r, 0));
  return grossLoss === 0 ? (grossWin > 0 ? 99 : 0) : round(grossWin / grossLoss, 2);
}

export function calcExpectancyR(trades: TradeRecord[]) {
  return round(safeDivide(calcNetR(trades), trades.length), 3);
}

export function calcCumulativeR(trades: TradeRecord[]) {
  let total = 0;
  return trades.map((trade) => {
    total += trade.result_r;
    return round(total, 3);
  });
}

export function calcMaxDrawdownR(trades: TradeRecord[]) {
  const curve = calcCumulativeR(trades);
  let peak = 0;
  let maxDrawdown = 0;
  curve.forEach((value) => {
    peak = Math.max(peak, value);
    const drawdown = peak - value;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });
  return round(maxDrawdown, 2);
}

export function calcDrawdownSeries(trades: TradeRecord[]) {
  const curve = calcCumulativeR(trades);
  let peak = 0;
  return curve.map((value) => {
    peak = Math.max(peak, value);
    return round(peak - value, 2);
  });
}

export function calcAverageWinLossR(trades: TradeRecord[]) {
  const wins = trades.filter((trade) => trade.result_r > 0);
  const losses = trades.filter((trade) => trade.result_r < 0);
  const averageWin = round(safeDivide(wins.reduce((sum, trade) => sum + trade.result_r, 0), wins.length), 3);
  const averageLoss = round(safeDivide(losses.reduce((sum, trade) => sum + trade.result_r, 0), losses.length), 3);
  return { averageWin, averageLoss };
}

export function calcPayoffRatio(trades: TradeRecord[]) {
  const { averageWin, averageLoss } = calcAverageWinLossR(trades);
  return averageLoss === 0 ? (averageWin > 0 ? 99 : 0) : round(averageWin / Math.abs(averageLoss), 2);
}

export function calcMaxConsecutiveLosses(trades: TradeRecord[]) {
  let current = 0;
  let max = 0;
  trades.forEach((trade) => {
    if (trade.result_r < 0) {
      current += 1;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  });
  return max;
}

export function calcRuleCompliance(trades: TradeRecord[]) {
  const score = trades.reduce((sum, trade) => sum + safeDivide(trade.rule_score, trade.max_rule_score), 0);
  return round(safeDivide(score, trades.length) * 100, 2);
}

export function calcMfeCaptureRatio(trades: TradeRecord[]) {
  const withMfe = trades.filter((trade) => trade.mfe_r > 0);
  const total = withMfe.reduce((sum, trade) => sum + safeDivide(trade.result_r, trade.mfe_r), 0);
  return round(safeDivide(total, withMfe.length) * 100, 2);
}

export function weekKey(date: string) {
  const value = new Date(`${date}T00:00:00`);
  const start = new Date(value);
  start.setDate(value.getDate() - value.getDay());
  return start.toISOString().slice(0, 10);
}

export function monthKey(date: string) {
  return date.slice(0, 7);
}

export function calcWorstPeriods(trades: TradeRecord[]) {
  const byDay = new Map<string, number>();
  const byWeek = new Map<string, number>();
  const byMonth = new Map<string, number>();
  trades.forEach((trade) => {
    byDay.set(trade.date, (byDay.get(trade.date) ?? 0) + trade.result_r);
    const wk = weekKey(trade.date);
    byWeek.set(wk, (byWeek.get(wk) ?? 0) + trade.result_r);
    const mk = monthKey(trade.date);
    byMonth.set(mk, (byMonth.get(mk) ?? 0) + trade.result_r);
  });
  const worstTrade = trades.reduce((worst, trade) => (trade.result_r < worst.result_r ? trade : worst), trades[0]);
  const worstDay = [...byDay.entries()].sort((a, b) => a[1] - b[1])[0];
  const worstWeek = [...byWeek.entries()].sort((a, b) => a[1] - b[1])[0];
  const worstMonth = [...byMonth.entries()].sort((a, b) => a[1] - b[1])[0];
  return {
    worstTrade: worstTrade ? round(worstTrade.result_r, 2) : 0,
    worstDay: worstDay ? round(worstDay[1], 2) : 0,
    worstWeek: worstWeek ? round(worstWeek[1], 2) : 0,
    worstMonth: worstMonth ? round(worstMonth[1], 2) : 0,
  };
}

export function calcRecoveryFactor(trades: TradeRecord[]) {
  const netR = calcNetR(trades);
  const maxDd = calcMaxDrawdownR(trades);
  return maxDd === 0 ? 0 : round(netR / maxDd, 2);
}
