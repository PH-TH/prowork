import { ArrowUpRight } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAppStore } from '../../stores/appStore';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

const titleText: Record<string, string> = {
  work: 'Work Summary',
  habit: 'Habit Summary',
  learning: 'Learning Summary',
  finance: 'Finance Summary',
  journals: 'Journals Summary',
  trading: 'Trading+ Summary',
  backtest: 'Backtest Summary',
  settings: 'Settings Summary',
};

const descriptionText: Record<string, string> = {
  work: 'งานของวันที่เลือกเชื่อมกับ Timeline, Calendar และสถานะงานในหน้า Work ทั้งหมด',
  habit: 'นิสัยที่เปิดใช้งาน บันทึกรายวัน การเตือน และ Heatmap ใช้ข้อมูลชุดเดียวกัน',
  learning: 'แผนการเรียนและ session ที่บันทึกไว้จะแสดงในปฏิทินการเรียนและรายการล่าสุด',
  finance: 'รายการที่เพิ่มจะอัปเดตกระเป๋าเงิน subscription และ KPI การเงินโดยอัตโนมัติ',
  journals: 'บันทึกประจำวันจะอัปเดตสถานะ อารมณ์ ปฏิทิน และภาพรวมการเติบโตส่วนตัว',
  trading: 'สมุดเทรดใช้ติดตามความเสี่ยง R-multiple วินัยตามกฎ watchlist และอารมณ์หลังเทรด',
  backtest: 'ข้อมูล Backtest รวมกลยุทธ์ สภาวะตลาด MFE/MAE ข้อผิดพลาด และผลการ validate ระบบ',
  settings: 'ตั้งค่าธีม การแจ้งเตือน Finance Lock แรงบันดาลใจ AI และการ export ข้อมูล',
};

function translateMetric(value: string) {
  return value
    .replace('pending', 'งานค้าง')
    .replace('completion', 'สำเร็จ')
    .replace('hrs today', 'ชม. วันนี้')
    .replace('done', 'เสร็จ')
    .replace('net', 'สุทธิ')
    .replace('tested', 'ทดสอบแล้ว')
    .replace('Ready', 'พร้อมใช้งาน');
}

function translateStatus(value: string) {
  return value
    .replace('blocked/overdue', 'ติดขัด/เกินกำหนด')
    .replace('active habits', 'นิสัยที่ใช้งาน')
    .replace('skills', 'ทักษะ')
    .replace('entries', 'บันทึก')
    .replace('open trades', 'ออเดอร์เปิด')
    .replace('trades', 'รายการ')
    .replace('Configurable', 'ตั้งค่าได้');
}

export function DashboardSummaryCards() {
  const { summaries } = useDashboard();
  const { setActivePage, lockFinance } = useAppStore();

  return (
    <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaries.map((summary) => (
        <Card key={summary.id} className="flex h-full min-h-[250px] flex-col p-5">
          <div className="flex min-h-[124px] items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              <p className="font-inter text-[14px] font-bold leading-5 text-slate-950">{titleText[summary.id] ?? summary.title}</p>
              <p className="mt-2 line-clamp-3 font-kanit text-[14px] leading-[22px] text-slateText">{descriptionText[summary.id] ?? summary.description}</p>
            </div>
            <div className="shrink-0">
              <Badge tone={summary.tone}>{translateStatus(summary.status)}</Badge>
            </div>
          </div>

          <p className="mt-4 font-kanit text-[24px] font-semibold leading-8 tracking-[-0.01em] text-ink">{translateMetric(summary.metric)}</p>

          <div className="mt-auto pt-5">
            <ProgressBar value={summary.progress} showLabel color={summary.tone === 'gold' ? '#F59E0B' : undefined} />
            <button
              type="button"
              aria-label={`Open ${summary.title}`}
              onClick={() => {
                if (summary.id === 'finance') lockFinance();
                setActivePage(summary.id);
              }}
              className="mt-4 inline-flex items-center gap-1 font-kanit text-[14px] font-medium leading-5 text-primary hover:text-primary-hover"
            >
              เปิดหน้านี้ <ArrowUpRight size={15} />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
