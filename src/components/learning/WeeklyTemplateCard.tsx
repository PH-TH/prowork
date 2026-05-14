import { learningService } from '../../services/learningService';
import { Card } from '../ui/Card';

export function WeeklyTemplateCard() {
  return (
    <Card hover={false}>
      <p className="text-section-title-th">Template รายสัปดาห์</p>
      <div className="mt-4 space-y-2">
        {learningService.getWeeklyTemplate().map(([day, plan]) => (
          <div key={day} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-slate-50 px-3 py-2">
            <span className="text-body-ui text-ink">{day}</span>
            <span className="text-right text-body-th text-slateText">{plan}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
