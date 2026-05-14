import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Tabs } from '../ui/Tabs';
import { Toggle } from '../ui/Toggle';

interface FinanceLockModalProps {
  open: boolean;
}

export function FinanceLockModal({ open }: FinanceLockModalProps) {
  const [mode, setMode] = useState('password');
  const [secret, setSecret] = useState('');
  const [remember, setRemember] = useState(false);
  const { unlockFinance, addToast, setActivePage } = useAppStore();

  const unlock = () => {
    if (!secret.trim()) return;
    unlockFinance();
    addToast({ title: 'Saved successfully', description: 'Finance unlocked for this session.' });
  };

  return (
    <Modal
      open={open}
      onClose={() => setActivePage('dashboard')}
      title="Finance Lock • ยืนยันตัวตนก่อนเข้าใช้งาน"
      subtitle="หน้านี้ถูกล็อกเพื่อความเป็นส่วนตัวของข้อมูลทางการเงิน"
      size="md"
      footer={
        <div className="flex justify-end">
          <Button onClick={unlock} icon={<ShieldCheck size={16} />}>Unlock Finance</Button>
        </div>
      }
    >
      <div className="grid gap-5">
        <div className="flex items-center gap-4 rounded-card border border-primary-soft bg-primary-pale p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-primary">
            <LockKeyhole size={30} />
          </div>
          <div>
            <p className="text-card-title">Private financial workspace</p>
            <p className="mt-1 text-body-th text-slateText">ต้องยืนยันรหัสผ่านหรือ PIN ทุกครั้งก่อนดูข้อมูลเงิน กระเป๋า Subscription และแผนเกษียณ</p>
          </div>
        </div>
        <Tabs
          active={mode}
          onChange={setMode}
          items={[
            { id: 'password', label: 'Password', content: <Input label="Password" type="password" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Enter any value or 1234" /> },
            { id: 'pin', label: 'PIN', content: <Input label="PIN" type="password" inputMode="numeric" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="1234" /> },
          ]}
        />
        <Toggle checked={remember} onChange={setRemember} label="Remember device" />
        <p className="text-body-th text-slateText">สำหรับ mock demo นี้ ใส่ค่าใดก็ได้ หรือใช้ 1234 เพื่อปลดล็อก</p>
        <button type="button" className="text-left font-inter text-[14px] font-bold leading-5 text-primary hover:text-primary-hover">Forgot password?</button>
        <Card hover={false} className="bg-slate-50">
          <p className="text-card-title">Security info</p>
          <p className="mt-1 text-body-th text-slateText">ข้อมูลที่ถูกป้องกันในหน้านี้</p>
          <div className="mt-3 grid gap-2 text-body-ui text-slateText">
            <span>Private data</span>
            <span>Retirement plan</span>
            <span>Bank wallets</span>
            <span>Subscription records</span>
          </div>
        </Card>
      </div>
    </Modal>
  );
}
