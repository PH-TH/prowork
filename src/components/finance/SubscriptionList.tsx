import { useFinance } from '../../hooks/useFinance';
import { formatDateLabel } from '../../lib/date';
import { formatCurrency } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export function SubscriptionList() {
  const { subscriptions } = useFinance();

  return (
    <Card hover={false}>
      <p className="text-section-title">Subscriptions</p>
      <p className="mt-1 text-body-th text-slateText">บริการรายเดือนและวันตัดรอบถัดไป ใช้ควบคุมค่าใช้จ่ายประจำ</p>
      <div className="mt-4 space-y-3">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="rounded-2xl border border-border bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-body-ui text-ink">{sub.serviceName}</p>
                <p className="text-caption-ui">{sub.planType} • {formatDateLabel(sub.nextBillingDate, 'MMM d')}</p>
              </div>
              <p className="font-inter text-[14px] font-bold leading-5 text-ink">{formatCurrency(sub.amount)}</p>
            </div>
            <div className="mt-2"><Badge tone={sub.autoRenew ? 'green' : 'gray'}>{sub.autoRenew ? 'Auto Renew' : 'Manual'}</Badge></div>
          </div>
        ))}
      </div>
    </Card>
  );
}
