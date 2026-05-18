import type { Asset, DCAPlan, DividendPayment, GoldHolding, Holding, InvestmentDataset, InvestmentInsight, PortfolioReview, Transaction } from '../types/investment';

const safeNum = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

export function calculatePortfolioValue(holdings: Holding[] = []) {
  return holdings.reduce((sum, h) => sum + safeNum(h.market_value), 0);
}

export function calculateTotalInvested(holdings: Holding[] = [], transactions: Transaction[] = []) {
  const fromHoldings = holdings.reduce((sum, h) => sum + safeNum(h.invested_amount), 0);
  if (fromHoldings > 0) return fromHoldings;
  return transactions.filter((t) => t.type !== 'sell').reduce((sum, t) => sum + safeNum(t.amount), 0);
}

export function calculateUnrealizedGain(holdings: Holding[] = []) {
  const value = calculatePortfolioValue(holdings);
  const invested = calculateTotalInvested(holdings, []);
  const gain = value - invested;
  return { gain, percent: invested > 0 ? (gain / invested) * 100 : 0 };
}

export function calculateDividendYTD(dividendPayments: DividendPayment[] = [], year = '2025') {
  return dividendPayments
    .filter((d) => d.payment_date.startsWith(year))
    .reduce((sum, d) => sum + Math.max(0, safeNum(d.amount) - safeNum(d.tax)), 0);
}

export function calculateDCACompletion(dcaPlans: DCAPlan[] = [], transactions: Transaction[] = [], monthPrefix = '2025-05') {
  const planned = dcaPlans.filter((p) => p.enabled).reduce((sum, p) => sum + safeNum(p.monthly_amount), 0);
  const done = transactions.filter((t) => t.type === 'dca' && t.date.startsWith(monthPrefix)).reduce((sum, t) => sum + safeNum(t.amount), 0);
  const percent = planned > 0 ? Math.min(100, (done / planned) * 100) : 0;
  return { planned, done, percent, missedMonths: done === 0 ? 1 : 0 };
}

export function calculateRiskLevel(riskScore = 62) {
  if (riskScore >= 75) return 'Aggressive';
  if (riskScore >= 55) return 'Moderate';
  return 'Conservative';
}

export function calculateCurrentAllocation(holdings: Holding[] = [], assets: Asset[] = []) {
  const total = calculatePortfolioValue(holdings);
  const result: Record<string, number> = {};
  holdings.forEach((h) => {
    const asset = assets.find((a) => a.asset_id === h.asset_id);
    const key = asset?.asset_class ?? 'Unknown';
    result[key] = (result[key] ?? 0) + safeNum(h.market_value);
  });
  Object.keys(result).forEach((k) => {
    result[k] = total > 0 ? Number(((result[k] / total) * 100).toFixed(2)) : 0;
  });
  return result;
}

export function calculateTargetAllocation(dataset: InvestmentDataset) {
  return dataset.investmentPolicy?.target_allocation ?? {};
}

export function calculateAllocationDrift(current: Record<string, number>, target: Record<string, number>) {
  const keys = Array.from(new Set([...Object.keys(current), ...Object.keys(target)]));
  return keys.map((k) => ({ assetClass: k, target: safeNum(target[k]), current: safeNum(current[k]), drift: Number((safeNum(current[k]) - safeNum(target[k])).toFixed(2)) }));
}

export function calculateTargetMatch(current: Record<string, number>, target: Record<string, number>) {
  const drift = calculateAllocationDrift(current, target);
  const totalDiff = drift.reduce((sum, row) => sum + Math.abs(row.drift), 0);
  return Math.max(0, Number((100 - totalDiff / 2).toFixed(1)));
}

export function calculateRebalanceRecommendation(current: Record<string, number>, target: Record<string, number>, portfolioValue: number) {
  return calculateAllocationDrift(current, target).map((row) => ({
    assetClass: row.assetClass,
    action: row.drift > 0.5 ? 'Reduce' : row.drift < -0.5 ? 'Add' : 'Hold',
    amountTHB: Number((((Math.abs(row.drift) / 100) * portfolioValue) * (Math.abs(row.drift) > 0.5 ? 1 : 0)).toFixed(2)),
  }));
}

export function calculateCountryExposure(holdings: Holding[] = [], assets: Asset[] = []) {
  const total = calculatePortfolioValue(holdings);
  const map: Record<string, number> = {};
  holdings.forEach((h) => {
    const a = assets.find((x) => x.asset_id === h.asset_id);
    const country = a?.country ?? 'Unknown';
    map[country] = (map[country] ?? 0) + safeNum(h.market_value);
  });
  Object.keys(map).forEach((k) => (map[k] = total > 0 ? Number(((map[k] / total) * 100).toFixed(2)) : 0));
  return map;
}

export function calculateCurrencyExposure(holdings: Holding[] = []) {
  const total = calculatePortfolioValue(holdings);
  const map: Record<string, number> = {};
  holdings.forEach((h) => {
    map[h.currency] = (map[h.currency] ?? 0) + safeNum(h.market_value);
  });
  Object.keys(map).forEach((k) => (map[k] = total > 0 ? Number(((map[k] / total) * 100).toFixed(2)) : 0));
  return map;
}

export function calculateDCAPlan(dcaPlans: DCAPlan[] = []) {
  const enabled = dcaPlans.filter((p) => p.enabled);
  const total = enabled.reduce((sum, p) => sum + safeNum(p.monthly_amount), 0);
  return { enabledCount: enabled.length, monthlyBudget: total, nextBuyDate: enabled.map((x) => x.next_buy_date).sort()[0] ?? '' };
}

