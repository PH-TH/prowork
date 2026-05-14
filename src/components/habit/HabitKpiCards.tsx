import { Activity, Flame, Gauge } from 'lucide-react';
import { KpiCard } from '../ui/Card';
import { useHabit } from '../../hooks/useHabit';

export function HabitKpiCards() {
  const { reviewScore, streak, completionRate } = useHabit();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <KpiCard label="Review Habit Score" value={reviewScore} suffix="/100" helper="Weekly behavior quality" tone="green" icon={<Gauge size={20} />} />
      <KpiCard label="Current Streak" value={streak} suffix=" days" helper="Keep the chain alive" tone="orange" icon={<Flame size={20} />} />
      <KpiCard label="Completion Rate" value={completionRate} suffix="%" helper="May active logs" tone="blue" icon={<Activity size={20} />} />
    </div>
  );
}
