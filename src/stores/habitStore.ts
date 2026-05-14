import { create } from 'zustand';
import { habitService } from '../services/habitService';
import type { Habit, HabitLog, HabitReminder } from '../types/habit';
import { uid } from '../lib/utils';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  reminders: HabitReminder[];
  trend: Array<{ day: string; completion: number; total: number }>;
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  updateLogStatus: (habitId: string, date: string, status: HabitLog['status']) => void;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: habitService.getHabits(),
  logs: habitService.getLogs(),
  reminders: habitService.getReminders(),
  trend: habitService.getTrend(),
  addHabit: (habit) =>
    set((state) => {
      const id = uid('habit');
      const nextHabit = { id, ...habit };
      const todayLog: HabitLog = {
        id: uid('habit-log'),
        habitId: id,
        date: habit.startDate,
        status: 'No Data',
        value: 0,
        remark: 'Created from Add Habit. Start tracking today.',
      };
      const reminder: HabitReminder = {
        id: uid('habit-reminder'),
        habitId: id,
        time: habit.reminderTime,
        label: habit.name,
      };

      return {
        habits: [nextHabit, ...state.habits],
        logs: [todayLog, ...state.logs],
        reminders: [reminder, ...state.reminders].sort((a, b) => a.time.localeCompare(b.time)),
      };
    }),
  updateLogStatus: (habitId, date, status) =>
    set((state) => ({
      logs: state.logs.map((log) => (log.habitId === habitId && log.date === date ? { ...log, status } : log)),
    })),
}));
