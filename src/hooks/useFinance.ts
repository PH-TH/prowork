import { useMemo } from 'react';
import { useFinanceStore } from '../stores/financeStore';
import { daysLeftInYear } from '../lib/date';
import { retirementProgress, subscriptionYtd, totalNetWorth } from '../lib/calculations';

export function useFinance() {
  const state = useFinanceStore();
  const netWorth = useMemo(() => totalNetWorth(state.wallets), [state.wallets]);
  const totalSaved = useMemo(
    () => state.wallets.filter((wallet) => wallet.type === 'Savings' || wallet.type === 'Reserve').reduce((sum, wallet) => sum + wallet.balance, 0),
    [state.wallets],
  );
  const investedAssets = useMemo(
    () => state.wallets.filter((wallet) => wallet.type === 'Investment').reduce((sum, wallet) => sum + wallet.balance, 0) || 1170000,
    [state.wallets],
  );
  const subscriptionSpentYtd = useMemo(() => subscriptionYtd(state.entries), [state.entries]);
  const fireProgress = useMemo(() => retirementProgress(state.retirementPlan), [state.retirementPlan]);
  return {
    ...state,
    netWorth,
    totalSaved,
    investedAssets,
    subscriptionSpentYtd,
    daysLeft: daysLeftInYear(),
    fireProgress,
  };
}
