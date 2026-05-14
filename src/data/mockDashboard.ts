import type { DashboardKpi, ModuleSummary } from '../types/dashboard';

export const dashboardKpis: DashboardKpi[] = [
  { id: 'today-tasks', label: 'Today Tasks', value: 18, helper: '6 high priority', tone: 'blue' },
  { id: 'task-completion', label: 'Task Completion', value: 78, suffix: '%', helper: 'Ahead of last week', tone: 'green' },
  { id: 'habit-streak', label: 'Habit Streak', value: 23, suffix: ' days', helper: 'Best streak this quarter', tone: 'green' },
  { id: 'learning-today', label: 'Learning Today', value: 2.5, suffix: ' hrs', helper: 'English + AI prompt', tone: 'purple' },
  { id: 'finance-progress', label: 'Finance Progress', value: 82, suffix: '%', helper: 'Savings plan on track', tone: 'gold' },
  { id: 'journals-done', label: 'Journals Done', value: '2/4', helper: 'Manifest still open', tone: 'orange' },
];

export const moduleSummaries: ModuleSummary[] = [
  {
    id: 'work',
    title: 'Work summary',
    description: 'Critical blockers are concentrated in PLM and vendor follow-up.',
    metric: '72% project flow',
    status: '2 risks need review',
    progress: 72,
    tone: 'blue',
  },
  {
    id: 'habit',
    title: 'Habit summary',
    description: 'Exercise, meditation, and water logs are carrying the streak.',
    metric: '78% completion',
    status: '23 day streak',
    progress: 78,
    tone: 'green',
  },
  {
    id: 'learning',
    title: 'Learning summary',
    description: 'Morning learning is protected. Weekend project block is next.',
    metric: '2.5 hrs today',
    status: '8-10 hr target',
    progress: 64,
    tone: 'purple',
  },
  {
    id: 'finance',
    title: 'Finance summary',
    description: 'Emergency fund is strong and retirement target is visible.',
    metric: '82% yearly pace',
    status: 'FIRE 20%',
    progress: 82,
    tone: 'gold',
  },
  {
    id: 'journals',
    title: 'Journals summary',
    description: 'Calm mood trend, one honest fix, and tomorrow focus selected.',
    metric: '2/4 done',
    status: 'Mood calm',
    progress: 50,
    tone: 'orange',
  },
];

export const encouragementMessages = [
  {
    body: 'วันนี้คือการต่อยอดวินัยของเมื่อวาน ทำสิ่งเล็ก ๆ อย่างสม่ำเสมอ แล้วผลลัพธ์ใหญ่จะเกิดขึ้นเอง',
    quote: 'Discipline is the bridge between the life you imagine and the day you are willing to repeat.',
  },
  {
    body: 'อย่าเอาความเหนื่อยของเมื่อวานมาตัดสินศักยภาพของวันนี้ เริ่มใหม่แบบเล็ก ๆ แต่ชัดเจน',
    quote: 'Small, clear starts beat dramatic promises.',
  },
  {
    body: 'วันนี้ไม่ต้องชนะทุกเรื่อง แค่ชนะสิ่งสำคัญที่สุดหนึ่งเรื่องให้ได้ก่อน',
    quote: 'Focus is a promise kept in one direction.',
  },
];

export const dailyFocusItems = [
  { id: 'focus-1', label: 'Close BOM Data Review', module: 'Work', priority: 'High' },
  { id: 'focus-2', label: 'Morning Exercise + Meditation', module: 'Habit', priority: 'Medium' },
  { id: 'focus-3', label: 'English reading summary', module: 'Learning', priority: 'Medium' },
  { id: 'focus-4', label: 'Write gratitude + fix journal', module: 'Journals', priority: 'Low' },
];
