import { MessageCircleHeart } from 'lucide-react';
import { workService } from '../../services/workService';
import { Card } from '../ui/Card';

export function WorkReminderCard() {
  return (
    <Card className="border-orange-100 bg-orange-50" hover={false}>
      <div className="flex gap-3">
        <div className="rounded-2xl bg-white p-3 text-orange-600">
          <MessageCircleHeart size={20} />
        </div>
        <div>
          <p className="text-card-title">Daily self-reminder</p>
          <p className="mt-2 text-body-th text-slateText">{workService.getReminderQuote()}</p>
        </div>
      </div>
    </Card>
  );
}
