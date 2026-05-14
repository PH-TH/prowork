import { useMemo } from 'react';
import { useLearningStore } from '../stores/learningStore';

export function useLearning() {
  const state = useLearningStore();
  const activePlan = useMemo(
    () => {
      const plan = state.monthlyPlans.find((item) => item.month === state.activeMonth) ?? state.monthlyPlans[0];
      const sessionChips = state.sessions
        .filter((session) => {
          const sessionMonth = session.date.startsWith('2026-05') ? 'May 2026' : session.date.startsWith('2026-06') ? 'June 2026' : '';
          return sessionMonth === plan.month;
        })
        .map((session) => {
          const skill = state.skills.find((item) => item.id === session.skillId);
          return {
            id: `session-${session.id}`,
            date: session.date,
            label: skill?.name ?? session.sessionType,
            time: session.startTime,
            type: session.sessionType === 'Review' ? 'Review' as const : 'Learning' as const,
          };
        });

      return { ...plan, chips: [...sessionChips, ...plan.chips] };
    },
    [state.activeMonth, state.monthlyPlans, state.sessions, state.skills],
  );
  const todayMinutes = useMemo(
    () => state.sessions.filter((session) => session.date === '2026-05-04').reduce((sum, session) => sum + session.durationMinutes, 0),
    [state.sessions],
  );
  return { ...state, activePlan, todayHours: Math.round((todayMinutes / 60) * 10) / 10 };
}
