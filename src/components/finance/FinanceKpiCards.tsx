import { CalendarDays, Flame, PiggyBank, Receipt, TrendingUp, WalletCards } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { KpiCard } from '../ui/Card';

export function FinanceKpiCards() {
  const { netWorth, totalSaved, investedAssets, subscriptionSpentYtd, daysLeft, fireProgress } = useFinance();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <KpiCard label="Net Worth" value={Number((netWorth / 1000000).toFixed(2))} suffix="M THB" helper="มูลค่ารวมจากทุกกระเป๋า" tone="green" icon={<WalletCards size={20} />} />
      <KpiCard label="Total Saved" value={Number((totalSaved / 1000000).toFixed(2))} suffix="M THB" helper="เงินออมและเงินสำรอง" tone="blue" icon={<PiggyBank size={20} />} />
      <KpiCard label="Invested Assets" value={Number((investedAssets / 1000000).toFixed(2))} suffix="M THB" helper="สินทรัพย์ระยะยาว" tone="purple" icon={<TrendingUp size={20} />} />
      <KpiCard label="Subscription Spent YTD" value={Number((subscriptionSpentYtd / 1000).toFixed(1))} suffix="K THB" helper="ยอด Subscription ปีนี้" tone="orange" icon={<Receipt size={20} />} />
      <KpiCard label="Days Left This Year" value={daysLeft} suffix=" days" helper="เวลาที่เหลือในการปิดเป้าหมายปีนี้" tone="gold" icon={<CalendarDays size={20} />} />
      <KpiCard label="FIRE Progress" value={fireProgress} suffix="%" helper="ความคืบหน้าเป้าหมายเกษียณ" tone="green" icon={<Flame size={20} />} />
    </div>
  );
}
