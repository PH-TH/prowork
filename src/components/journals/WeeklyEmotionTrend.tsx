import { LineChart } from '../../charts/LineChart';
import { useJournal } from '../../hooks/useJournal';
import { Card } from '../ui/Card';

export function WeeklyEmotionTrend() {
  const { weeklyEmotionTrend } = useJournal();

  return (
    <Card hover={false} className="lg:col-span-2">
      <p className="text-section-title">Weekly Emotion Trend</p>
      <LineChart
        data={weeklyEmotionTrend}
        height={260}
        lines={[
          { key: 'Calm', color: '#3B82F6' },
          { key: 'Focused', color: '#16A34A' },
          { key: 'Grateful', color: '#F59E0B' },
          { key: 'Stressed', color: '#EF4444' },
        ]}
      />
    </Card>
  );
}
