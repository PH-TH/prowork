import { useMemo } from 'react';
import { habitCompletionRate, projectProgress, retirementProgress, subscriptionYtd, totalNetWorth, workStats } from '../lib/calculations';
import { useAppStore } from '../stores/appStore';
import { useFinanceStore } from '../stores/financeStore';
import { useHabitStore } from '../stores/habitStore';
import { useJournalStore } from '../stores/journalStore';
import { useLearningStore } from '../stores/learningStore';
import { useWorkStore } from '../stores/workStore';
import { useBacktest } from './useBacktest';
import { useTrading } from './useTrading';
import type { DashboardKpi, ModuleSummary } from '../types/dashboard';

export function useDashboard() {
  const dateFilter = useAppStore((state) => state.dateFilter);
  const work = useWorkStore();
  const habit = useHabitStore();
  const learning = useLearningStore();
  const finance = useFinanceStore();
  const journal = useJournalStore();
  const trading = useTrading();
  const backtest = useBacktest();

  const todayWorkTasks = useMemo(
    () => work.tasks.filter((task) => task.startDate === dateFilter || task.dueDate === dateFilter),
    [dateFilter, work.tasks],
  );
  const todayLearningMinutes = useMemo(
    () => learning.sessions.filter((session) => session.date === dateFilter).reduce((sum, session) => sum + session.durationMinutes, 0),
    [dateFilter, learning.sessions],
  );
  const completedJournalParts = useMemo(() => {
    const today = journal.entries.find((entry) => entry.date === dateFilter);
    if (!today) return 0;
    return [today.keepDoing, today.fixChecked, today.moneyGrowthToday, today.gratitude1, today.manifestFocus].filter(Boolean).length;
  }, [dateFilter, journal.entries]);

  const workOverview = workStats(work.tasks);
  const todayWorkOverview = workStats(todayWorkTasks);
  const projectOverview = projectProgress(work.projects);
  const completionRate = habitCompletionRate(habit.logs);
  const fireProgress = retirementProgress(finance.retirementPlan);
  const netWorth = totalNetWorth(finance.wallets);
  const subscriptionSpent = subscriptionYtd(finance.entries);
  const activeHabits = habit.habits.filter((item) => item.isActive).length;
  const nextLearningSession = learning.sessions.find((session) => session.date >= dateFilter);
  const latestJournal = journal.entries.find((entry) => entry.date <= dateFilter) ?? journal.entries[0];
  const validatedBacktestProgress = Math.round((backtest.validatedCount / Math.max(1, backtest.sessions.length)) * 100);

  const kpis: DashboardKpi[] = [
    { id: 'today-tasks', label: 'Work Items Today', value: todayWorkTasks.length, helper: `${todayWorkOverview.overdue} blocked or overdue`, tone: todayWorkOverview.overdue ? 'red' : 'blue' },
    { id: 'task-completion', label: 'Task Progress', value: workOverview.progress, suffix: '%', helper: `${workOverview.pending} pending tasks`, tone: 'blue' },
    { id: 'habit-completion', label: 'Habit Completion', value: completionRate, suffix: '%', helper: `${activeHabits} active habits`, tone: 'green' },
    { id: 'learning-today', label: 'Learning Today', value: Math.round((todayLearningMinutes / 60) * 10) / 10, suffix: ' hrs', helper: `${learning.sessions.length} sessions logged`, tone: 'purple' },
    { id: 'fire-progress', label: 'FIRE Progress', value: fireProgress, suffix: '%', helper: `${Math.round(subscriptionSpent).toLocaleString()} THB subscriptions`, tone: 'green' },
    { id: 'journals-done', label: 'Journals Done', value: `${completedJournalParts}/5`, helper: 'Today reflection fields', tone: 'orange' },
    { id: 'trading-net-r', label: 'Trading Net R', value: trading.netR, suffix: 'R', helper: `${trading.winRate}% win rate`, tone: trading.netR >= 0 ? 'green' : 'red' },
    { id: 'backtest-edge', label: 'Backtest Edge', value: backtest.avgProfitFactor, helper: `${backtest.validatedCount} systems validated`, tone: backtest.avgProfitFactor >= 1.3 ? 'green' : 'orange' },
  ];

  const summaries: ModuleSummary[] = [
    {
      id: 'work',
      title: 'Work summary',
      description: `${todayWorkTasks.length} work items touch the selected date. Timeline, Calendar, and Task Status use the same Work store.`,
      metric: `${workOverview.pending} pending`,
      status: `${workOverview.overdue} blocked/overdue`,
      progress: projectOverview,
      tone: workOverview.overdue ? 'red' : 'blue',
    },
    {
      id: 'habit',
      title: 'Habit summary',
      description: 'Active habits, daily logs, reminders, and heatmap completion are connected.',
      metric: `${completionRate}% completion`,
      status: `${activeHabits} active habits`,
      progress: completionRate,
      tone: 'green',
    },
    {
      id: 'learning',
      title: 'Learning summary',
      description: nextLearningSession ? `Next focus: ${nextLearningSession.sessionType} session with a saved output path.` : 'Saved sessions appear in the learning calendar and recent session list.',
      metric: `${Math.round((todayLearningMinutes / 60) * 10) / 10} hrs today`,
      status: `${learning.skills.length} skills`,
      progress: Math.min(100, Math.round((todayLearningMinutes / 120) * 100)),
      tone: 'purple',
    },
    {
      id: 'finance',
      title: 'Finance summary',
      description: 'Entries update wallets, subscriptions, and finance KPIs.',
      metric: `${Number((netWorth / 1000000).toFixed(2))}M THB`,
      status: `FIRE ${fireProgress}%`,
      progress: fireProgress,
      tone: 'gold',
    },
    {
      id: 'journals',
      title: 'Journals summary',
      description: latestJournal ? `Latest mood: ${latestJournal.mood}. Journal entries update status, calendar, and overview cards.` : 'Journal entries update today status, calendar, and overview cards.',
      metric: `${completedJournalParts}/5 done`,
      status: `${journal.entries.length} entries`,
      progress: (completedJournalParts / 5) * 100,
      tone: 'orange',
    },
    {
      id: 'trading',
      title: 'Trading+ summary',
      description: 'Live trading journal tracks risk, R-multiple, rule discipline, watchlist, and emotional quality.',
      metric: `${trading.netR}R net`,
      status: `${trading.openTrades.length} open trades`,
      progress: trading.disciplineScore,
      tone: trading.disciplineScore >= 80 ? 'green' : 'orange',
    },
    {
      id: 'backtest',
      title: 'Backtest summary',
      description: 'FX Replay-style sessions connect strategy, market condition, MFE/MAE, mistakes, and validation status.',
      metric: `${backtest.totalNetR}R tested`,
      status: `${backtest.totalTrades} trades`,
      progress: validatedBacktestProgress,
      tone: validatedBacktestProgress >= 50 ? 'green' : 'purple',
    },
    {
      id: 'settings',
      title: 'Settings summary',
      description: 'Preferences, reminders, finance lock, AI motivation, and export controls are prepared for local use.',
      metric: 'Ready',
      status: 'Configurable',
      progress: 86,
      tone: 'blue',
    },
  ];

  return {
    kpis,
    summaries,
    encouragement: {
      body: 'วันนี้ให้เริ่มจากงานที่มีผลต่อระบบมากที่สุดหนึ่งอย่าง แล้วค่อยต่อด้วยนิสัย การเรียน การเงิน การเทรด และบันทึกใจให้ครบแบบไม่กดดันตัวเอง',
      quote: 'Small, clear starts beat dramatic promises.',
    },
    focusItems: [
      { id: 'focus-work', label: todayWorkTasks[0]?.title ?? 'Review one pending Work item', module: 'Work', priority: todayWorkOverview.overdue ? 'High' : 'Medium' },
      { id: 'focus-habit', label: 'Complete the next habit on the checklist', module: 'Habit', priority: completionRate < 75 ? 'High' : 'Medium' },
      { id: 'focus-learning', label: nextLearningSession ? `Create one output for ${nextLearningSession.sessionType}` : 'Log one learning output before the day ends', module: 'Learning', priority: 'Medium' },
      { id: 'focus-finance', label: 'Record one finance entry accurately', module: 'Finance', priority: 'High' },
      { id: 'focus-trading', label: 'Review one closed trade and tag the emotional pattern', module: 'Trading+', priority: trading.disciplineScore < 80 ? 'High' : 'Medium' },
      { id: 'focus-backtest', label: 'Add one FX Replay trade with MFE, MAE, and lesson learned', module: 'Backtest', priority: backtest.avgProfitFactor < 1.3 ? 'High' : 'Medium' },
      { id: 'focus-journal', label: completedJournalParts ? 'Finish the remaining journal prompts' : 'Write the honest fix and one big move', module: 'Journals', priority: 'Low' },
    ],
  };
}
