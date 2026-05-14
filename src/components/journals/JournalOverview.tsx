import { useJournal } from '../../hooks/useJournal';
import { Card } from '../ui/Card';

export function JournalOverview() {
  const { todayEntry } = useJournal();

  return (
    <Card hover={false}>
      <p className="text-section-title">Today Journal Overview</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Block title="Keep Doing" text={todayEntry?.keepDoing} />
        <Block title="Fix Honestly" text={todayEntry?.fixActionTomorrow} />
        <Block title="One Big Move" text={todayEntry?.oneBigMoveText} />
      </div>
    </Card>
  );
}

function Block({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-slate-50 p-4">
      <p className="text-card-title">{title}</p>
      <p className="mt-2 text-body-ui text-slateText">{text || 'No entry yet.'}</p>
    </div>
  );
}
