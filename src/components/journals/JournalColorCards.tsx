import { useJournal } from '../../hooks/useJournal';
import { Card } from '../ui/Card';

export function JournalColorCards() {
  const { luckyColors } = useJournal();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {luckyColors.map((set) => (
        <Card key={set.day} className={set.day === 'today' ? 'border-primary-soft' : 'border-yellow-100'}>
          <p className="text-section-title">{set.day === 'today' ? 'Lucky Colors Today' : 'Lucky Colors Tomorrow'}</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {set.colors.map((color) => (
              <div key={color.name} className="rounded-2xl border border-border bg-white p-3">
                <div className="h-16 rounded-xl border border-border" style={{ backgroundColor: color.hex }} />
                <p className="mt-2 text-center text-body-ui text-ink">{color.name}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
