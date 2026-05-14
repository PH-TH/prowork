import { useJournal } from '../../hooks/useJournal';
import { Card } from '../ui/Card';

export function MoodLegend() {
  const { moodColors } = useJournal();

  return (
    <Card hover={false}>
      <p className="text-section-title">Mood Legend</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {Object.entries(moodColors).map(([mood, color]) => (
          <div key={mood} className="flex items-center gap-2 text-body-ui text-slateText">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            {mood}
          </div>
        ))}
      </div>
    </Card>
  );
}
