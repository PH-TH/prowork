import { addDays, format, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import type { Mood } from '../../types/journal';
import { useJournal } from '../../hooks/useJournal';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Tooltip } from '../ui/Tooltip';

const weekdays = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
const pills = ['Keep Doing', 'Fix', 'Money Thinking'];

const moodStyles: Record<Mood, { dot: string; cell: string; pill: string; label: string }> = {
  Calm: {
    dot: 'bg-blue-500',
    cell: 'border-blue-200 bg-blue-50/90 dark:border-blue-900/70 dark:bg-blue-950/35',
    pill: 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
    label: 'สงบ',
  },
  Focused: {
    dot: 'bg-emerald-500',
    cell: 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/70 dark:bg-emerald-950/35',
    pill: 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    label: 'โฟกัส',
  },
  Grateful: {
    dot: 'bg-amber-500',
    cell: 'border-amber-200 bg-amber-50/90 dark:border-amber-900/70 dark:bg-amber-950/35',
    pill: 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
    label: 'ขอบคุณ',
  },
  Stressed: {
    dot: 'bg-red-500',
    cell: 'border-red-300 bg-red-50/95 dark:border-red-900/80 dark:bg-red-950/45',
    pill: 'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
    label: 'เครียด',
  },
  Tired: {
    dot: 'bg-rose-500',
    cell: 'border-rose-300 bg-rose-50/95 dark:border-rose-900/80 dark:bg-rose-950/45',
    pill: 'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200',
    label: 'เหนื่อย',
  },
  Hopeful: {
    dot: 'bg-violet-500',
    cell: 'border-violet-200 bg-violet-50/90 dark:border-violet-900/70 dark:bg-violet-950/35',
    pill: 'border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200',
    label: 'มีหวัง',
  },
};

interface JournalCalendarProps {
  typeFilter?: string;
  monthFilter: string;
  onDateDoubleClick: (date: string) => void;
}

export function JournalCalendar({ typeFilter = 'All Types', monthFilter, onDateDoubleClick }: JournalCalendarProps) {
  const { entries } = useJournal();
  const monthStart = startOfMonth(new Date(`${monthFilter}-01T00:00:00`));
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));

  return (
    <Card hover={false}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-inter text-[30px] font-extrabold leading-9 text-ink">Journal Calendar</p>
          <p className="text-page-subtitle">ดับเบิลคลิกที่วันที่เพื่อเปิดฟอร์ม Journal พร้อมกรอกวันที่ให้อัตโนมัติ</p>
        </div>
        <div className="rounded-full border border-border bg-slate-50 px-4 py-2 text-chip-ui text-slateText dark:bg-slate-900">
          {format(monthStart, 'MMMM yyyy')}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[840px] grid-cols-7 gap-2">
          {weekdays.map((day) => (
            <div key={day} className="rounded-2xl border border-border bg-slate-100 px-3 py-2 text-center font-kanit text-[16px] font-semibold leading-6 text-ink dark:bg-slate-900">
              {day}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const entry = entries.find((item) => item.date === key && (typeFilter === 'All Types' || item.journalType === typeFilter));
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = key === '2026-05-04';
            const style = entry ? moodStyles[entry.mood] : undefined;
            return (
              <button
                key={key}
                type="button"
                onDoubleClick={() => onDateDoubleClick(key)}
                className={cn(
                  'min-h-[154px] rounded-2xl border p-3 text-left transition duration-180 hover:-translate-y-0.5 hover:ring-2 hover:ring-primary-soft focus-ring',
                  entry ? style?.cell : 'border-border bg-white dark:bg-slate-900',
                  !isCurrentMonth && 'opacity-45',
                  isToday && 'ring-2 ring-primary-soft',
                )}
                title={`Double click to write journal for ${key}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="block font-inter text-[26px] font-extrabold leading-8 text-ink">{format(day, 'd')}</span>
                  <Tooltip content={entry ? `${entry.mood} - ${entry.status}` : 'ยังไม่มี Journal'}>
                    <span className={cn('mt-1 h-3.5 w-3.5 rounded-full shadow-sm', entry ? style?.dot : 'bg-slate-300')} />
                  </Tooltip>
                </div>
                <div className="mt-3 space-y-1.5">
                  {entry ? (
                    <>
                      <p className="line-clamp-2 min-h-9 font-kanit text-[13px] font-semibold leading-[18px] text-ink">{entry.subject}</p>
                      <span className={cn('inline-flex rounded-full border px-2.5 py-1 font-kanit text-[12px] font-semibold leading-4', style?.pill)}>
                        {style?.label} · {entry.mood}
                      </span>
                      {pills.map((pill) => (
                        <span key={pill} className={cn('block truncate rounded-full border px-2 py-0.5 font-inter text-[10px] font-semibold leading-4', style?.pill)}>
                          {pill}
                        </span>
                      ))}
                    </>
                  ) : (
                    <span className="block rounded-full border border-border bg-slate-50 px-2 py-1 font-kanit text-[12px] font-medium leading-4 text-slateText dark:bg-slate-950">
                      ยังไม่ได้บันทึก
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
