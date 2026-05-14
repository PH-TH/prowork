import { CalendarDays } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { Card } from '../ui/Card';
import { CircularProgress } from '../ui/CircularProgress';

export function EndOfYearCountdown() {
  const { daysLeft } = useFinance();
  const used = ((365 - daysLeft) / 365) * 100;

  return (
    <Card hover={false}>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-yellow-50 p-3 text-yellow-600"><CalendarDays size={20} /></div>
        <div>
          <p className="text-section-title">End of Year Countdown</p>
          <p className="text-body-th text-slateText">เวลาที่เหลือในปีนี้สำหรับปิดเป้าหมายการเงิน</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center">
        <CircularProgress value={used} color="#F59E0B" label="year used" />
      </div>
      <p className="mt-5 text-center text-money text-ink">{daysLeft} days</p>
    </Card>
  );
}
