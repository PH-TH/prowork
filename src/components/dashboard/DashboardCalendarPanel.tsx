import { addDays, addMinutes, addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, BriefcaseBusiness, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, Dumbbell, LineChart, NotebookPen, Plus, Target } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { appToday, dateKey, formatDateLabel } from '../../lib/date';
import { cn, formatCurrency } from '../../lib/utils';
import { useAppStore } from '../../stores/appStore';
import { useBacktestStore } from '../../stores/backtestStore';
import { useFinanceStore } from '../../stores/financeStore';
import { useHabitStore } from '../../stores/habitStore';
import { useJournalStore } from '../../stores/journalStore';
import { useLearningStore } from '../../stores/learningStore';
import { useTradingStore } from '../../stores/tradingStore';
import { useWorkStore } from '../../stores/workStore';
import type { PageKey } from '../../types/dashboard';
import type { TaskPriority } from '../../types/work';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

type DashboardModule = 'work' | 'habit' | 'learning' | 'finance' | 'journals' | 'trading' | 'backtest';

interface CalendarItem {
  id: string;
  module: DashboardModule;
  title: string;
  description: string;
  time?: string;
  tone: 'green' | 'blue' | 'orange' | 'purple' | 'red' | 'gold' | 'gray';
  meta: string;
}

const moduleOptions: Array<{ label: string; value: DashboardModule }> = [
  { label: 'Work', value: 'work' },
  { label: 'Habit', value: 'habit' },
  { label: 'Learning', value: 'learning' },
  { label: 'Finance', value: 'finance' },
  { label: 'Journals', value: 'journals' },
  { label: 'Trading+', value: 'trading' },
  { label: 'Backtest', value: 'backtest' },
];

const moduleMeta: Record<
  DashboardModule,
  {
    label: string;
    thai: string;
    page: PageKey;
    icon: JSX.Element;
    dot: string;
    badge: string;
    soft: string;
  }
> = {
  work: {
    label: 'Work',
    thai: 'งาน',
    page: 'work',
    icon: <BriefcaseBusiness size={14} />,
    dot: 'bg-blue-500',
    badge: 'border-blue-100 bg-blue-50 text-blue-700',
    soft: 'border-blue-100 bg-blue-50 text-blue-700',
  },
  habit: {
    label: 'Habit',
    thai: 'นิสัย',
    page: 'habit',
    icon: <Dumbbell size={14} />,
    dot: 'bg-emerald-500',
    badge: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    soft: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  },
  learning: {
    label: 'Learning',
    thai: 'เรียนรู้',
    page: 'learning',
    icon: <BookOpen size={14} />,
    dot: 'bg-violet-500',
    badge: 'border-violet-100 bg-violet-50 text-violet-700',
    soft: 'border-violet-100 bg-violet-50 text-violet-700',
  },
  finance: {
    label: 'Finance',
    thai: 'การเงิน',
    page: 'finance',
    icon: <CircleDollarSign size={14} />,
    dot: 'bg-amber-500',
    badge: 'border-amber-100 bg-amber-50 text-amber-700',
    soft: 'border-amber-100 bg-amber-50 text-amber-700',
  },
  journals: {
    label: 'Journals',
    thai: 'บันทึก',
    page: 'journals',
    icon: <NotebookPen size={14} />,
    dot: 'bg-pink-500',
    badge: 'border-pink-100 bg-pink-50 text-pink-700',
    soft: 'border-pink-100 bg-pink-50 text-pink-700',
  },
  trading: {
    label: 'Trading+',
    thai: 'เทรด',
    page: 'trading',
    icon: <LineChart size={14} />,
    dot: 'bg-cyan-500',
    badge: 'border-cyan-100 bg-cyan-50 text-cyan-700',
    soft: 'border-cyan-100 bg-cyan-50 text-cyan-700',
  },
  backtest: {
    label: 'Backtest',
    thai: 'ทดสอบระบบ',
    page: 'backtest',
    icon: <Target size={14} />,
    dot: 'bg-slate-600',
    badge: 'border-slate-200 bg-slate-50 text-slate-700',
    soft: 'border-slate-200 bg-slate-50 text-slate-700',
  },
};

const priorityOptions: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

