import { useMemo } from 'react';
import { useWorkStore } from '../stores/workStore';
import { taskStatusDistribution, workStats } from '../lib/calculations';

export function useWork() {
  const state = useWorkStore();
  const stats = useMemo(() => workStats(state.tasks), [state.tasks]);
  const statusDistribution = useMemo(() => taskStatusDistribution(state.tasks), [state.tasks]);
  return { ...state, stats, statusDistribution };
}
