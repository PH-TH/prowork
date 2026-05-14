import type { PageKey } from '../types/dashboard';
import type { TaskPriority, TaskStatus, WorkTabType } from '../types/work';

export const NAV_ITEMS: Array<{ id: PageKey; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'work', label: 'Work' },
  { id: 'habit', label: 'Habit' },
  { id: 'learning', label: 'Learning' },
  { id: 'finance', label: 'Finance Lock' },
  { id: 'journals', label: 'Journals' },
  { id: 'trading', label: 'Trading+' },
  { id: 'backtest', label: 'Backtest' },
  { id: 'settings', label: 'Settings' },
];

export const WORK_TAB_TYPES = [
  'Estimator',
  'Part Price',
  'Manpower',
  'Project',
  'Product',
  'Samsung Member',
  'PLM Status',
  'Timeline',
] as const satisfies readonly WorkTabType[];

export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'] as const satisfies readonly TaskPriority[];
export const TASK_STATUS_OPTIONS = ['Todo', 'In Progress', 'In Review', 'Done', 'Blocked', 'Overdue'] as const satisfies readonly TaskStatus[];

export const HABIT_CATEGORIES = ['Health', 'Mind', 'Productivity', 'Learning', 'Finance', 'Trading', 'Lifestyle'] as const;
export const HABIT_FREQUENCIES = ['Daily', 'Weekdays', 'Weekly', 'Specific Days', 'Monthly'] as const;

export const LEARNING_SESSION_TYPES = ['Learn', 'Practice', 'Project', 'Review', 'Reading', 'Backtest', 'Prompt Testing'] as const;
export const LEARNING_OUTPUT_TYPES = [
  'No Output',
  'Note',
  'Summary',
  'Prompt',
  'Code',
  'Dashboard',
  'Backtest Report',
  'Checklist',
  'Template',
] as const;

export const FINANCE_RECORD_TYPES = ['Income', 'Expense', 'Transfer', 'Savings', 'Investment', 'Subscription'] as const;
export const FINANCE_FREQUENCIES = ['None', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const;

export const MOODS = ['Calm', 'Focused', 'Grateful', 'Stressed', 'Tired', 'Hopeful'] as const;
