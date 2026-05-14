import { addDays, eachDayOfInterval, endOfMonth, format, isSameDay, parseISO, startOfMonth } from 'date-fns';

export const appToday = new Date('2026-05-04T09:00:00');

export function formatDateLabel(date: string | Date, pattern = 'MMM d, yyyy') {
  return format(typeof date === 'string' ? parseISO(date) : date, pattern);
}

export function monthDays(monthDate: Date) {
  return eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) });
}

export function dateKey(date: string | Date) {
  return format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd');
}

export function isTodayKey(value: string) {
  return isSameDay(parseISO(value), appToday);
}

export function daysLeftInYear(from = appToday) {
  const end = new Date(from.getFullYear(), 11, 31);
  return Math.max(0, Math.ceil((end.getTime() - from.getTime()) / 86400000));
}

export function nextDays(count: number, from = appToday) {
  return Array.from({ length: count }, (_, index) => addDays(from, index));
}
