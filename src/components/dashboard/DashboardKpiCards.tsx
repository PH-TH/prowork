import { Archive, BookOpen, CheckCircle2, CircleDollarSign, Flame, ListTodo, PenLine, TrendingUp } from 'lucide-react';
import { KpiCard } from '../ui/Card';
import { useDashboard } from '../../hooks/useDashboard';

const iconMap = [ListTodo, CheckCircle2, Flame, BookOpen, CircleDollarSign, PenLine, TrendingUp, Archive];

const helperText: Record<string, string> = {
  'today-tasks': 'รายการที่ติดขัดหรือเกินกำหนด',
  'task-completion': 'งานที่ยังต้องปิดให้เสร็จ',
  'habit-completion': 'นิสัยที่เปิดใช้งานอยู่',
  'learning-today': 'session การเรียนที่บันทึกไว้',
  'fire-progress': 'ค่า subscription สะสมปีนี้',
  'journals-done': 'หัวข้อ reflection ที่ทำครบวันนี้',
  'trading-net-r': 'อัตราชนะจากสมุดเทรด',
  'backtest-edge': 'ระบบที่ผ่านการ validate แล้ว',
};

export function DashboardKpiCards() {
  const { kpis } = useDashboard();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => {
        const Icon = iconMap[index] ?? ListTodo;
        return <KpiCard key={kpi.id} {...kpi} helper={helperText[kpi.id] ?? kpi.helper} icon={<Icon size={20} />} />;
      })}
    </div>
  );
}
