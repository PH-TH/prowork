import { expenseBreakdown, financeEntries, retirementPlan, savingsGoals, subscriptions, wallets } from '../data/mockFinance';

export const financeService = {
  getWallets: () => wallets,
  getEntries: () => financeEntries,
  getSubscriptions: () => subscriptions,
  getSavingsGoals: () => savingsGoals,
  getRetirementPlan: () => retirementPlan,
  getExpenseBreakdown: () => expenseBreakdown,
};
