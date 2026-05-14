import { Landmark, Plus, Receipt, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AddFinanceEntryModal } from '../components/finance/AddFinanceEntryModal';
import { EndOfYearCountdown } from '../components/finance/EndOfYearCountdown';
import { ExpensesChart } from '../components/finance/ExpensesChart';
import { FinanceInsightCard } from '../components/finance/FinanceInsightCard';
import { FinanceKpiCards } from '../components/finance/FinanceKpiCards';
import { FinanceLockModal } from '../components/finance/FinanceLockModal';
import { RetirementGoalCard } from '../components/finance/RetirementGoalCard';
import { SavingsGoalsCard } from '../components/finance/SavingsGoalsCard';
import { SubscriptionList } from '../components/finance/SubscriptionList';
import { WalletList } from '../components/finance/WalletList';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { Toggle } from '../components/ui/Toggle';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../lib/utils';
import { useAppStore } from '../stores/appStore';
import { useFinanceStore } from '../stores/financeStore';
import type { Wallet as WalletType } from '../types/finance';

export function FinancePage() {
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [tab, setTab] = useState('overview');
  const financeUnlocked = useAppStore((state) => state.financeUnlocked);
  const addToast = useAppStore((state) => state.addToast);
  const { entries, wallets } = useFinance();
  const addWallet = useFinanceStore((state) => state.addWallet);
  const addEntry = useFinanceStore((state) => state.addEntry);

  const [walletForm, setWalletForm] = useState<Omit<WalletType, 'id'>>({
    name: 'New Investment Wallet',
    balance: 50000,
    type: 'Investment',
    color: '#16A34A',
  });
  const [subscriptionForm, setSubscriptionForm] = useState({
    serviceName: 'New SaaS Tool',
    planType: 'Pro',
    amount: 499,
    walletId: wallets[0]?.id ?? '',
    nextBillingDate: '2026-06-01',
    autoRenew: true,
  });

  const recentEntries = useMemo(() => entries.slice(0, 6), [entries]);

  const overview = (
    <div className="grid gap-4 xl:grid-cols-3">
      <FinanceInsightCard />
      <RetirementGoalCard />
      <WalletList />
      <SavingsGoalsCard />
      <ExpensesChart />
      <SubscriptionList />
      <EndOfYearCountdown />
    </div>
  );

  const saveWallet = () => {
    addWallet(walletForm);
    addToast({ title: 'Saved successfully', description: 'เพิ่มกระเป๋าเงินแล้ว และยอดรวมจะอัปเดตใน KPI กับ Wallet List ทันที' });
    setWalletModalOpen(false);
  };

  const saveSubscription = () => {
    const walletId = subscriptionForm.walletId || wallets[0]?.id;
    if (!walletId) {
      addToast({ title: 'Unable to save subscription', description: 'กรุณาเพิ่ม Bank Wallet ก่อนบันทึก Subscription', type: 'warning' });
      return;
    }

    addEntry({
      walletId,
      recordType: 'Subscription',
      category: 'Subscriptions',
      subcategory: subscriptionForm.planType,
      amount: Number(subscriptionForm.amount),
      date: '2026-05-04',
      isRecurring: true,
      frequency: 'Monthly',
      nextBillingDate: subscriptionForm.nextBillingDate,
      serviceName: subscriptionForm.serviceName,
      planType: subscriptionForm.planType,
      autoRenew: subscriptionForm.autoRenew,
      remark: 'Created from Add Subscription.',
      tags: ['subscription'],
    });

    addToast({ title: 'Saved successfully', description: 'เพิ่ม Subscription แล้ว และเชื่อมกับ Recent Entries, Wallet totals, KPI และกราฟค่าใช้จ่ายแล้ว' });
    setSubscriptionModalOpen(false);
  };

  return (
    <div className="relative space-y-8">
      <div className={!financeUnlocked ? 'pointer-events-none blur-[5px]' : ''}>
        <PageHeader
          title="Finance & Retirement Plan"
          subtitle="พื้นที่ส่วนตัวสำหรับดูเงิน กระเป๋า Subscription และแผนเกษียณ พร้อมคำอธิบายแต่ละหัวข้อเป็นภาษาไทย"
          actions={
            <>
              <Badge tone="green">ล็อกทุกครั้งเพื่อความเป็นส่วนตัว</Badge>
              <Select aria-label="Finance date filter" value="This Year" options={['This Year', 'This Month', 'Last 90 Days']} className="w-[150px]" />
              <Button icon={<Plus size={16} />} onClick={() => setEntryModalOpen(true)}>Add Entry</Button>
              <Button variant="secondary" icon={<Landmark size={16} />} onClick={() => setWalletModalOpen(true)}>Add Bank</Button>
              <Button variant="secondary" icon={<Receipt size={16} />} onClick={() => setSubscriptionModalOpen(true)}>Add Subscription</Button>
            </>
          }
        />
        <FinanceKpiCards />
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <Tabs
            active={tab}
            onChange={setTab}
            items={[
              { id: 'overview', label: 'Overview', content: <div className="pt-5">{overview}</div> },
              { id: 'wallets', label: 'Bank Wallets', content: <div className="grid gap-4 pt-5 md:grid-cols-2"><WalletList /><Button variant="secondary" icon={<Wallet size={16} />} onClick={() => setWalletModalOpen(true)}>Add Bank</Button></div> },
              { id: 'savings', label: 'Savings', content: <div className="pt-5"><SavingsGoalsCard /></div> },
              { id: 'expenses', label: 'Expenses', content: <div className="pt-5"><ExpensesChart /></div> },
              { id: 'subscriptions', label: 'Subscriptions', content: <div className="grid gap-4 pt-5 md:grid-cols-2"><SubscriptionList /><Button variant="secondary" icon={<Receipt size={16} />} onClick={() => setSubscriptionModalOpen(true)}>Add Subscription</Button></div> },
              { id: 'retirement', label: 'Retirement Plan', content: <div className="pt-5"><RetirementGoalCard /></div> },
            ]}
          />
        </div>
        <Card hover={false}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-section-title">Recent Finance Entries</p>
              <p className="text-body-th text-slateText">รายการล่าสุดจาก Add Entry และ Add Subscription จะแสดงตรงนี้ พร้อมอัปเดตยอดกระเป๋า KPI และกราฟค่าใช้จ่ายที่เกี่ยวข้อง</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setEntryModalOpen(true)} icon={<Plus size={15} />}>Record</Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-border text-table-header">
                <tr>
                  <th className="py-3">Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Wallet</th>
                  <th className="text-right">Amount</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((entry) => {
                  const wallet = wallets.find((item) => item.id === entry.walletId);
                  return (
                    <tr key={entry.id} className="border-b border-border/70 text-table-cell">
                      <td className="py-3">{entry.date}</td>
                      <td>{entry.recordType}</td>
                      <td>{entry.category}</td>
                      <td>{wallet?.name ?? 'Wallet'}</td>
                      <td className="text-right font-bold text-ink">{formatCurrency(entry.amount)}</td>
                      <td>{entry.remark || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <FinanceLockModal open={!financeUnlocked} />
      <AddFinanceEntryModal open={entryModalOpen} onClose={() => setEntryModalOpen(false)} />

      <Modal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        title="Add Bank Wallet"
        subtitle="เพิ่มบัญชีหรือกระเป๋าเงินใหม่ ข้อมูลจะไปแสดงใน Bank Wallets และ Net Worth ทันที"
        footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setWalletModalOpen(false)}>Cancel</Button><Button onClick={saveWallet}>Save Wallet</Button></div>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Wallet Name" value={walletForm.name} onChange={(event) => setWalletForm((current) => ({ ...current, name: event.target.value }))} />
          <Select label="Type" value={walletForm.type} options={['Savings', 'Reserve', 'Daily Use', 'Cash', 'Investment']} onChange={(event) => setWalletForm((current) => ({ ...current, type: event.target.value as WalletType['type'] }))} />
          <Input label="Opening Balance" type="number" value={walletForm.balance} onChange={(event) => setWalletForm((current) => ({ ...current, balance: Number(event.target.value) }))} />
          <Input label="Color" type="color" value={walletForm.color} onChange={(event) => setWalletForm((current) => ({ ...current, color: event.target.value }))} className="h-11 p-1" />
        </div>
      </Modal>

      <Modal
        open={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        title="Add Subscription"
        subtitle="เพิ่มบริการรายเดือนและเชื่อมกับรายการการเงิน กระเป๋าเงิน Subscription list และกราฟค่าใช้จ่าย"
        footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setSubscriptionModalOpen(false)}>Cancel</Button><Button onClick={saveSubscription}>Save Subscription</Button></div>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Service Name" value={subscriptionForm.serviceName} onChange={(event) => setSubscriptionForm((current) => ({ ...current, serviceName: event.target.value }))} />
          <Select label="Plan Type" value={subscriptionForm.planType} options={['Basic', 'Plus', 'Pro', 'Premium', 'Annual']} onChange={(event) => setSubscriptionForm((current) => ({ ...current, planType: event.target.value }))} />
          <Input label="Amount" type="number" value={subscriptionForm.amount} onChange={(event) => setSubscriptionForm((current) => ({ ...current, amount: Number(event.target.value) }))} />
          <Select label="Bank / Wallet" value={subscriptionForm.walletId || wallets[0]?.id} options={wallets.map((wallet) => ({ label: wallet.name, value: wallet.id }))} onChange={(event) => setSubscriptionForm((current) => ({ ...current, walletId: event.target.value }))} />
          <Input label="Next Billing Date" type="date" value={subscriptionForm.nextBillingDate} onChange={(event) => setSubscriptionForm((current) => ({ ...current, nextBillingDate: event.target.value }))} />
          <div className="md:col-span-2">
            <Toggle checked={subscriptionForm.autoRenew} onChange={(value) => setSubscriptionForm((current) => ({ ...current, autoRenew: value }))} label="Auto Renew" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
