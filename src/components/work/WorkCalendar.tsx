import { addDays, addMonths, format, getDay, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useWorkStore } from '../../stores/workStore';
import { Badge } from '../ui/Badge';
import { appToday, dateKey } from '../../lib/date';

interface WorkCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAddTask: (date: string) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function WorkCalendar({ selectedDate, onSelectDate, onAddTask, onEditTask, onDeleteTask }: WorkCalendarProps) {
  const selected = parseISO(selectedDate);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(selected));
  const tasks = useWorkStore((state) => state.tasks);

  const activityDays = useMemo(() => {
    const dates = new Set<string>();
    tasks.forEach((task) => {
      dates.add(task.startDate);
      dates.add(task.dueDate);
    });
    return dates;
  }, [tasks]);

  useEffect(() => {
    setVisibleMonth(startOfMonth(selected));
  }, [selectedDate]);

  const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 0 });
  const days = Array.from({ length: 35 }, (_, index) => addDays(start, index));
  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.startDate === selectedDate || task.dueDate === selectedDate),
    [selectedDate, tasks],
  );

  return (
    <Card hover={false} className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-slateText transition hover:bg-primary-pale hover:text-primary"
            aria-label="Previous month"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-slateText transition hover:bg-primary-pale hover:text-primary"
            aria-label="Next month"
          >
            <ChevronRight size={17} />
          </button>
        </div>
        <p className="font-data text-[14px] font-bold leading-5 text-ink">{format(visibleMonth, 'MMMM yyyy')}</p>
        <Button variant="secondary" size="sm" onClick={() => onSelectDate(dateKey(appToday))}>Today</Button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center font-data text-[12px] font-medium leading-5 text-slateText">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
          <div key={day} className={`py-1 font-medium ${index === 0 || index === 6 ? 'text-red-500' : ''}`}>{day}</div>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const active = isSameDay(day, selected);
          const muted = !isSameMonth(day, visibleMonth);
          const weekend = getDay(day) === 0 || getDay(day) === 6;
          const hasActivity = activityDays.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              onDoubleClick={() => onAddTask(key)}
              title="ดับเบิลคลิกเพื่อเพิ่มงาน"
              className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full font-data text-[14px] font-medium transition ${
                active
                  ? 'bg-primary text-white shadow-sm hover:bg-primary hover:text-white'
                  : `hover:bg-primary-pale hover:ring-2 hover:ring-primary-soft ${muted ? (weekend ? 'text-red-300' : 'text-slate-400') : weekend ? 'text-red-500' : 'text-ink'}`
              }`}
            >
              <span className="relative z-10">{format(day, 'd')}</span>
              {hasActivity ? (
                <span className={`absolute bottom-0.5 h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : 'bg-primary'}`} />
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="mt-5 border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-card-title">Selected Day Activity</p>
          <Button variant="secondary" size="sm" onClick={() => onAddTask(selectedDate)}>Add</Button>
        </div>
        <div className="space-y-3">
          {selectedTasks.length ? selectedTasks.map((task) => (
            <div key={task.id} className="rounded-2xl border border-border bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-body-ui text-ink">{task.title}</p>
                  <p className="mt-1 text-caption-ui">{task.startDate === selectedDate ? 'วันเริ่มต้น' : 'วันครบกำหนด'} • ความคืบหน้า {task.progress}%</p>
                </div>
                <Badge tone={task.status === 'Done' ? 'green' : task.status === 'Overdue' || task.status === 'Blocked' ? 'red' : 'blue'}>{task.status}</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => onEditTask(task.id)}>Edit</Button>
                <Button variant="outline" size="sm" onClick={() => onDeleteTask(task.id)}>Delete</Button>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-border bg-white p-3 font-kanit text-[12px] leading-5 text-slateText">
              วันนี้ยังไม่มีกิจกรรม กด Add หรือดับเบิลคลิกวันที่เพื่อเพิ่มงานใหม่
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
