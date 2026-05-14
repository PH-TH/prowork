import { useMemo } from 'react';
import { Card } from '../ui/Card';
import { useWork } from '../../hooks/useWork';

export function PendingPriorityChart() {
  const { tasks } = useWork();
  const data = useMemo(() => {
    const openTasks = tasks.filter((task) => task.status !== 'Done');
    return [
      { label: 'High', value: openTasks.filter((task) => task.priority === 'High' || task.priority === 'Critical').length, color: '#EF4444' },
      { label: 'Medium', value: openTasks.filter((task) => task.priority === 'Medium').length, color: '#F59E0B' },
      { label: 'Low', value: openTasks.filter((task) => task.priority === 'Low').length, color: '#16A34A' },
    ];
  }, [tasks]);
  const maxValue = Math.max(1, ...data.map((item) => item.value));

  return (
    <Card hover={false} className="h-[258px] p-5">
      <p className="font-data text-[14px] font-bold leading-5 text-ink">Pending Tasks by Priority</p>
      <div className="mt-9 space-y-6">
        {data.map((item) => (
          <div key={item.label} className="grid grid-cols-[58px_1fr_20px] items-center gap-3">
            <span className="font-data text-[12px] font-medium leading-5 text-slateText">{item.label}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: item.color }} />
            </div>
            <span className="font-data text-[12px] font-bold text-ink">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-6 border-t border-border pt-2 text-caption-ui">
        {[0, 2, 4, 6, 8, 10].map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </Card>
  );
}
