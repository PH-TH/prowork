import { format, parseISO } from 'date-fns';
import { ChevronDown, Expand, Filter, Minus, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useWorkStore } from '../../stores/workStore';

interface ProjectTimelineProps {
  selectedDate: string;
  onEditTask: (taskId: string) => void;
}

interface TimelineBar {
  taskId?: string;
  projectId?: string;
  label: string;
  project: string;
  task: string;
  owner: string;
  status: 'Completed' | 'In Progress' | 'At Risk' | 'Overdue';
  startDate: string;
  endDate: string;
  progress: number;
  color: string;
}

const timelineBars: TimelineBar[] = [
  {
    label: 'Apr 28 - May 17',
    project: 'Alpha Build',
    task: 'Estimator closeout and final checklist',
    owner: 'Alex Kim',
    status: 'Completed',
    startDate: '2026-04-28',
    endDate: '2026-05-17',
    progress: 100,
    color: '#BFE8C7',
  },
  {
    label: 'May 3 - May 24',
    project: 'Beta Install',
    task: 'BOM data review and install readiness',
    owner: 'Jane Smith',
    status: 'In Progress',
    startDate: '2026-05-03',
    endDate: '2026-05-24',
    progress: 65,
    color: '#BFE8C7',
  },
  {
    label: 'May 10 - Jun 7',
    project: 'Gamma System',
    task: 'PLM mapping and system validation',
    owner: 'Michael Lee',
    status: 'In Progress',
    startDate: '2026-05-10',
    endDate: '2026-06-07',
    progress: 60,
    color: '#AFC6FF',
  },
  {
    label: 'May 20 - Jun 21',
    project: 'Delta Test',
    task: 'Testing plan and environment setup',
    owner: 'Emily Park',
    status: 'At Risk',
    startDate: '2026-05-20',
    endDate: '2026-06-21',
    progress: 45,
    color: '#FDBA5B',
  },
  {
    label: 'Jun 10 - Jun 30',
    project: 'Epsilon Launch',
    task: 'Launch readiness and vendor escalation',
    owner: 'Alex Kim',
    status: 'Overdue',
    startDate: '2026-06-10',
    endDate: '2026-06-30',
    progress: 16,
    color: '#F47E83',
  },
];

const timelineTicks = [
  { label: '28 Apr', date: '2026-04-28' },
  { label: '5 May', date: '2026-05-05' },
  { label: '12 May', date: '2026-05-12' },
  { label: '19 May', date: '2026-05-19' },
  { label: '26 May', date: '2026-05-26' },
  { label: '2 Jun', date: '2026-06-02' },
  { label: '9 Jun', date: '2026-06-09' },
  { label: '16 Jun', date: '2026-06-16' },
  { label: '23 Jun', date: '2026-06-23' },
  { label: '30 Jun', date: '2026-06-30' },
];
const filters = ['All Timeline', 'Today', 'This Week', 'This Month', 'Completed', 'In Progress', 'At Risk', 'Overdue'];

