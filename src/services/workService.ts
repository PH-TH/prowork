import { todaySchedule, workMembers, workProjects, workReminderQuotes, workTabs, workTasks } from '../data/mockWork';

export const workService = {
  getMembers: () => workMembers,
  getProjects: () => workProjects,
  getTasks: () => workTasks,
  getSchedule: () => todaySchedule,
  getTabs: () => workTabs,
  getReminderQuote: () => workReminderQuotes[new Date('2026-05-04').getDate() % workReminderQuotes.length],
};
