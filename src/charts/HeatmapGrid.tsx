import { motion } from 'framer-motion';
import type { Habit, HabitLog, HabitLogStatus } from '../types/habit';
import { Tooltip } from '../components/ui/Tooltip';

interface HeatmapGridProps {
  habits: Habit[];
  logs: HabitLog[];
  days?: number;
}

const statusColor: Record<HabitLogStatus, string> = {
  'No Data': '#FFFFFF',
  Missed: '#F1F5F9',
  Partial: '#BBF7D0',
  Completed: '#4ADE80',
  Perfect: '#16A34A',
};

export function HeatmapGrid({ habits, logs, days = 31 }: HeatmapGridProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[860px]">
        <div className="grid grid-cols-[160px_repeat(31,minmax(18px,1fr))] gap-1 font-inter text-[11px] font-medium leading-4 text-slateText">
          <div />
          {Array.from({ length: days }, (_, index) => (
            <div key={index} className="text-center">
              {index + 1}
            </div>
          ))}
          {habits.map((habit, rowIndex) => (
            <div key={habit.id} className="contents">
              <div className="flex items-center truncate py-1 pr-2 text-body-ui text-ink">{habit.name}</div>
              {Array.from({ length: days }, (_, index) => {
                const date = `2026-05-${String(index + 1).padStart(2, '0')}`;
                const log = logs.find((item) => item.habitId === habit.id && item.date === date);
                const status = log?.status ?? 'No Data';
                return (
                  <Tooltip
                    key={`${habit.id}-${date}`}
                    className="flex w-full"
                    content={
                      <div>
                        <p className="font-bold">{habit.name}</p>
                        <p>Date: {date}</p>
                        <p>Status: {status}</p>
                        <p>Value: {log?.value ?? 0} {habit.unit}</p>
                        <p>{log?.remark ?? 'No log yet.'}</p>
                      </div>
                    }
                  >
                    <motion.div
                      className="h-6 min-w-[20px] flex-1 rounded-md border border-border transition hover:ring-2 hover:ring-primary-soft"
                      style={{ backgroundColor: statusColor[status] }}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (rowIndex * days + index) * 0.003, duration: 0.18 }}
                    />
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
