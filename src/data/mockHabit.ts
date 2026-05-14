import type { Habit, HabitLog, HabitReminder } from '../types/habit';

export const habits: Habit[] = [
  {
    id: 'h-exercise',
    name: 'Morning Exercise',
    category: 'Health',
    frequency: 'Daily',
    targetValue: 30,
    unit: 'minutes',
    startDate: '2026-04-01',
    reminderTime: '08:00',
    color: '#16A34A',
    icon: 'Activity',
    isActive: true,
  },
  {
    id: 'h-meditation',
    name: 'Meditation',
    category: 'Mind',
    frequency: 'Daily',
    targetValue: 10,
    unit: 'minutes',
    startDate: '2026-04-01',
    reminderTime: '09:00',
    color: '#8B5CF6',
    icon: 'Brain',
    isActive: true,
  },
  {
    id: 'h-read',
    name: 'Read Book',
    category: 'Learning',
    frequency: 'Daily',
    targetValue: 20,
    unit: 'pages',
    startDate: '2026-04-03',
    reminderTime: '15:00',
    color: '#3B82F6',
    icon: 'BookOpen',
    isActive: true,
  },
  {
    id: 'h-water',
    name: 'Drink Water',
    category: 'Health',
    frequency: 'Daily',
    targetValue: 2500,
    unit: 'ml',
    startDate: '2026-04-01',
    reminderTime: '12:30',
    color: '#06B6D4',
    icon: 'Droplets',
    isActive: true,
  },
  {
    id: 'h-sugar',
    name: 'No Sugar',
    category: 'Lifestyle',
    frequency: 'Weekdays',
    targetValue: 1,
    unit: 'day',
    startDate: '2026-04-05',
    reminderTime: '17:30',
    color: '#F59E0B',
    icon: 'Cookie',
    isActive: true,
  },
  {
    id: 'h-sleep',
    name: 'Sleep 7+ Hours',
    category: 'Health',
    frequency: 'Daily',
    targetValue: 7,
    unit: 'hours',
    startDate: '2026-04-01',
    reminderTime: '22:30',
    color: '#0EA5E9',
    icon: 'Moon',
    isActive: true,
  },
];

const statuses = ['Perfect', 'Completed', 'Completed', 'Partial', 'Missed', 'Completed', 'Perfect'] as const;

export const habitLogs: HabitLog[] = habits.flatMap((habit, habitIndex) =>
  Array.from({ length: 31 }, (_, index) => {
    const day = index + 1;
    const status = day > 21 ? 'No Data' : statuses[(day + habitIndex) % statuses.length];
    const value =
      status === 'Perfect'
        ? habit.targetValue
        : status === 'Completed'
          ? Math.round(habit.targetValue * 0.95)
          : status === 'Partial'
            ? Math.round(habit.targetValue * 0.55)
            : 0;

    return {
      id: `${habit.id}-${day}`,
      habitId: habit.id,
      date: `2026-05-${String(day).padStart(2, '0')}`,
      status,
      value,
      remark: status === 'Missed' ? 'Energy was low, move this earlier tomorrow.' : 'Logged from daily review.',
    };
  }),
);

export const habitReminders: HabitReminder[] = habits.map((habit) => ({
  id: `r-${habit.id}`,
  habitId: habit.id,
  time: habit.reminderTime,
  label: habit.name,
}));

export const habitTrend = [
  { day: 'Mon', completion: 72, total: 17 },
  { day: 'Tue', completion: 76, total: 18 },
  { day: 'Wed', completion: 74, total: 17 },
  { day: 'Thu', completion: 82, total: 21 },
  { day: 'Fri', completion: 78, total: 19 },
  { day: 'Sat', completion: 84, total: 22 },
  { day: 'Sun', completion: 88, total: 23 },
];