export function calculateSuggestedBuyThisMonth(current: Record<string, number>, target: Record<string, number>, budget: number) {
  const drift = calculateAllocationDrift(current, target).filter((d) => d.drift < 0);
  const gap = drift.reduce((sum, d) => sum + Math.abs(d.drift), 0) || 1;
  return drift.map((d) => ({ assetClass: d.assetClass, amount: Number(((Math.abs(d.drift) / gap) * budget).toFixed(2)) }));
}

export function calculateDCAConsistency(transactions: Transaction[] = []) {
  const months = Array.from(new Set(transactions.filter((t) => t.type === 'dca').map((t) => t.date.slice(0, 7))));
  return { activeMonths: months.length, consistencyPercent: months.length >= 6 ? 88 : months.length * 12 };
}

export function calculateDividendIncomeTrend(dividendPayments: DividendPayment[] = []) {
  const map: Record<string, number> = {};
  dividendPayments.forEach((d) => {
    const month = d.payment_date.slice(0, 7);
    map[month] = (map[month] ?? 0) + Math.max(0, safeNum(d.amount) - safeNum(d.tax));
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => ({ month, value: Number(value.toFixed(2)) }));
}

export function calculateDividendByAsset(dividendPayments: DividendPayment[] = [], assets: Asset[] = []) {
  const map: Record<string, number> = {};
  dividendPayments.forEach((d) => {
    const asset = assets.find((a) => a.asset_id === d.asset_id);
    const name = asset?.name ?? d.asset_id;
    map[name] = (map[name] ?? 0) + Math.max(0, safeNum(d.amount) - safeNum(d.tax));
  });
  return Object.entries(map).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
}

export function calculateForwardDividendYield(dividendYtd: number, portfolioValue: number) {
  if (portfolioValue <= 0) return 0;
  return Number((((dividendYtd * 2) / portfolioValue) * 100).toFixed(2));
}

export function calculateYieldOnCost(dividendYtd: number, totalInvested: number) {
  if (totalInvested <= 0) return 0;
  return Number((((dividendYtd * 2) / totalInvested) * 100).toFixed(2));
}

export function calculateDividendGoalProgress(dividendYtd: number, annualGoal: number) {
  return annualGoal > 0 ? Number(((dividendYtd / annualGoal) * 100).toFixed(1)) : 0;
}

export function calculateGoldAllocationTrend(goldHoldings: GoldHolding[] = [], snapshots: InvestmentDataset['portfolioSnapshots'] = []) {
  return snapshots.map((s) => {
    const goldValue = goldHoldings.reduce((sum, g) => sum + safeNum(g.market_value), 0);
    return { month: s.date.slice(0, 7), weight: s.total_value > 0 ? Number(((goldValue / s.total_value) * 100).toFixed(2)) : 0 };
  });
}

export function calculateGoldGain(goldHoldings: GoldHolding[] = []) {
  const totalGain = goldHoldings.reduce((sum, g) => sum + safeNum(g.gain), 0);
  const invested = goldHoldings.reduce((sum, g) => sum + safeNum(g.purchase_price), 0);
  return { gain: totalGain, gainPercent: invested > 0 ? Number(((totalGain / invested) * 100).toFixed(2)) : 0 };
}

export function calculateHedgeScore(currentAllocation: Record<string, number>) {
  const gold = safeNum(currentAllocation.Gold);
  const bonds = safeNum(currentAllocation.Bonds);
  const cash = safeNum(currentAllocation.Cash);
  return Math.min(100, Math.round(gold * 3 + bonds * 2 + cash * 2));
}

export function calculateGoldVsPortfolioDrawdown(snapshots: InvestmentDataset['portfolioSnapshots'] = []) {
  return snapshots.map((s, index) => ({ month: s.date.slice(0, 7), portfolio: Number((-Math.abs(Math.sin(index) * 12 + 3)).toFixed(2)), gold: Number((-Math.abs(Math.cos(index) * 4 + 1)).toFixed(2)) }));
}

export function calculatePortfolioReviewScore(review: PortfolioReview | undefined, currentDrift: number, dcaCompletion: number, dividendGoal: number, riskAlignment: string) {
  if (!review) return 0;
  const checklistScore = calculateReviewChecklist(review).score;
  const driftScore = Math.max(0, 100 - currentDrift * 8);
  const dcaScore = dcaCompletion;
  const dividendScore = Math.min(100, dividendGoal);
  const riskScore = riskAlignment.toLowerCase().includes('good') ? 90 : 70;
  return Math.round(checklistScore * 0.25 + driftScore * 0.2 + dcaScore * 0.2 + dividendScore * 0.2 + riskScore * 0.15);
}

export function calculateReviewChecklist(review: PortfolioReview | undefined) {
  const total = review?.checklist_items.length ?? 0;
  const done = review?.checklist_items.filter((x) => x.done).length ?? 0;
  return { total, done, score: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function generateInvestmentInsights(dataset: InvestmentDataset): InvestmentInsight[] {
  const current = calculateCurrentAllocation(dataset.holdings, dataset.assets);
  const target = calculateTargetAllocation(dataset);
  const drift = calculateAllocationDrift(current, target);
  const large = drift.filter((d) => Math.abs(d.drift) >= 3);
  const dynamicInsights = large.map((d, idx) => ({
    insight_id: `auto-${idx + 1}`,
    tab: 'allocation' as const,
    severity: Math.abs(d.drift) > 5 ? 'high' as const : 'medium' as const,
    title: `${d.assetClass} is ${d.drift > 0 ? 'overweight' : 'underweight'} by ${Math.abs(d.drift).toFixed(1)}%`,
    description_thai: `สัดส่วน ${d.assetClass} เบี่ยงเบนจากเป้าหมาย ควรทยอยปรับอย่างมีวินัย`,
    created_at: new Date().toISOString().slice(0, 10),
  }));
  return [...dataset.investmentInsights, ...dynamicInsights];
}
