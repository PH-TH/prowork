import { ShieldCheck, TrendingUp, WalletCards } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { retirementProgress } from '../../lib/calculations';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';

export function FinanceInsightCard() {
  const { wallets, entries, retirementPlan, netWorth, subscriptionSpentYtd } = useFinance();
  const topWallets = wallets.slice(0, 5);
  const maxWallet = Math.max(...topWallets.map((wallet) => wallet.balance), 1);
  const recentCashflow = entries.slice(0, 7).reverse();
  const maxEntry = Math.max(...recentCashflow.map((entry) => entry.amount), 1);
  const fireProgress = retirementProgress(retirementPlan);

  return (
    <Card hover={false} className="xl:col-span-3 overflow-hidden">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-pale px-3 py-1 text-chip-ui text-primary">
            <ShieldCheck size={15} />
            Private Finance Control
          </div>
          <h2 className="mt-4 text-section-title">Financial Command View</h2>
          <p className="mt-2 text-body-th text-slateText">
            ภาพรวมนี้ช่วยอ่านสุขภาพการเงินแบบเร็ว: เงินรวมทั้งหมด, กระเป๋าหลัก, ค่าใช้จ่ายล่าสุด และความคืบหน้าแผนเกษียณ
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric label="มูลค่าทรัพย์สินสุทธิ" value={formatCurrency(netWorth)} />
            <Metric label="Subscription YTD" value={formatCurrency(subscriptionSpentYtd)} />
            <Metric label="FIRE Progress" value={`${fireProgress}%`} />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2">
              <WalletCards size={16} className="text-primary" />
              <p className="text-card-title">Wallet Distribution</p>
              <p className="text-body-th text-slateText">สัดส่วนเงินในกระเป๋าหลัก</p>
            </div>
            <div className="space-y-2">
              {topWallets.map((wallet) => (
                <div key={wallet.id} className="grid grid-cols-[130px_1fr_110px] items-center gap-3">
                  <p className="truncate text-caption-ui text-ink">{wallet.name}</p>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(5, (wallet.balance / maxWallet) * 100)}%`, backgroundColor: wallet.color }}
                    />
                  </div>
                  <p className="text-right font-inter text-[12px] font-bold leading-4 text-ink">{formatCurrency(wallet.balance)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-card-title">Recent Cashflow</p>
              <p className="text-body-th text-slateText">กราฟแท่งจากรายการล่าสุด</p>
            </div>
            <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="mt-6 flex h-44 items-end gap-2 rounded-2xl border border-border bg-white px-4 pb-4 pt-5">
            {recentCashflow.map((entry) => {
              const isPositive = entry.recordType === 'Income' || entry.recordType === 'Savings' || entry.recordType === 'Investment' || entry.recordType === 'Transfer';
              return (
                <div key={entry.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-xl ${isPositive ? 'bg-primary' : 'bg-red-400'}`}
                    style={{ height: `${Math.max(16, (entry.amount / maxEntry) * 128)}px` }}
                    title={`${entry.recordType}: ${formatCurrency(entry.amount)}`}
                  />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-primary-soft bg-primary-pale p-4">
            <p className="text-card-title">ความหมายของกราฟ</p>
            <p className="mt-1 text-body-th text-slateText">
              สีเขียวคือเงินเข้า/เงินออม/ลงทุน สีแดงคือค่าใช้จ่ายหรือ Subscription ใช้ดูแนวโน้มล่าสุดก่อนตัดสินใจบันทึกรายการใหม่
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-slate-50 p-4">
      <p className="text-body-th text-slateText">{label}</p>
      <p className="mt-1 font-inter text-[18px] font-extrabold leading-6 tracking-[-0.03em] text-ink">{value}</p>
    </div>
  );
}
