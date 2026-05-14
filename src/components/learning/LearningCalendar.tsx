import { addDays, endOfMonth, format, startOfMonth } from 'date-fns';
import { motion } from 'framer-motion';
import { useLearning } from '../../hooks/useLearning';
import { Card } from '../ui/Card';
import { Tooltip } from '../ui/Tooltip';

const chipTone = {
  Learning: 'bg-primary-pale text-primary border-primary-soft',
  Work: 'bg-blue-50 text-blue-700 border-blue-100',
  Trading: 'bg-orange-50 text-orange-700 border-orange-100',
  Review: 'bg-purple-50 text-purple-700 border-purple-100',
};

interface LearningCalendarProps {
  skillFilter?: string;
}

export function LearningCalendar({ skillFilter = 'All Skills' }: LearningCalendarProps) {
  const { activePlan } = useLearning();
  const monthDate = activePlan.month === 'May 2026' ? new Date('2026-05-01') : new Date('2026-06-01');
  const dayCount = Number(format(endOfMonth(monthDate), 'd'));
  const days = Array.from({ length: dayCount }, (_, index) => addDays(startOfMonth(monthDate), index));

  return (
    <Card hover={false}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-section-title">Monthly Learning Calendar</p>
          <p className="text-page-subtitle">Short chips keep each day scannable around work and trading energy.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-chip-ui">
          {Object.entries(chipTone).map(([label, tone]) => (
            <span key={label} className={`rounded-full border px-2 py-1 ${tone}`}>{label}</span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="px-2 font-inter text-[12px] font-medium leading-4 text-slateText">{day}</div>
        ))}
        {days.map((day, index) => {
          const key = format(day, 'yyyy-MM-dd');
          const chips = activePlan.chips
            .filter((chip) => chip.date === key)
            .filter((chip) => skillFilter === 'All Skills' || chip.label.includes(skillFilter.split(' ')[0]))
            .slice(0, 3);
          return (
            <div key={key} className="min-h-[118px] rounded-2xl border border-border bg-white p-2 transition hover:bg-primary-pale hover:ring-2 hover:ring-primary-soft">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-inter text-[14px] font-bold leading-5 text-ink">{format(day, 'd')}</span>
                <span className="font-inter text-[10px] font-medium leading-4 text-slateText">{format(day, 'EEE')}</span>
              </div>
              <div className="space-y-1.5">
                {chips.map((chip, chipIndex) => (
                  <Tooltip key={chip.id} content={`${chip.label} • ${chip.time} • ${chip.type}`}>
                    <motion.div
                      className={`truncate rounded-full border px-2 py-1 font-inter text-[11px] font-semibold leading-4 ${chipTone[chip.type]}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.01 + chipIndex * 0.03, duration: 0.16 }}
                    >
                      {chip.time} {chip.label}
                    </motion.div>
                  </Tooltip>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