const toneBorder: Record<CalendarItem['tone'], string> = {
  green: 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 dark:border-emerald-800 dark:from-emerald-950/70 dark:via-green-950/55 dark:to-teal-950/70',
  blue: 'border-blue-200 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-100 dark:border-blue-800 dark:from-blue-950/70 dark:via-sky-950/55 dark:to-cyan-950/70',
  orange: 'border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 dark:border-orange-800 dark:from-orange-950/70 dark:via-amber-950/55 dark:to-yellow-950/70',
  purple: 'border-violet-200 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-100 dark:border-violet-800 dark:from-violet-950/70 dark:via-purple-950/55 dark:to-fuchsia-950/70',
  red: 'border-red-200 bg-gradient-to-br from-red-50 via-rose-50 to-orange-100 dark:border-red-800 dark:from-red-950/70 dark:via-rose-950/55 dark:to-orange-950/70',
  gold: 'border-yellow-200 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 dark:border-yellow-800 dark:from-yellow-950/70 dark:via-amber-950/55 dark:to-orange-950/70',
  gray: 'border-slate-200 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/60',
};

function addTime(startTime: string, minutes: number) {
  const [hours, mins] = startTime.split(':').map(Number);
  const base = new Date(2026, 0, 1, hours || 0, mins || 0);
  return format(addMinutes(base, minutes), 'HH:mm');
}

function summarizeCount(count: number) {
  if (count === 0) return 'No activity';
  if (count === 1) return '1 activity';
  return `${count} activities`;
}

