import { AlertCircle } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatCurrency } from '../../lib/utils';
import { retirementProgress } from '../../lib/calculations';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export function RetirementGoalCard() {
  const { retirementPlan } = useFinance();
  const progress = retirementProgress(retirementPlan);
  const remaining = retirementPlan.target - retirementPlan.currentFund;

  return (
    <Card hover={false} className="lg:col-span-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-section-title">Retirement Goal in 3 Years</p>
          <p className="mt-1 text-body-th text-slateText">เป้าหมายเกษียณจากตัวอย่างกฎ 4% ใช้ดูระยะห่างจากอิสรภาพทางการเงิน</p>
        </div>
        <div className="rounded-2xl bg-primary-pale p-3 text-primary"><AlertCircle size={20} /></div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Info label="ค่าใช้จ่ายต่อปี" value={formatCurrency(retirementPlan.yearlyLivingExpense)} />
        <Info label="เป้าหมายเงินเกษียณ" value={formatCurrency(retirementPlan.target)} />
        <Info label="เงินเกษียณปัจจุบัน" value={formatCurrency(retirementPlan.currentFund)} />
        <Info label="เงินที่ยังขาด" value={formatCurrency(remaining)} />
        <Info label="ต้องลงทุนต่อเดือน" value={formatCurrency(retirementPlan.monthlyInvestNeeded)} />
        <Info label="ความคืบหน้า" value={`${progress}%`} />
      </div>
      <ProgressBar value={progress} showLabel className="mt-5" />
      <p className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-3 text-caption-ui text-orange-700">{retirementPlan.note}</p>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-slate-50 p-4">
      <p className="text-body-th text-slateText">{label}</p>
      <p className="mt-1 font-inter text-[18px] font-extrabold leading-6 tracking-[-0.03em] text-ink">{value}</p>
    </div>
  );
}
