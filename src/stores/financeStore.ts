import { create } from 'zustand';
import { financeService } from '../services/financeService';
import type { FinanceEntry, RetirementPlan, SavingsGoal, Subscription, Wallet } from '../types/finance';
import { uid } from '../lib/utils';

interface FinanceState {
  wallets: Wallet[];
  entries: FinanceEntry[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  retirementPlan: RetirementPlan;
  expenseBreakdown: Array<{ name: string; value: number; color: string }>;
  addEntry: (entry: Omit<FinanceEntry, 'id'>) => void;
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  wallets: financeService.getWallets(),
  entries: financeService.getEntries(),
  subscriptions: financeService.getSubscriptions(),
  savingsGoals: financeService.getSavingsGoals(),
  retirementPlan: financeService.getRetirementPlan(),
  expenseBreakdown: financeService.getExpenseBreakdown(),
  addEntry: (entry) =>
    set((state) => {
      const signedAmount =
        entry.recordType === 'Income' || entry.recordType === 'Transfer' || entry.recordType === 'Savings' || entry.recordType === 'Investment'
          ? entry.amount
          : entry.recordType === 'Expense' || entry.recordType === 'Subscription'
            ? -entry.amount
            : 0;

      const nextEntry = { id: uid('finance'), ...entry };
      const shouldCreateSubscription = entry.recordType === 'Subscription' && entry.serviceName;
      const shouldUpdateExpenses = entry.recordType === 'Expense' || entry.recordType === 'Subscription';
      const fallbackColors = ['#16A34A', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
      const categoryName = entry.recordType === 'Subscription' ? 'Subscriptions' : entry.category;

      return {
        entries: [nextEntry, ...state.entries],
        wallets: state.wallets.map((wallet) =>
          wallet.id === entry.walletId ? { ...wallet, balance: Math.max(0, wallet.balance + signedAmount) } : wallet,
        ),
        expenseBreakdown: shouldUpdateExpenses
          ? state.expenseBreakdown.some((item) => item.name === categoryName)
            ? state.expenseBreakdown.map((item) => (item.name === categoryName ? { ...item, value: item.value + entry.amount } : item))
            : [
                ...state.expenseBreakdown,
                {
                  name: categoryName,
                  value: entry.amount,
                  color: fallbackColors[state.expenseBreakdown.length % fallbackColors.length],
                },
              ]
          : state.expenseBreakdown,
        subscriptions: shouldCreateSubscription
          ? [
              {
                id: uid('sub'),
                serviceName: entry.serviceName ?? 'New Subscription',
                planType: entry.planType ?? 'Monthly',
                amount: entry.amount,
                nextBillingDate: entry.nextBillingDate || entry.date,
                autoRenew: Boolean(entry.autoRenew),
              },
              ...state.subscriptions,
            ]
          : state.subscriptions,
      };
    }),
  addWallet: (wallet) => set((state) => ({ wallets: [{ id: uid('wallet'), ...wallet }, ...state.wallets] })),
  addSubscription: (subscription) => set((state) => ({ subscriptions: [{ id: uid('sub'), ...subscription }, ...state.subscriptions] })),
}));
