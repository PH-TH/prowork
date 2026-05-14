import { Target } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Chip } from '../ui/Chip';

const priorityLabel: Record<string, string> = {
  High: 'สูง',
  Medium: 'กลาง',
  Low: 'ต่ำ',
};

const moduleLabel: Record<string, string> = {
  Work: 'งาน',
  Habit: 'นิสัย',
  Learning: 'การเรียน',
  Finance: 'การเงิน',
  'Trading+': 'เทรด',
  Backtest: 'แบ็กเทสต์',
  Journals: 'บันทึก',
};

const focusLabel: Record<string, string> = {
  'focus-work': 'ตรวจงานค้างที่สำคัญที่สุด 1 รายการ',
  'focus-habit': 'ทำ habit ถัดไปใน checklist ให้เสร็จ',
  'focus-learning': 'บันทึกผลลัพธ์จากการเรียนอย่างน้อย 1 อย่าง',
  'focus-finance': 'เพิ่มรายการการเงินให้ถูกต้องครบถ้วน',
  'focus-trading': 'รีวิวเทรดที่ปิดแล้วและใส่แท็กอารมณ์',
  'focus-backtest': 'เพิ่มรายการ Backtest พร้อม MFE, MAE และบทเรียน',
  'focus-journal': 'เขียนสิ่งที่ต้องแก้จริง ๆ และ One Big Move ของพรุ่งนี้',
};

export function DailyFocusCard() {
  const { focusItems } = useDashboard();

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-section-title">โฟกัสวันนี้</p>
          <p className="font-kanit text-[14px] leading-[22px] text-slateText">รายการสำคัญที่ควรปิดให้ได้ เพื่อให้วันนี้เดินหน้าจริง</p>
        </div>
        <div className="rounded-2xl bg-primary-pale p-3 text-primary">
          <Target size={20} />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {focusItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-slate-50 px-4 py-3">
            <div>
              <p className="font-kanit text-[14px] leading-[22px] text-ink">{focusLabel[item.id] ?? item.label}</p>
              <p className="font-kanit text-[12px] leading-5 text-slateText">{moduleLabel[item.module] ?? item.module}</p>
            </div>
            <Badge tone={item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'orange' : 'green'}>{priorityLabel[item.priority] ?? item.priority}</Badge>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {['เพิ่มงาน', 'บันทึกนิสัย', 'เริ่มเรียน', 'รีวิวเทรด', 'เพิ่มแบ็กเทสต์'].map((label) => (
          <Chip key={label}>{label}</Chip>
        ))}
      </div>
    </Card>
  );
}
