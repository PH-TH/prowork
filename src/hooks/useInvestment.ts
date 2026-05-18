import { useMemo } from 'react';
import {
  calculateAllocationDrift,
  calculateCountryExposure,
  calculateCurrencyExposure,
  calculateDCACompletion,
  calculateDCAConsistency,
  calculateDCAPlan,
  calculateDividendByAsset,
  calculateDividendGoalProgress,
  calculateDividendIncomeTrend,
  calculateDividendYTD,
  calculateForwardDividendYield,
  calculateGoldAllocationTrend,
  calculateGoldGain,
  calculateGoldVsPortfolioDrawdown,
  calculateHedgeScore,
  calculatePortfolioReviewScore,
  calculatePortfolioValue,
  calculateCurrentAllocation,
  calculateRiskLevel,
  calculateSuggestedBuyThisMonth,
  calculateTargetAllocation,
  calculateTargetMatch,
  calculateTotalInvested,
  calculateUnrealizedGain,
  calculateYieldOnCost,
} from '../lib/investmentCalculations';
import { useInvestmentStore } from '../stores/investmentStore';

export function useInvestment() {
  const store = useInvestmentStore();

  return useMemo(() => {
    const portfolioValue = calculatePortfolioValue(store.holdings);
    const totalInvested = calculateTotalInvested(store.holdings, store.transactions);
    const unrealized = calculateUnrealizedGain(store.holdings);
    const dividendYtd = calculateDividendYTD(store.dividendPayments, '2025');
    const dca = calculateDCACompletion(store.dcaPlans, store.transactions, '2025-05');
    const currentAllocation = calculateCurrentAllocation(store.holdings, store.assets);
    const targetAllocation = calculateTargetAllocation(store);
    const driftRows = calculateAllocationDrift(currentAllocation, targetAllocation);
    const targetMatch = calculateTargetMatch(currentAllocation, targetAllocation);
    const countryExposure = calculateCountryExposure(store.holdings, store.assets);
    const currencyExposure = calculateCurrencyExposure(store.holdings);
    const dcaPlan = calculateDCAPlan(store.dcaPlans);
    const suggestedBuy = calculateSuggestedBuyThisMonth(currentAllocation, targetAllocation, 10000);
    const dcaConsistency = calculateDCAConsistency(store.transactions);
    const dividendTrend = calculateDividendIncomeTrend(store.dividendPayments);
    const dividendByAsset = calculateDividendByAsset(store.dividendPayments, store.assets);
    const forwardYield = calculateForwardDividendYield(dividendYtd, portfolioValue);
    const yieldOnCost = calculateYieldOnCost(dividendYtd, totalInvested);
    const dividendGoalProgress = calculateDividendGoalProgress(dividendYtd, 12000);
    const goldTrend = calculateGoldAllocationTrend(store.goldHoldings, store.portfolioSnapshots);
    const goldGain = calculateGoldGain(store.goldHoldings);
    const hedgeScore = calculateHedgeScore(currentAllocation);
    const goldVsDrawdown = calculateGoldVsPortfolioDrawdown(store.portfolioSnapshots);
    const latestReview = store.portfolioReviews[0];
    const reviewScore = calculatePortfolioReviewScore(latestReview, driftRows.reduce((sum, x) => sum + Math.abs(x.drift), 0), dca.percent, dividendGoalProgress, latestReview?.risk_alignment ?? 'Good');

    return {
      ...store,
      portfolioValue,
      totalInvested,
      unrealized,
      dividendYtd,
      dca,
      currentAllocation,
      targetAllocation,
      driftRows,
      targetMatch,
      countryExposure,
      currencyExposure,
      dcaPlan,
      suggestedBuy,
      dcaConsistency,
      dividendTrend,
      dividendByAsset,
      forwardYield,
      yieldOnCost,
      dividendGoalProgress,
      goldTrend,
      goldGain,
      hedgeScore,
      goldVsDrawdown,
      latestReview,
      reviewScore,
      riskLevel: calculateRiskLevel(store.portfolioSnapshots[store.portfolioSnapshots.length - 1]?.risk_score ?? 62),
    };
  }, [store]);
}
