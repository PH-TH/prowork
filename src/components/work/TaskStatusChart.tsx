import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Clock3, Eye, ListChecks, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { useWork } from '../../hooks/useWork';

type StatusBucket = 'Completed' | 'In Progress' | 'At Risk' | 'Overdue';

const statusColors: Record<StatusBucket, string> = {
  Completed: '#16A34A',
  'In Progress': '#3B82F6',
  'At Risk': '#F59E0B',
  Overdue: '#EF4444',
};

export function TaskStatusChart() {
  const [open, setOpen] = useState(false);
  const [activeBucket, setActiveBucket] = useState<StatusBucket>('Completed');
  const { tasks, projects, members } = useWork();
  const data = useMemo(() => {
    const total = Math.max(1, tasks.length);
    const buckets: Array<{ name: StatusBucket; value: number; color: string }> = [
      { name: 'Completed', value: tasks.filter((task) => task.status === 'Done').length, color: statusColors.Completed },
      { name: 'In Progress', value: tasks.filter((task) => ['Todo', 'In Progress', 'In Review'].includes(task.status)).length, color: statusColors['In Progress'] },
      { name: 'At Risk', value: tasks.filter((task) => task.status === 'Blocked').length, color: statusColors['At Risk'] },
      { name: 'Overdue', value: tasks.filter((task) => task.status === 'Overdue').length, color: statusColors.Overdue },
    ];
    return buckets.map((item) => ({ ...item, percent: `${Math.round((item.value / total) * 100)}%` }));
  }, [tasks]);
  const selectedTasks = tasks.filter((task) => {
    if (activeBucket === 'Completed') return task.status === 'Done';
    if (activeBucket === 'In Progress') return ['Todo', 'In Progress', 'In Review'].includes(task.status);
    if (activeBucket === 'At Risk') return task.status === 'Blocked';
    return task.status === 'Overdue';
  });
  const totalTasks = tasks.length;

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <>
      <Card hover={false} className="h-[258px] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-data text-[14px] font-bold leading-5 text-ink">Task Status</p>
          <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 font-data text-[12px] font-medium leading-5 text-primary hover:text-primary-hover">
            View all <Eye size={14} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-[140px_1fr] items-center gap-6">
          <div className="relative h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={43} outerRadius={68} paddingAngle={1} stroke="none" animationDuration={750}>
                  {data.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-data text-[12px] font-medium text-slateText">Total</span>
              <span className="font-data text-2xl font-extrabold tracking-[-0.03em] text-ink">{totalTasks}</span>
            </div>
          </div>
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.name} className="grid grid-cols-[10px_1fr_auto] items-center gap-2 font-data text-[12px] font-medium leading-5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slateText">{item.name}</span>
                <span className="font-data font-bold text-ink">{item.value} ({item.percent})</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Task Status"
        subtitle="ดูข้อมูลงานทั้งหมดตามสถานะ รวมถึงงานที่เสร็จแล้ว"
        size="xl"
        footer={
          <div className="flex justify-end font-data">
            <Button variant="secondary" onClick={() => setOpen(false)} icon={<X size={16} />}>Close</Button>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-4">
          {data.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setActiveBucket(item.name)}
              className={`rounded-card border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lift ${
                activeBucket === item.name ? 'border-primary-soft bg-primary-pale' : 'border-border bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <p className="font-data text-[14px] font-bold leading-5 text-ink">{item.name}</p>
              </div>
              <p className="mt-3 font-data text-[32px] font-extrabold leading-10 tracking-[-0.03em] text-ink">{item.value}</p>
                  <p className="font-kanit text-[12px] font-normal leading-5 text-slateText">{item.percent} ของงานทั้งหมด</p>
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.45fr]">
          <div className="rounded-card border border-primary-soft bg-primary-pale p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3" style={{ color: statusColors[activeBucket] }}><ListChecks size={20} /></div>
              <div>
                <p className="font-data text-[14px] font-bold leading-5 text-ink">{activeBucket} Tasks</p>
              <p className="font-kanit text-[12px] font-normal leading-5 text-slateText">คลิกการ์ดสถานะด้านบนเพื่อดูรายการงานของสถานะนั้น</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {selectedTasks.length ? selectedTasks.map((task) => {
                const project = projects.find((item) => item.id === task.projectId);
                return (
                  <div key={task.id} className="rounded-2xl border border-primary-soft bg-white p-4">
                    <p className="font-data text-[14px] font-bold leading-5 text-ink">{task.title}</p>
                    <p className="mt-1 font-data text-[12px] font-medium text-slateText">{project?.name} - {task.tabType}</p>
                    <div className="mt-3"><ProgressBar value={task.progress} /></div>
                  </div>
                );
              }) : (
                <div className="rounded-2xl border border-primary-soft bg-white p-4 text-body-ui text-slateText">No tasks in this status yet.</div>
              )}
            </div>
          </div>
          <div className="rounded-card border border-border bg-white p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slateText"><ListChecks size={20} /></div>
              <div>
                <p className="font-data text-[14px] font-bold leading-5 text-ink">All Task Details</p>
              <p className="font-kanit text-[12px] font-normal leading-5 text-slateText">แสดงสถานะ ผู้รับผิดชอบ โปรเจกต์ และความคืบหน้า</p>
              </div>
            </div>
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {tasks.map((task) => {
                const project = projects.find((item) => item.id === task.projectId);
                const member = members.find((item) => item.id === task.assigneeId);
                const tone = task.status === 'Done' ? 'green' : task.status === 'Overdue' || task.status === 'Blocked' ? 'red' : 'blue';
                return (
                  <div key={task.id} className="grid gap-3 rounded-2xl border border-border bg-slate-50 p-4 md:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-data text-[14px] font-bold leading-5 text-ink">{task.title}</p>
                      <p className="mt-1 font-data text-[12px] font-medium text-slateText">{project?.name} - {member?.name} - Due {task.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={tone}>{task.status}</Badge>
                      <span className="inline-flex items-center gap-1 text-caption-ui"><Clock3 size={13} />{task.progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
