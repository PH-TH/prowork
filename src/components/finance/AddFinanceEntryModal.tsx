import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { financeFormSchema, type FinanceFormValues } from '../../forms/financeFormSchema';
import { FINANCE_FREQUENCIES, FINANCE_RECORD_TYPES } from '../../lib/constants';
import { useAppStore } from '../../stores/appStore';
import { useFinanceStore } from '../../stores/financeStore';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Toggle } from '../ui/Toggle';

interface AddFinanceEntryModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddFinanceEntryModal({ open, onClose }: AddFinanceEntryModalProps) {
  const { wallets, addEntry } = useFinanceStore();
  const addToast = useAppStore((state) => state.addToast);
  const { register, handleSubmit, watch, setValue, reset } = useForm<FinanceFormValues>({
    resolver: zodResolver(financeFormSchema),
    defaultValues: {
      recordType: 'Expense',
      walletId: wallets[0]?.id,
      accountType: 'Savings',
      date: '2026-05-04',
      amount: 1000,
      category: 'Food',
      subcategory: 'Meal',
      remark: '',
      tags: '',
      isRecurring: false,
      frequency: 'None',
      nextBillingDate: '',
      serviceName: '',
      planType: '',
      autoRenew: false,
    },
  });

  const submit = ({ accountType: _accountType, tags, ...values }: FinanceFormValues) => {
    addEntry({ ...values, tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [] });
    addToast({ title: 'Saved successfully', description: 'บันทึกรายการการเงินแล้ว และอัปเดตกระเป๋า KPI รายการล่าสุด และกราฟที่เกี่ยวข้อง' });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Finance Entry"
      subtitle="บันทึกรายรับ รายจ่าย เงินออม ลงทุน โอนเงิน หรือ Subscription แล้วเชื่อมกับกระเป๋า KPI และรายการล่าสุด"
      size="xl"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="outline" type="button">Save Draft</Button>
          <Button type="submit" form="add-finance-form" icon={<Save size={16} />}>Save Entry</Button>
        </div>
      }
    >
      <form id="add-finance-form" onSubmit={handleSubmit(submit)} className="grid gap-6">
        <section>
          <p className="mb-3 text-card-title">Basic Info</p>
          <p className="mb-4 text-body-th text-slateText">ข้อมูลหลักของรายการ ใช้กำหนดประเภท กระเป๋า วันที่ และยอดเงิน</p>
          <div className="grid gap-4 md:grid-cols-3">
            <Select label="Record Type" options={FINANCE_RECORD_TYPES} {...register('recordType')} />
            <Select label="Bank / Wallet" options={wallets.map((wallet) => ({ label: wallet.name, value: wallet.id }))} {...register('walletId')} />
            <Select label="Account Type" options={['Savings', 'Reserve', 'Daily Use', 'Cash', 'Investment']} {...register('accountType')} />
            <DatePicker label="Date" {...register('date')} />
            <Input label="Amount" type="number" {...register('amount')} />
          </div>
        </section>
        <section>
          <p className="mb-3 text-card-title">Category</p>
          <p className="mb-4 text-body-th text-slateText">หมวดหมู่ช่วยให้กราฟค่าใช้จ่ายและการสรุปผลอ่านง่ายขึ้น</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Category" options={['Housing', 'Food', 'Transport', 'Bills', 'Health', 'Lifestyle', 'Retirement', 'Subscriptions']} {...register('category')} />
            <Input label="Subcategory" {...register('subcategory')} />
          </div>
        </section>
        <section>
          <p className="mb-3 text-card-title">Details</p>
          <p className="mb-4 text-body-th text-slateText">รายละเอียดเสริมสำหรับติดตามเหตุผล แท็ก และรอบการจ่ายซ้ำ</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Textarea label="Remark / Note" {...register('remark')} />
            <Input label="Tags" placeholder="fire, food, learning" {...register('tags')} />
            <Toggle checked={watch('isRecurring')} onChange={(value) => setValue('isRecurring', value)} label="Recurring" />
            <Select label="Frequency" options={FINANCE_FREQUENCIES} {...register('frequency')} />
            <DatePicker label="Next Billing Date" {...register('nextBillingDate')} />
          </div>
        </section>
        <section>
          <p className="mb-3 text-card-title">Subscription Details</p>
          <p className="mb-4 text-body-th text-slateText">ส่วนนี้ใช้เมื่อรายการเป็นบริการรายเดือนหรือรายปี เช่น SaaS, Streaming, Cloud</p>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Service Name" {...register('serviceName')} />
            <Select label="Plan Type" options={['Basic', 'Plus', 'Pro', 'Premium', 'Annual']} {...register('planType')} />
            <Toggle checked={watch('autoRenew')} onChange={(value) => setValue('autoRenew', value)} label="Auto Renew" />
          </div>
        </section>
      </form>
    </Modal>
  );
}
