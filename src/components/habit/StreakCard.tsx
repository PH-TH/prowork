import { Flame } from 'lucide-react';
import { useHabit } from '../../hooks/useHabit';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export function StreakCard() {
  const { streak } = useHabit();

  return (
    <Card hover={false}>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-orange-50 p-3 text-orange-600"><Flame size={22} /></div>
        <div>
          <p className="text-section-title">Streak Power</p>
          <p className="text-page-subtitle">23 days toward a 30-day review streak.</p>
        </div>
      </div>
      <p className="mt-6 text-kpi text-ink">{streak}</p>
      <ProgressBar value={(streak / 30) * 100} color="#F59E0B" className="mt-4" showLabel />
    </Card>
  );
}
