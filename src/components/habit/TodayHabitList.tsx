import { useHabit } from '../../hooks/useHabit';
import { Card } from '../ui/Card';
import { Checkbox } from '../ui/Checkbox';
import { Badge } from '../ui/Badge';

interface TodayHabitListProps {
  categoryFilter?: string;
}

export function TodayHabitList({ categoryFilter = 'All Habits' }: TodayHabitListProps) {
  const { habits, logs, updateLogStatus } = useHabit();
  const visibleHabits = categoryFilter === 'All Habits' ? habits : habits.filter((habit) => habit.category === categoryFilter);

  return (
    <Card hover={false}>
      <p className="text-section-title">Today Habit Checklist</p>
      <div className="mt-4 space-y-3">
        {visibleHabits.map((habit) => {
          const log = logs.find((item) => item.habitId === habit.id && item.date === '2026-05-04');
          const checked = log?.status === 'Completed' || log?.status === 'Perfect';
          return (
            <div key={habit.id} className="rounded-2xl border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <Checkbox checked={checked} onChange={(value) => updateLogStatus(habit.id, '2026-05-04', value ? 'Completed' : 'Missed')} label={habit.name} />
                <Badge tone={checked ? 'green' : 'gray'}>{log?.status ?? 'No Data'}</Badge>
              </div>
              <p className="mt-2 text-caption-ui">{log?.value ?? 0} / {habit.targetValue} {habit.unit}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
