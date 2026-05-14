import { habitLogs, habitReminders, habitTrend, habits } from '../data/mockHabit';

export const habitService = {
  getHabits: () => habits,
  getLogs: () => habitLogs,
  getReminders: () => habitReminders,
  getTrend: () => habitTrend,
};
