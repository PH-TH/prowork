import { CalendarDays, Plus } from 'lucide-react';
import { AiEncouragementCard } from '../components/dashboard/AiEncouragementCard';
import { DashboardCalendarPanel } from '../components/dashboard/DashboardCalendarPanel';
import { DailyFocusCard } from '../components/dashboard/DailyFocusCard';
import { DashboardKpiCards } from '../components/dashboard/DashboardKpiCards';
import { DashboardProgressCharts } from '../components/dashboard/DashboardProgressCharts';
import { DashboardSummaryCards } from '../components/dashboard/DashboardSummaryCards';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { DatePicker } from '../components/ui/DatePicker';
import { appToday, dateKey } from '../lib/date';
import { useAppStore } from '../stores/appStore';

export function DashboardPage() {
  const { dateFilter, setDateFilter, addToast } = useAppStore();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        subtitle="ศูนย์รวมภาพรวมของงาน นิสัย การเรียน การเงิน การเทรด และการพัฒนาตัวเองในที่เดียว"
        actions={
          <>
            <DatePicker value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="w-[170px]" aria-label="Dashboard date" />
            <Button variant="secondary" icon={<CalendarDays size={16} />} onClick={() => setDateFilter(dateKey(appToday))}>Today</Button>
            <Button icon={<Plus size={16} />} onClick={() => addToast({ title: 'บันทึกเรียบร้อย', description: 'เพิ่มรายการด่วนไว้ในระบบแล้ว' })}>เพิ่มด่วน</Button>
          </>
        }
      />
      <DashboardKpiCards />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <DashboardProgressCharts />
          <AiEncouragementCard />
          <DashboardSummaryCards />
        </div>
        <div className="space-y-4 xl:sticky xl:top-24">
          <DashboardCalendarPanel />
          <DailyFocusCard />
        </div>
      </div>
    </div>
  );
}
