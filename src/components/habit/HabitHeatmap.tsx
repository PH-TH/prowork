import { HeatmapGrid } from '../../charts/HeatmapGrid';
import { useHabit } from '../../hooks/useHabit';
import { Card } from '../ui/Card';

interface HabitHeatmapProps {
  categoryFilter?: string;
}

export function HabitHeatmap({ categoryFilter = 'All Habits' }: HabitHeatmapProps) {
  const { habits, logs } = useHabit();
  const visibleHabits = categoryFilter === 'All Habits' ? habits : habits.filter((habit) => habit.category === categoryFilter);

  return (
    <Card hover={false}>
      <div className="mb-5">
        <p className="text-section-title">Habit Heatmap</p>
        <p className="text-page-subtitle">Month view by habit, intensity, value, and remark.</p>
      </div>
      <HeatmapGrid habits={visibleHabits} logs={logs} />
      <div className="mt-4 flex flex-wrap gap-3 text-caption-ui">
        {[
          ['No Data', '#FFFFFF'],
          ['Missed', '#F1F5F9'],
          ['Partial', '#BBF7D0'],
          ['Completed', '#4ADE80'],
          ['Perfect', '#16A34A'],
        ].map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <i className="h-3 w-3 rounded border border-border" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </Card>
  );
}
