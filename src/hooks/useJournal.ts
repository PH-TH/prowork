import { useMemo } from 'react';
import { useJournalStore } from '../stores/journalStore';

export function useJournal() {
  const state = useJournalStore();
  const todayEntry = useMemo(() => state.entries.find((entry) => entry.date === '2026-05-04'), [state.entries]);
  const completedToday = todayEntry?.status === 'Completed';
  const streak = useMemo(() => {
    const completedDates = new Set(state.entries.filter((entry) => entry.status === 'Completed').map((entry) => entry.date));
    let count = 0;
    for (let day = 4; day >= 1; day -= 1) {
      if (completedDates.has(`2026-05-${String(day).padStart(2, '0')}`)) count += 1;
      else break;
    }
    return Math.max(1, count || 0);
  }, [state.entries]);

  return { ...state, todayEntry, completedToday, streak };
}
