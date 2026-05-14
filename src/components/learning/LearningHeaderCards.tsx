import { CalendarClock, Clock, RotateCcw, Target } from 'lucide-react';
import { useLearning } from '../../hooks/useLearning';
import { Card } from '../ui/Card';

export function LearningHeaderCards() {
  const { activePlan } = useLearning();
  const cards = [
    { label: 'Work Shift', value: activePlan.workShift, icon: CalendarClock, tone: 'text-blue-600 bg-blue-50' },
    { label: 'Weekday Learning', value: activePlan.weekdayLearning, icon: Clock, tone: 'text-primary bg-primary-pale' },
    { label: activePlan.retrievalBlock ? 'Retrieval Block' : 'Weekend Deep Learning', value: activePlan.retrievalBlock ?? activePlan.weekendDeepLearning, icon: RotateCcw, tone: 'text-purple-600 bg-purple-50' },
    { label: 'Weekly Target', value: activePlan.weeklyTarget, icon: Target, tone: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-caption-ui">{card.label}</p>
                <p className="mt-3 font-inter text-[20px] font-extrabold leading-7 tracking-[-0.03em] text-ink">{card.value}</p>
              </div>
              <div className={`rounded-2xl p-3 ${card.tone}`}><Icon size={20} /></div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