export function DashboardCalendarPanel() {
  const { dateFilter, setDateFilter, setActivePage, lockFinance, addToast } = useAppStore();
  const work = useWorkStore();
  const habit = useHabitStore();
  const learning = useLearningStore();
  const finance = useFinanceStore();
  const journals = useJournalStore();
  const trading = useTradingStore();
  const backtest = useBacktestStore();

  const selectedDate = useMemo(() => parseISO(dateFilter), [dateFilter]);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(selectedDate));
  const [isAdding, setIsAdding] = useState(false);
  const [module, setModule] = useState<DashboardModule>('work');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:30');
  const [amount, setAmount] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [details, setDetails] = useState('');

  useEffect(() => {
    setVisibleMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

  const allItemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    const push = (key: string, item: CalendarItem) => {
      map.set(key, [...(map.get(key) ?? []), item]);
    };

    work.tasks.forEach((task) => {
      const project = work.projects.find((item) => item.id === task.projectId);
      const assignee = work.members.find((member) => member.id === task.assigneeId);
      push(task.dueDate, {
        id: task.id,
        module: 'work',
        title: task.title,
        description: `${project?.name ?? 'Work project'} - ${task.status} - ${task.progress}%`,
        tone: task.status === 'Done' ? 'green' : task.status === 'Blocked' || task.status === 'Overdue' ? 'red' : 'blue',
        meta: assignee?.name ?? 'Unassigned',
      });
    });

    work.projects.forEach((project) => {
      const owner = work.members.find((member) => member.id === project.ownerId);
      eachDayOfInterval({ start: parseISO(project.startDate), end: parseISO(project.endDate) }).forEach((projectDay) => {
        push(dateKey(projectDay), {
          id: project.id,
          module: 'work',
          title: project.name,
          description: `${project.status} - ${project.progress}% progress`,
          tone: project.status === 'Completed' ? 'green' : project.status === 'Overdue' ? 'red' : project.status === 'At Risk' ? 'orange' : 'blue',
          meta: owner?.name ?? 'Project owner',
        });
      });
    });

    habit.reminders.forEach((reminder) => {
      const currentHabit = habit.habits.find((item) => item.id === reminder.habitId);
      if (!currentHabit?.isActive) return;
      eachDayOfInterval({ start: startOfMonth(visibleMonth), end: endOfMonth(visibleMonth) }).forEach((habitDay) => {
        const key = dateKey(habitDay);
        if (parseISO(key) < parseISO(currentHabit.startDate)) return;
        const log = habit.logs.find((item) => item.habitId === reminder.habitId && item.date === key);
        push(key, {
          id: `${reminder.id}-${key}`,
          module: 'habit',
          title: reminder.label,
          description: `${currentHabit.category} - ${log?.status ?? 'Ready to track'}`,
          time: reminder.time,
          tone: log?.status === 'Completed' || log?.status === 'Perfect' ? 'green' : 'gray',
          meta: `${currentHabit.targetValue} ${currentHabit.unit}`,
        });
      });
    });

    learning.sessions.forEach((session) => {
      const skill = learning.skills.find((item) => item.id === session.skillId);
      push(session.date, {
        id: session.id,
        module: 'learning',
        title: skill?.name ?? 'Learning session',
        description: `${session.sessionType} - ${session.outputType}`,
        time: session.startTime,
        tone: 'purple',
        meta: `${session.durationMinutes} min - focus ${session.focusScore}/10`,
      });
    });

    learning.monthlyPlans.forEach((plan) => {
      plan.chips.forEach((chip) => {
        push(chip.date, {
          id: chip.id,
          module: 'learning',
          title: chip.label,
          description: `${chip.type} - ${plan.month}`,
          time: chip.time,
          tone: chip.type === 'Work' ? 'blue' : chip.type === 'Trading' ? 'orange' : chip.type === 'Review' ? 'purple' : 'green',
          meta: plan.weeklyTarget,
        });
      });
    });

    finance.entries.forEach((entry) => {
      const wallet = finance.wallets.find((item) => item.id === entry.walletId);
      push(entry.date, {
        id: entry.id,
        module: 'finance',
        title: entry.category,
        description: `${entry.recordType} - ${entry.subcategory}`,
        tone: entry.recordType === 'Expense' || entry.recordType === 'Subscription' ? 'orange' : 'green',
        meta: `${formatCurrency(entry.amount)} - ${wallet?.name ?? 'Wallet'}`,
      });
    });

    finance.subscriptions.forEach((subscription) => {
      push(subscription.nextBillingDate, {
        id: subscription.id,
        module: 'finance',
        title: subscription.serviceName,
        description: `${subscription.planType} - next billing`,
        tone: 'gold',
        meta: formatCurrency(subscription.amount),
      });
    });

    journals.entries.forEach((entry) => {
      push(entry.date, {
        id: entry.id,
        module: 'journals',
        title: entry.subject,
        description: `${entry.mood} - ${entry.status}`,
        tone: entry.status === 'Completed' ? 'green' : 'purple',
        meta: `Energy ${entry.energyScore}/10`,
      });
    });

    trading.trades.forEach((trade) => {
      push(trade.date, {
        id: trade.id,
        module: 'trading',
        title: `${trade.symbol} ${trade.direction}`,
        description: `${trade.setup} - ${trade.status}`,
        time: trade.entryTime,
        tone: trade.resultR > 0 ? 'green' : trade.resultR < 0 ? 'red' : 'blue',
        meta: `${trade.resultR}R - ${trade.session}`,
      });
    });

    backtest.trades.forEach((trade) => {
      push(trade.date, {
        id: trade.id,
        module: 'backtest',
        title: `${trade.symbol} ${trade.direction}`,
        description: `${trade.setup} - ${trade.entryModel}`,
        tone: trade.resultR > 0 ? 'green' : trade.resultR < 0 ? 'red' : 'gray',
        meta: `${trade.resultR}R - trade #${trade.index}`,
      });
    });

    return map;
  }, [
    backtest.trades,
    finance.entries,
    finance.subscriptions,
    finance.wallets,
    habit.habits,
    habit.logs,
    habit.reminders,
    learning.monthlyPlans,
    learning.sessions,
    learning.skills,
    trading.trades,
    visibleMonth,
    work.members,
    work.projects,
    work.tasks,
  ]);

  const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 0 });
  const days = Array.from({ length: 35 }, (_, index) => addDays(start, index));
  const selectedItems = allItemsByDate.get(dateFilter) ?? [];
  const moduleCounts = moduleOptions.map((item) => ({
    ...item,
    count: selectedItems.filter((selectedItem) => selectedItem.module === item.value).length,
  }));

  const openModule = (targetModule: DashboardModule) => {
    if (targetModule === 'finance') lockFinance();
    setActivePage(moduleMeta[targetModule].page);
  };

  const openAddForDate = (value: string) => {
    setDateFilter(value);
    setIsAdding(true);
  };

  const handleSave = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      addToast({ title: 'Title is required', description: 'Please add a clear title before saving.', type: 'warning' });
      return;
    }

    if (module === 'work') {
      const ownerId = work.members[0]?.id ?? 'member-alex';
      const projectId = work.addProject({
        name: cleanTitle,
        ownerId,
        startDate: dateFilter,
        endDate: dateFilter,
        progress: 0,
        status: 'In Progress',
        remark: details.trim() || 'Created from Dashboard calendar.',
        color: '#3B82F6',
      });
      work.addTask({
        title: cleanTitle,
        projectId,
        tabType: 'Project',
        priority,
        status: 'Todo',
        startDate: dateFilter,
        dueDate: dateFilter,
        assigneeId: ownerId,
        progress: 0,
        remark: `${time ? `${time} - ` : ''}${details.trim() || 'Dashboard calendar task'}`,
      });
    }

    if (module === 'habit') {
      habit.addHabit({
        name: cleanTitle,
        category: 'Productivity',
        frequency: 'Daily',
        targetValue: 1,
        unit: 'time',
        startDate: dateFilter,
        reminderTime: time || '09:00',
        color: '#16A34A',
        icon: 'CheckCircle2',
        isActive: true,
      });
    }

    if (module === 'learning') {
      const skillId = learning.skills[0]?.id ?? 'skill-dashboard';
      const startTime = time || '07:30';
      learning.addSession({
        skillId,
        date: dateFilter,
        sessionType: 'Learn',
        startTime,
        endTime: addTime(startTime, 45),
        durationMinutes: 45,
        energyBefore: 6,
        energyAfter: 7,
        focusScore: 7,
        outputType: 'Note',
        remark: details.trim() || cleanTitle,
      });
    }

    if (module === 'finance') {
      const walletId = finance.wallets[0]?.id ?? 'wallet-dashboard';
      finance.addEntry({
        walletId,
        recordType: 'Expense',
        category: cleanTitle,
        subcategory: 'Dashboard Calendar',
        amount: Number(amount) || 0,
        date: dateFilter,
        isRecurring: false,
        frequency: 'None',
        remark: details.trim() || 'Created from Dashboard calendar.',
        tags: ['Dashboard'],
      });
    }

    if (module === 'journals') {
      journals.addEntry({
        date: dateFilter,
        subject: cleanTitle,
        journalType: 'Daily Journal',
        status: 'Draft',
        mood: 'Focused',
        energyScore: 6,
        tags: ['Dashboard'],
        keepDoing: details.trim() || cleanTitle,
        fixChecked: false,
        fixWhatHappened: '',
        fixReason: 'System',
        fixActionTomorrow: '',
        moneyGrowthToday: '',
        moneyGrowthSkill: 'Dashboard focus',
        moneyGrowthResult30Days: '',
        oneBigMoveChecked: true,
        oneBigMoveText: cleanTitle,
        commitmentChecked: false,
        commitmentText: '',
        gratitude1: '',
        gratitude2: '',
        gratitude3: '',
        manifestFocus: '',
        manifestAffirmation: '',
        manifestVisual: '',
      });
    }

    if (module === 'trading') {
      trading.addTrade({
        date: dateFilter,
        entryTime: time || '09:30',
        exitTime: '',
        symbol: 'EURUSD',
        direction: 'Long',
        session: 'London',
        timeframe: 'M15',
        setup: cleanTitle,
        entryPrice: 0,
        stopLoss: 0,
        takeProfit: 0,
        riskAmount: Number(amount) || 100,
        resultR: 0,
        mfeR: 0,
        maeR: 0,
        rrTarget: 2,
        confidenceScore: 60,
        commission: 0,
        status: 'Planned',
        emotion: 'Calm',
        mistakeTags: ['None'],
        ruleFollowed: true,
        exitReason: '',
        screenshotUrl: '',
        notes: details.trim() || 'Created from Dashboard calendar.',
      });
    }

    if (module === 'backtest') {
      backtest.addTrade({
        sessionId: backtest.sessions[0]?.id ?? 'dashboard-session',
        index: backtest.trades.length + 1,
        date: dateFilter,
        symbol: 'EURUSD',
        direction: 'Long',
        setup: cleanTitle,
        entryModel: 'Dashboard calendar plan',
        resultR: 0,
        mfeR: 0,
        maeR: 0,
        mistake: details.trim() || 'Ready to review',
        screenshotUrl: '',
      });
    }

    addToast({
      title: `Added to ${moduleMeta[module].label}`,
      description: `${cleanTitle} is now linked with ${formatDateLabel(dateFilter, 'MMM d, yyyy')}.`,
    });
    setTitle('');
    setAmount('');
    setDetails('');
    setIsAdding(false);
  };

  return (
    <Card hover={false} className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-card-title">
            <CalendarDays size={17} className="text-primary" />
            Calendar
          </div>
          <p className="mt-1 font-kanit text-[12px] leading-5 text-slateText">แผนรวมจากทุกหน้า เลือกวันเพื่อดูรายละเอียด</p>
        </div>
        <Button size="sm" icon={<Plus size={15} />} onClick={() => setIsAdding((value) => !value)}>
          Add
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-slateText transition hover:bg-primary-pale hover:text-primary"
            aria-label="Previous month"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-slateText transition hover:bg-primary-pale hover:text-primary"
            aria-label="Next month"
          >
            <ChevronRight size={17} />
          </button>
        </div>
        <p className="font-data text-[14px] font-bold leading-5 text-ink">{format(visibleMonth, 'MMMM yyyy')}</p>
        <Button variant="secondary" size="sm" onClick={() => setDateFilter(dateKey(appToday))}>
          Today
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center font-data text-[12px] font-medium leading-5 text-slateText">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
          <div key={day} className={cn('py-1 font-medium', (index === 0 || index === 6) && 'text-red-500')}>
            {day}
          </div>
        ))}
        {days.map((day) => {
          const key = dateKey(day);
          const active = isSameDay(day, selectedDate);
          const muted = !isSameMonth(day, visibleMonth);
          const weekend = getDay(day) === 0 || getDay(day) === 6;
          const items = allItemsByDate.get(key) ?? [];

          return (
            <button
              key={key}
              type="button"
              onClick={() => setDateFilter(key)}
              onDoubleClick={() => openAddForDate(key)}
              title="Double click to add activity"
              className={cn(
                'relative mx-auto flex h-9 w-9 items-center justify-center rounded-full font-data text-[14px] font-medium transition',
                active
                  ? 'bg-primary text-white shadow-sm hover:bg-primary hover:text-white'
                  : 'hover:bg-primary-pale hover:ring-2 hover:ring-primary-soft',
                !active && muted && (weekend ? 'text-red-300' : 'text-slate-400'),
                !active && !muted && (weekend ? 'text-red-500' : 'text-ink'),
              )}
            >
              <span className="relative z-10">{format(day, 'd')}</span>
              {items.length ? <span className={cn('absolute bottom-0.5 h-1.5 w-1.5 rounded-full', active ? 'bg-white' : 'bg-primary')} /> : null}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {moduleCounts
          .filter((item) => item.count > 0)
          .slice(0, 4)
          .map((item) => (
            <button
              key={item.value}
              className={cn('focus-ring flex items-center justify-between rounded-2xl border px-3 py-2 text-left transition hover:-translate-y-0.5 hover:shadow-sm', moduleMeta[item.value].soft)}
              onClick={() => openModule(item.value)}
            >
              <span className="flex items-center gap-2">
                {moduleMeta[item.value].icon}
                <span className="font-inter text-[12px] font-bold leading-4">{item.label}</span>
              </span>
              <span className="font-inter text-[12px] font-extrabold">{item.count}</span>
            </button>
          ))}
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-card-title">{formatDateLabel(dateFilter, 'EEE, MMM d')}</p>
            <p className="font-kanit text-[12px] leading-5 text-slateText">{summarizeCount(selectedItems.length)} สำหรับวันที่เลือก</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsAdding((value) => !value)}>
            Add
          </Button>
        </div>

        {isAdding ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 space-y-3 rounded-2xl border border-primary-soft bg-primary-pale/60 p-3">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Module" value={module} onChange={(event) => setModule(event.target.value as DashboardModule)} options={moduleOptions} />
              <Input label="Time" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </div>
            <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a plan title" />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Priority" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} options={priorityOptions} disabled={module !== 'work'} />
              <Input label="Amount / Risk" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={module === 'finance' ? 'Amount' : 'Optional'} />
            </div>
            <Textarea label="รายละเอียด" value={details} onChange={(event) => setDetails(event.target.value)} placeholder="รายละเอียด เป้าหมาย หรือ next action" className="min-h-[86px]" />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button size="sm" icon={<Plus size={15} />} onClick={handleSave}>
                Save
              </Button>
            </div>
          </motion.div>
        ) : null}

        <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
          {selectedItems.length ? (
            selectedItems
              .slice()
              .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'))
              .map((item) => (
                <motion.div key={`${item.module}-${item.id}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={cn('rounded-2xl border p-3', toneBorder[item.tone])}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-inter text-[11px] font-bold leading-4', moduleMeta[item.module].badge)}>
                        {moduleMeta[item.module].icon}
                        {moduleMeta[item.module].label}
                      </span>
                      <p className="mt-2 truncate text-body-ui text-ink">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-caption-ui">{item.description}</p>
                      <p className="mt-1 text-caption-ui">
                        {item.time ? `${item.time} - ` : ''}
                        {item.meta}
                      </p>
                    </div>
                    <button
                      className="focus-ring mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white text-slate-600 shadow-sm transition hover:text-primary"
                      onClick={() => openModule(item.module)}
                      aria-label={`Open ${moduleMeta[item.module].label}`}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-white p-3 font-kanit text-[12px] leading-5 text-slateText">
              วันนี้ยังไม่มีกิจกรรม กด Add หรือดับเบิลคลิกวันที่เพื่อเพิ่มรายการใหม่
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
