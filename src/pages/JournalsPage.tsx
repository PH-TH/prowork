import { Filter, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AddJournalModal } from '../components/journals/AddJournalModal';
import { JournalCalendar } from '../components/journals/JournalCalendar';
import { JournalCategories } from '../components/journals/JournalCategories';
import { JournalColorCards } from '../components/journals/JournalColorCards';
import { JournalOverview } from '../components/journals/JournalOverview';
import { JournalStreakCard } from '../components/journals/JournalStreakCard';
import { ManifestFocusCard } from '../components/journals/ManifestFocusCard';
import { MoodLegend } from '../components/journals/MoodLegend';
import { TodayJournalStatus } from '../components/journals/TodayJournalStatus';
import { WeeklyEmotionTrend } from '../components/journals/WeeklyEmotionTrend';
import { PageHeader } from '../components/layout/PageHeader';
import { RightPanel } from '../components/layout/RightPanel';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { useJournal } from '../hooks/useJournal';
import { journalTypes } from '../forms/journalFormSchema';
import { cn } from '../lib/utils';
import type { Mood } from '../types/journal';

const moodCardStyles: Record<Mood, string> = {
  Calm: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/35 dark:text-blue-100',
  Focused: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/35 dark:text-emerald-100',
  Grateful: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-100',
  Stressed: 'border-red-300 bg-red-50 text-red-900 dark:border-red-900/80 dark:bg-red-950/45 dark:text-red-100',
  Tired: 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900/80 dark:bg-rose-950/45 dark:text-rose-100',
  Hopeful: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/70 dark:bg-violet-950/35 dark:text-violet-100',
};

const monthLabel = (value: string) => {
  const date = new Date(`${value}-01T00:00:00`);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
};

export function JournalsPage() {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-05-04');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const { entries } = useJournal();
  const monthOptions = useMemo(() => {
    const months = new Set(entries.map((entry) => entry.date.slice(0, 7)));
    months.add('2026-05');
    months.add('2026-06');
    return Array.from(months).sort().map((month) => ({ value: month, label: monthLabel(month) }));
  }, [entries]);
  const [monthFilter, setMonthFilter] = useState('2026-05');
  const visibleEntries = useMemo(
    () => entries
      .filter((entry) => entry.date.startsWith(monthFilter))
      .filter((entry) => typeFilter === 'All Types' || entry.journalType === typeFilter)
      .slice(0, 6),
    [entries, monthFilter, typeFilter],
  );
  const openJournalForDate = (date: string) => {
    setSelectedDate(date);
    setOpen(true);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Journals & Self Growth"
        subtitle="Journals - emotional growth, accountability, gratitude, and manifestation."
        actions={
          <>
            <Select
              aria-label="Journal filter"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              options={['All Types', ...journalTypes]}
              className="w-[180px]"
            />
            <Select
              aria-label="Journal month filter"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              options={monthOptions}
              className="w-[180px]"
            />
            <Button variant="secondary" icon={<Filter size={16} />} onClick={() => {
              setTypeFilter('All Types');
              setMonthFilter('2026-05');
            }}>Reset</Button>
            <Button icon={<Plus size={16} />} onClick={() => openJournalForDate(selectedDate)}>Add Journal</Button>
          </>
        }
      />
      <JournalColorCards />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <JournalCalendar typeFilter={typeFilter} monthFilter={monthFilter} onDateDoubleClick={openJournalForDate} />
        <RightPanel>
          <TodayJournalStatus />
          <MoodLegend />
          <JournalStreakCard />
          <ManifestFocusCard />
        </RightPanel>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <JournalOverview />
        <WeeklyEmotionTrend />
        <JournalCategories />
      </div>
      <Card hover={false}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-section-title">Recent Journal Entries</p>
            <p className="text-page-subtitle">Entries saved from the modal appear here and feed the calendar.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => openJournalForDate(selectedDate)} icon={<Plus size={15} />}>Write</Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {visibleEntries.map((entry) => (
            <div key={entry.id} className={cn('rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-card', moodCardStyles[entry.mood])}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-card-title">{entry.subject}</p>
                  <p className="mt-1 text-caption-ui">{entry.date} - {entry.mood} - energy {entry.energyScore}/10</p>
                </div>
                <span className="rounded-full border border-primary-soft bg-primary-pale px-2.5 py-1 font-inter text-[12px] font-semibold text-primary">{entry.status}</span>
              </div>
              <p className="mt-3 line-clamp-2 text-body-ui">{entry.oneBigMoveText || entry.keepDoing || entry.manifestFocus}</p>
            </div>
          ))}
          {!visibleEntries.length ? (
            <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-5 text-body-ui text-slateText dark:bg-slate-900">
              ยังไม่มี Journal ในเดือนนี้ ดับเบิลคลิกวันที่ในปฏิทินเพื่อเพิ่มรายการใหม่ได้เลย
            </div>
          ) : null}
        </div>
      </Card>
      <AddJournalModal open={open} onClose={() => setOpen(false)} initialDate={selectedDate} />
    </div>
  );
}
