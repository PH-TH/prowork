import { LineChart } from '../../charts/LineChart';
import { BarChart } from '../../charts/BarChart';
import { useHabit } from '../../hooks/useHabit';
import { Card } from '../ui/Card';

export function HabitTrendChart() {
  const { trend } = useHabit();

  return (
    <Card hover={false} className="md:col-span-2">
      <div className="mb-4">
        <p className="text-section-title">Habit Trends</p>
        <p className="text-page-subtitle">Completion rate with total completions.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChart data={trend} lines={[{ key: 'completion', color: '#16A34A', name: 'Completion rate' }]} height={220} />
        <BarChart data={trend} xKey="day" barKey="total" color="#3B82F6" height={220} />
      </div>
    </Card>
  );
}
