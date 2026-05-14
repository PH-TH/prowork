import type { FinanceEntry, RetirementPlan, SavingsGoal, Wallet } from '../types/finance';
import type { HabitLog } from '../types/habit';
import type { WorkProject, WorkTask } from '../types/work';
import { percent } from './utils';

export function workStats(tasks: WorkTask[]) {
  const completed = tasks.filter((task) => task.status === 'Done').length;
  const pending = tasks.filter((task) => task.status !== 'Done').length;
  const overdue = tasks.filter((task) => task.status === 'Blocked' || task.status === 'Overdue').length;
  const progress = tasks.length ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length) : 0;
  return { completed, pending, overdue, progress };
}

export function taskStatusDistribution(tasks: WorkTask[]) {
  return [
    { name: 'Completed', value: tasks.filter((task) => task.status === 'Done').length, color: '#16A34A' },
    { name: 'In Progress', value: tasks.filter((task) => task.status === 'In Progress' || task.status === 'In Review').length, color: '#3B82F6' },
    { name: 'At Risk', value: tasks.filter((task) => task.status === 'Blocked').length, color: '#F59E0B' },
    { name: 'Overdue', value: tasks.filter((task) => task.status === 'Overdue').length, color: '#EF4444' },
  ];
}

export function projectProgress(projects: WorkProject[]) {
  return projects.length ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length) : 0;
}

export function habitCompletionRate(logs: HabitLog[]) {
  const eligible = logs.filter((log) => log.status !== 'No Data');
  const done = eligible.filter((log) => log.status === 'Completed' || log.status === 'Perfect').length;
  return percent(done, eligible.length);
}

export function totalNetWorth(wallets: Wallet[]) {
  return wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
}

export function subscriptionYtd(entries: FinanceEntry[]) {
  return entries.filter((entry) => entry.recordType === 'Subscription').reduce((sum, entry) => sum + entry.amount, 0);
}

export function goalProgress(goal: SavingsGoal) {
  return Math.min(100, percent(goal.current, goal.target));
}

export function retirementProgress(plan: RetirementPlan) {
  return Math.min(100, percent(plan.currentFund, plan.target));
}
