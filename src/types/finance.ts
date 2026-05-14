export type FinanceRecordType = 'Income' | 'Expense' | 'Transfer' | 'Savings' | 'Investment' | 'Subscription';
export type FinanceFrequency = 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'Savings' | 'Reserve' | 'Daily Use' | 'Cash' | 'Investment';
  color: string;
}

export interface FinanceEntry {
  id: string;
  walletId: string;
  recordType: FinanceRecordType;
  category: string;
  subcategory: string;
  amount: number;
  date: string;
  isRecurring: boolean;
  frequency: FinanceFrequency;
  nextBillingDate?: string;
  serviceName?: string;
  planType?: string;
  autoRenew?: boolean;
  remark: string;
  tags: string[];
}

export interface Subscription {
  id: string;
  serviceName: string;
  planType: string;
  amount: number;
  nextBillingDate: string;
  autoRenew: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  color: string;
}

export interface RetirementPlan {
  yearlyLivingExpense: number;
  target: number;
  currentFund: number;
  monthlyInvestNeeded: number;
  note: string;
}
