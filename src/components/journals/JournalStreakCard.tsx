import { Flame } from 'lucide-react';
import { useJournal } from '../../hooks/useJournal';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export function JournalStreakCard() {
  const { streak } = useJournal();

  return (
    <Card hover={false}>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary-pale p-3 text-primary"><Flame size={20} /></div>
        <div>
          <p className="text-section-title">Journal Streak</p>
          <p className="text-page-subtitle">Reflection consistency</p>
        </div>
      </div>
      <p className="mt-5 text-kpi text-ink">{streak} days</p>
      <ProgressBar value={(streak / 21) * 100} className="mt-4" showLabel />
    </Card>
  );
}
