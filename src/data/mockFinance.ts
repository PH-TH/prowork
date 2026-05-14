import type { FinanceEntry, RetirementPlan, SavingsGoal, Subscription, Wallet } from '../types/finance';

export const wallets: Wallet[] = [
  { id: 'w-scb', name: 'SCB Savings', balance: 850000, type: 'Savings', color: '#16A34A' },
  { id: 'w-kbank', name: 'KBank Savings', balance: 620000, type: 'Savings', color: '#3B82F6' },
  { id: 'w-krungsri', name: 'Krungsri Reserve', balance: 450000, type: 'Reserve', color: '#8B5CF6' },
  { id: 'w-ttb', name: 'TTB Daily Use', balance: 280000, type: 'Daily Use', color: '#F59E0B' },
  { id: 'w-cash', name: 'Cash Wallet', balance: 250000, type: 'Cash', color: '#64748B' },
];

export const savingsGoals: SavingsGoal[] = [
  { id: 'goal-emergency', name: 'Emergency Fund', target: 900000, current: 850000, color: '#16A34A' },
  { id: 'goal-retirement', name: 'Retirement', target: 9000000, current: 1800000, color: '#3B82F6' },
  { id: 'goal-investing', name: 'Investing', target: 3000000, current: 1170000, color: '#8B5CF6' },
  { id: 'goal-travel', name: 'Travel', target: 300000, current: 120000, color: '#F59E0B' },
];

export const subscriptions: Subscription[] = [
  { id: 'sub-chatgpt', serviceName: 'ChatGPT Plus', planType: 'Plus', amount: 720, nextBillingDate: '2026-05-15', autoRenew: true },
  { id: 'sub-tv', serviceName: 'TradingView', planType: 'Essential', amount: 550, nextBillingDate: '2026-05-21', autoRenew: true },
  { id: 'sub-canva', serviceName: 'Canva', planType: 'Pro', amount: 299, nextBillingDate: '2026-06-01', autoRenew: true },
  { id: 'sub-google', serviceName: 'Google One', planType: '2TB', amount: 350, nextBillingDate: '2026-06-06', autoRenew: true },
  { id: 'sub-netflix', serviceName: 'Netflix', planType: 'Standard', amount: 349, nextBillingDate: '2026-05-28', autoRenew: false },
];

export const financeEntries: FinanceEntry[] = [
  {
    id: 'fe-1',
    walletId: 'w-scb',
    recordType: 'Savings',
    category: 'Retirement',
    subcategory: 'Monthly DCA',
    amount: 85000,
    date: '2026-05-01',
    isRecurring: true,
    frequency: 'Monthly',
    nextBillingDate: '2026-06-01',
    remark: 'Retirement fund contribution.',
    tags: ['fire', 'discipline'],
  },
  {
    id: 'fe-2',
    walletId: 'w-ttb',
    recordType: 'Expense',
    category: 'Food',
    subcategory: 'Meal prep',
    amount: 4200,
    date: '2026-05-02',
    isRecurring: false,
    frequency: 'None',
    remark: 'Weekly groceries.',
    tags: ['health'],
  },
  {
    id: 'fe-3',
    walletId: 'w-kbank',
    recordType: 'Investment',
    category: 'ETF',
    subcategory: 'Global equity',
    amount: 99000,
    date: '2026-05-03',
    isRecurring: true,
    frequency: 'Monthly',
    nextBillingDate: '2026-06-03',
    remark: 'Automated investing rule.',
    tags: ['investing', 'long-term'],
  },
  ...subscriptions.map((subscription, index) => ({
    id: `fe-sub-${subscription.id}`,
    walletId: 'w-ttb',
    recordType: 'Subscription' as const,
    category: 'Subscriptions',
    subcategory: subscription.serviceName,
    amount: subscription.amount * (index === 0 ? 6 : index === 1 ? 4 : 3),
    date: '2026-05-01',
    isRecurring: true,
    frequency: 'Monthly' as const,
    nextBillingDate: subscription.nextBillingDate,
    serviceName: subscription.serviceName,
    planType: subscription.planType,
    autoRenew: subscription.autoRenew,
    remark: 'YTD subscription allocation.',
    tags: ['subscription'],
  })),
];

export const retirementPlan: RetirementPlan = {
  yearlyLivingExpense: 360000,
  target: 9000000,
  currentFund: 1800000,
  monthlyInvestNeeded: 184000,
  note: 'Example planning data using the 4% rule. Replace assumptions before making real decisions.',
};

export const expenseBreakdown = [
  { name: 'Housing', value: 32000, color: '#3B82F6' },
  { name: 'Food', value: 18000, color: '#16A34A' },
  { name: 'Transport', value: 9000, color: '#F59E0B' },
  { name: 'Bills', value: 7000, color: '#8B5CF6' },
  { name: 'Health', value: 6500, color: '#EF4444' },
  { name: 'Lifestyle', value: 9200, color: '#FACC15' },
];
