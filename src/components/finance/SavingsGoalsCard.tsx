import { useFinance } from '../../hooks/useFinance';
import { goalProgress } from '../../lib/calculations';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export function SavingsGoalsCard() {
  const { savingsGoals } = useFinance();

  return (
    <Card hover={false}>
      <p className="text-section-title">Savings Goals</p>
      <p className="mt-1 text-body-th text-slateText">เป้าหมายเงินออมแต่ละก้อน ใช้ดูว่ากองไหนใกล้สำเร็จแล้ว</p>
      <div className="mt-5 space-y-4">
        {savingsGoals.map((goal) => (
          <div key={goal.id}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-body-ui text-ink">{goal.name}</p>
                <p className="text-caption-ui">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</p>
              </div>
              <span className="font-inter text-[14px] font-bold leading-5 text-ink">{goalProgress(goal)}%</span>
            </div>
            <ProgressBar value={goalProgress(goal)} color={goal.color} />
          </div>
        ))}
      </div>
    </Card>
  );
}
