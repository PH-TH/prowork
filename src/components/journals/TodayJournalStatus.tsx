import { useMemo } from 'react';
import { useJournal } from '../../hooks/useJournal';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function TodayJournalStatus() {
  const { todayEntry } = useJournal();
  const status = useMemo(() => {
    const completed = todayEntry
      ? [
          todayEntry.keepDoing ? 'Keep Doing' : '',
          todayEntry.fixChecked ? 'Fix' : '',
          todayEntry.moneyGrowthToday ? 'Money Thinking' : '',
          todayEntry.gratitude1 ? 'Gratitude' : '',
          todayEntry.manifestFocus ? 'Manifest' : '',
        ].filter(Boolean)
      : [];
    const all = ['Keep Doing', 'Fix', 'Money Thinking', 'Gratitude', 'Manifest'];
    return {
      completed,
      missing: all.filter((item) => !completed.includes(item)),
    };
  }, [todayEntry]);

  return (
    <Card hover={false}>
      <p className="text-section-title">Today Journal Status</p>
      <div className="mt-4">
        <p className="text-card-title">Completed</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {status.completed.length ? status.completed.map((item) => <Badge key={item} tone="green">{item}</Badge>) : <Badge tone="gray">No entry</Badge>}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-card-title">Missing</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {status.missing.map((item) => <Badge key={item} tone="gray">{item}</Badge>)}
        </div>
      </div>
    </Card>
  );
}
