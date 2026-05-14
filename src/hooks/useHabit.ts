import { useMemo } from 'react';
import { useHabitStore } from '../stores/habitStore';
import { habitCompletionRate } from '../lib/calculations';

export function useHabit() {
  const state = useHabitStore();
  const completionRate = useMemo(() => habitCompletionRate(state.logs), [state.logs]);
  const streak = useMemo(() => {
    let count = 0;
    for (let day = 4; day >= 1; day -= 1) {
      const key = `2026-05-${String(day).padStart(2, '0')}`;
      const dayLogs = state.logs.filter((log) => log.date === key);
      const completed = dayLogs.length > 0 && dayLogs.some((log) => log.status === 'Completed' || log.status === 'Perfect');
      if (completed) count += 1;
      else break;
    }
    return Math.max(count, 1);
  }, [state.logs]);
  const reviewScore = Math.min(100, Math.round((completionRate * 0.75) + (streak * 2)));
  return { ...state, completionRate, streak, reviewScore };
}
