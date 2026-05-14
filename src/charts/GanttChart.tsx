import { motion } from 'framer-motion';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { WorkMember, WorkProject } from '../types/work';
import { appToday, dateKey, formatDateLabel } from '../lib/date';
import { Tooltip } from '../components/ui/Tooltip';

interface GanttChartProps {
  projects: WorkProject[];
  members: WorkMember[];
}

export function GanttChart({ projects, members }: GanttChartProps) {
  const start = parseISO('2026-05-01');
  const end = parseISO('2026-06-30');
  const totalDays = differenceInCalendarDays(end, start) + 1;
  const todayOffset = Math.min(100, Math.max(0, (differenceInCalendarDays(parseISO(dateKey(appToday)), start) / totalDays) * 100));
  const ticks = ['May 1', 'May 15', 'Jun 1', 'Jun 15', 'Jun 30'];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[150px_1fr] gap-4 border-b border-border pb-3 text-table-header">
          <div>Project</div>
          <div className="relative flex justify-between">
            {ticks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        </div>
        <div className="relative mt-4 space-y-4">
          <div className="pointer-events-none absolute bottom-0 left-[166px] right-0 top-0">
            <div className="absolute bottom-0 top-0 w-px bg-red-500" style={{ left: `${todayOffset}%` }}>
              <span className="absolute -top-4 -translate-x-1/2 rounded-full bg-red-50 px-2 py-0.5 font-inter text-[10px] font-bold leading-4 text-red-600">Today</span>
            </div>
          </div>
          {projects.map((project, index) => {
            const left = (differenceInCalendarDays(parseISO(project.startDate), start) / totalDays) * 100;
            const width = ((differenceInCalendarDays(parseISO(project.endDate), parseISO(project.startDate)) + 1) / totalDays) * 100;
            const owner = members.find((member) => member.id === project.ownerId);
            return (
              <div key={project.id} className="grid grid-cols-[150px_1fr] items-center gap-4">
                <div>
                  <p className="text-body-ui text-ink">{project.name}</p>
                  <p className="text-caption-ui">{owner?.name}</p>
                </div>
                <div className="relative h-10 rounded-full bg-slate-100">
                  <Tooltip
                    content={
                      <div>
                        <p className="font-bold">{project.name}</p>
                        <p>{formatDateLabel(project.startDate, 'MMM d')} - {formatDateLabel(project.endDate, 'MMM d')}</p>
                        <p>Owner: {owner?.name}</p>
                        <p>Progress: {project.progress}%</p>
                        <p>Status: {project.status}</p>
                        <p>{project.remark}</p>
                      </div>
                    }
                  >
                    <motion.div
                      className="absolute top-1/2 h-5 -translate-y-1/2 rounded-full shadow-sm"
                      style={{ left: `${left}%`, backgroundColor: project.color }}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: `${width}%`, opacity: 1 }}
                      transition={{ delay: index * 0.07, duration: 0.75, ease: 'easeOut' }}
                    />
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