export function ProjectTimeline({ selectedDate, onEditTask }: ProjectTimelineProps) {
  const [filter, setFilter] = useState('All Timeline');
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(100);
  const { projects, tasks, members } = useWorkStore();

  const storeBars = useMemo<TimelineBar[]>(() => {
    return projects.map((project) => {
      const task = tasks.find((item) => item.projectId === project.id);
      const owner = members.find((member) => member.id === project.ownerId);

      return {
        taskId: task?.id,
        projectId: project.id,
        label: `${format(parseISO(project.startDate), 'MMM d')} - ${format(parseISO(project.endDate), 'MMM d')}`,
        project: project.name,
        task: task?.title ?? project.remark,
        owner: owner?.name ?? 'Alex Kim',
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        progress: project.progress,
        color: project.color,
      };
    });
  }, [members, projects, tasks]);

  const filteredBars = useMemo(() => {
    const sourceBars = storeBars.length ? storeBars : timelineBars;
    if (['All Timeline', 'Today', 'This Week', 'This Month'].includes(filter)) return sourceBars;
    return sourceBars.filter((bar) => bar.status === filter);
  }, [filter, storeBars]);

  useEffect(() => {
    if (!expanded) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [expanded]);

  const zoomOut = () => setZoom((current) => Math.max(80, current - 15));
  const zoomIn = () => setZoom((current) => Math.min(175, current + 15));

  return (
    <>
      <Card className="h-[344px] overflow-hidden p-0" hover={false}>
        <TimelineHeader
          filter={filter}
          setFilter={setFilter}
          zoom={zoom}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          onExpand={() => setExpanded(true)}
        />
        <TimelineCanvas selectedDate={selectedDate} bars={filteredBars} heightClass="h-[286px]" zoom={zoom} onEditTask={onEditTask} />
      </Card>
      <Modal
        open={expanded}
        onClose={() => setExpanded(false)}
        title="Timeline"
          subtitle="ดูไทม์ไลน์โปรเจกต์แบบเต็มหน้าจอ พร้อมรายละเอียดเมื่อชี้เมาส์ ฟิลเตอร์ และซูม"
        size="full"
        footer={
          <div className="flex justify-end font-data">
            <Button variant="secondary" onClick={() => setExpanded(false)} icon={<X size={16} />}>Close</Button>
          </div>
        }
      >
        <div className="rounded-card border border-border bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-card-title">Showing: {filter}</p>
            <p className="text-caption-ui">เส้นวันที่ที่เลือก: {format(parseISO(selectedDate), 'd MMM yyyy')}</p>
            </div>
            <div className="flex items-center gap-2">
              <TimelineTool icon={<Minus size={15} />} onClick={zoomOut} label="Zoom out" />
              <span className="w-11 text-center text-chip-ui text-slateText">{zoom}%</span>
              <TimelineTool icon={<Plus size={15} />} onClick={zoomIn} label="Zoom in" />
            </div>
          </div>
          <TimelineCanvas selectedDate={selectedDate} bars={filteredBars} heightClass="h-[560px]" zoom={zoom} large onEditTask={onEditTask} />
        </div>
      </Modal>
    </>
  );
}

function TimelineHeader({
  filter,
  setFilter,
  zoom,
  zoomIn,
  zoomOut,
  onExpand,
}: {
  filter: string;
  setFilter: (value: string) => void;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  onExpand: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-5 pb-3">
      <div>
        <p className="font-data text-[14px] font-bold leading-5 text-ink">Project Timeline</p>
            <p className="font-kanit text-[12px] font-normal leading-5 text-slateText">ชี้เมาส์บนแถบสีเพื่อดูรายละเอียดโปรเจกต์</p>
      </div>
      <div className="flex items-center gap-2">
        <TimelineTool icon={<Filter size={15} />} label="Filter" />
        <FilterMenu value={filter} onChange={setFilter} />
        <TimelineTool icon={<Minus size={15} />} onClick={zoomOut} label="Zoom out" />
        <span className="w-11 text-center text-chip-ui text-slateText">{zoom}%</span>
        <TimelineTool icon={<Plus size={15} />} onClick={zoomIn} label="Zoom in" />
        <TimelineTool icon={<Expand size={15} />} onClick={onExpand} label="Expand timeline" />
      </div>
    </div>
  );
}

function FilterMenu({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 min-w-[126px] items-center justify-between gap-3 rounded-xl border border-primary-soft bg-primary-pale px-4 font-data text-[12px] font-medium text-ink transition hover:border-primary hover:bg-white"
      >
        <span>{value}</span>
        <ChevronDown size={15} className={`text-ink transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="absolute left-0 top-[42px] z-30 w-[126px] overflow-hidden rounded-none border border-primary-soft bg-primary-pale py-1 shadow-lift">
          {filters.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`block w-full px-4 py-1.5 text-left font-data text-[12px] font-medium leading-5 transition ${
                option === value ? 'bg-slate-600 text-white' : 'text-ink hover:bg-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TimelineCanvas({
  selectedDate,
  bars,
  heightClass,
  zoom,
  large = false,
  onEditTask,
}: {
  selectedDate: string;
  bars: TimelineBar[];
  heightClass: string;
  zoom: number;
  large?: boolean;
  onEditTask: (taskId: string) => void;
}) {
  const start = parseISO('2026-04-28');
  const end = parseISO('2026-06-30');
  const selected = parseISO(selectedDate);
  const todayOffset = datePercent(selected, start, end);

  return (
    <div className={`relative overflow-x-auto overflow-y-visible bg-white ${heightClass}`}>
      <div className="relative h-full min-w-full" style={{ width: `${zoom}%` }}>
        <div className="relative h-[33px] border-b border-border font-data text-[12px] font-medium leading-5 text-slateText">
          {timelineTicks.map((tick) => (
            <div
              key={tick.date}
              className="absolute top-0 -translate-x-1/2 py-2 text-center"
              style={{ left: `${datePercent(parseISO(tick.date), start, end)}%` }}
            >
              {tick.label}
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 top-[33px]">
          {timelineTicks.map((tick) => (
            <div
              key={tick.date}
              className="absolute bottom-0 top-0 w-px bg-border"
              style={{ left: `${datePercent(parseISO(tick.date), start, end)}%` }}
            />
          ))}
        </div>
        {[76, 121, 166, 211].map((top) => (
          <div key={top} className="absolute left-0 right-0 border-t border-border/70" style={{ top }} />
        ))}
        <div className="absolute bottom-0 top-[33px] w-px bg-primary/70" style={{ left: `${todayOffset}%` }}>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-primary px-2 py-1 font-inter text-[10px] font-bold leading-4 text-white">Today</span>
        </div>
        <div className="relative pt-3">
          {bars.map((bar, index) => (
            <TimelineRow key={`${bar.project}-${bar.label}`} bar={bar} index={index} start={start} end={end} large={large} onEditTask={onEditTask} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineRow({
  bar,
  index,
  start,
  end,
  large,
  onEditTask,
}: {
  bar: TimelineBar;
  index: number;
  start: Date;
  end: Date;
  large: boolean;
  onEditTask: (taskId: string) => void;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const dayMs = 24 * 60 * 60 * 1000;
  const left = datePercent(parseISO(bar.startDate), start, end);
  const right = datePercent(new Date(parseISO(bar.endDate).getTime() + dayMs), start, end);
  const width = Math.max(2, Math.min(100 - left, right - left));

  const moveTooltip = (event: React.MouseEvent<HTMLDivElement>) => {
    setTooltip({
      x: Math.min(window.innerWidth - 280, event.clientX + 14),
      y: Math.max(12, event.clientY - 132),
    });
  };

  return (
    <div className={`relative z-10 ${large ? 'h-[86px]' : 'h-[45px]'}`}>
      <div
        className={`absolute top-0 flex items-center gap-3 ${large ? 'h-10' : 'h-7'}`}
        style={{ left: `${left}%`, width: `${width}%` }}
      >
        <motion.div
          className={`flex w-full cursor-pointer items-center rounded-md px-4 font-data text-[12px] font-medium text-ink shadow-sm ${large ? 'h-10' : 'h-7'}`}
          style={{ backgroundColor: bar.color }}
          initial={{ scaleX: 0, opacity: 0, transformOrigin: 'left center' }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: index * 0.08, duration: 0.55, ease: 'easeOut' }}
          onMouseEnter={moveTooltip}
          onMouseMove={moveTooltip}
          onMouseLeave={() => setTooltip(null)}
          onClick={() => bar.taskId && onEditTask(bar.taskId)}
        >
          <span>{bar.project}</span>
        </motion.div>
        <span className="shrink-0 font-data text-[12px] font-bold leading-none text-ink">
          {bar.progress}%
        </span>
      </div>
      {tooltip
        ? createPortal(
            <div
              className="pointer-events-none fixed z-[9999] w-[260px] rounded-xl bg-ink px-3 py-2 font-data text-[12px] font-medium leading-5 text-white shadow-modal"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <p className="font-bold">{bar.project}</p>
              <p>{bar.task}</p>
              <p>Owner: {bar.owner}</p>
              <p>Status: {bar.status}</p>
              <p>Progress: {bar.progress}%</p>
              <p>Range: {bar.label}</p>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function datePercent(date: Date, start: Date, end: Date) {
  const dayMs = 24 * 60 * 60 * 1000;
  const totalMs = end.getTime() + dayMs - start.getTime();
  return Math.min(100, Math.max(0, ((date.getTime() - start.getTime()) / totalMs) * 100));
}

function TimelineTool({ icon, onClick, label }: { icon: ReactNode; onClick?: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-slateText transition hover:bg-primary-pale hover:text-primary"
    >
      {icon}
    </button>
  );
}
