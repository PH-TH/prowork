import { CheckCircle2 } from 'lucide-react';
import { learningService } from '../../services/learningService';
import { Card } from '../ui/Card';

export function LearningPrinciplesCard() {
  return (
    <Card hover={false}>
      <p className="text-section-title-th">หลักการที่มีงานวิจัยรองรับ</p>
      <div className="mt-4 space-y-3">
        {learningService.getPrinciples().map((principle) => (
          <div key={principle} className="flex items-center gap-3">
            <CheckCircle2 className="text-primary" size={18} />
            <span className="text-body-th text-slateText">{principle}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
