import { format, parseISO } from 'date-fns';
import { CheckCircle2, Clock3, ExternalLink, FileText, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useWorkStore } from '../../stores/workStore';

interface TodayScheduleProps {
  selectedDate: string;
}

const defaultSchedule = [
  { id: 'shift-start', time: '09:30 AM', title: 'Start Work', label: 'Office Shift', color: '#16A34A', icon: Users, done: true, remark: 'Clock in and review today focus.' },
  { id: 'bom-review', time: '10:30 AM', title: 'BOM Data Review', label: 'Project Meeting', color: '#3B82F6', icon: FileText, done: false, remark: 'Check missing SKU mapping.' },
  { id: 'plm-sync', time: '01:00 PM', title: 'PLM Mapping Sync', label: 'Focus Work', color: '#F59E0B', icon: FileText, done: false, remark: 'Confirm dependency owner.' },
  { id: 'vendor', time: '03:00 PM', title: 'Vendor Follow-up', label: 'External Call', color: '#EF4444', icon: ExternalLink, done: false, remark: 'Ask for ETA and escalation path.' },
  { id: 'samsung-reply', time: '06:00 PM', title: 'Reply Samsung Member', label: 'Samsung Member', color: '#8B5CF6', icon: Users, done: false, remark: 'Reply with status and next action.' },
  { id: 'shift-end', time: '06:30 PM', title: 'Finish Work', label: 'Close Shift', color: '#16A34A', icon: CheckCircle2, done: false, remark: 'Write end-of-day handoff.' },
];

export function TodaySchedule({ selectedDate }: TodayScheduleProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(defaultSchedule);
  const tasks = useWorkStore((state) => state.tasks);

  const hasActivity = useMemo(
    () => tasks.some((task) => task.startDate === selectedDate || task.dueDate === selectedDate),
    [selectedDate, tasks],
  );

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const updateStatus = (id: string, done: boolean) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, done } : item)));
  };

  const updateRemark = (id: string, remark: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, remark } : item)));
  };

  return (
    <>
      <Card hover={false} className="p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="font-data text-[14px] font-bold leading-5 text-ink">Today Schedule</p>
            <p className="font-data text-[12px] font-medium leading-5 text-slateText">{format(parseISO(selectedDate), 'MMM d, yyyy')}</p>
          </div>
          {hasActivity ? (
            <button type="button" onClick={() => setOpen(true)} className="font-data text-[12px] font-medium text-primary hover:text-primary-hover">View all</button>
          ) : null}
        </div>
        {hasActivity ? (
          <div className="relative space-y-6">
            <div className="absolute bottom-4 left-[86px] top-4 w-px bg-border" />
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="grid grid-cols-[72px_18px_1fr] items-start gap-3">
                  <div className="pt-0.5 font-data text-[12px] font-bold text-ink">{item.time}</div>
                  <span className="relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className="truncate font-data text-[14px] font-bold leading-5 text-ink">{item.title}</p>
                    <div className="mt-1 flex items-center gap-1.5 font-data text-[12px] font-medium text-slateText">
                      <Icon size={13} />
                      <span>{item.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white p-4 text-caption-ui">
            No schedule for this date yet.
          </div>
        )}
      </Card>
      <Modal
        open={open && hasActivity}
        onClose={() => setOpen(false)}
        title="Today Schedule"
          subtitle={`ตารางงานทั้งวันของวันที่ ${format(parseISO(selectedDate), 'MMM d, yyyy')} สามารถปรับสถานะและเพิ่ม Remark ได้ที่นี่`}
        size="full"
        footer={
          <div className="flex justify-end font-data">
            <Button variant="secondary" onClick={() => setOpen(false)} icon={<X size={16} />}>Close</Button>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="rounded-card border border-border bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="rounded-2xl p-3 text-white" style={{ backgroundColor: item.color }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-data text-[12px] font-bold text-primary">{item.time}</p>
                      <p className="mt-1 font-data text-[14px] font-bold leading-5 text-ink">{item.title}</p>
                      <p className="font-data text-[12px] font-medium leading-5 text-slateText">{item.label}</p>
                    </div>
                  </div>
                  <div className="flex rounded-xl border border-border bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, true)}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-data text-[12px] font-medium transition ${item.done ? 'bg-primary text-white' : 'text-slateText hover:bg-white'}`}
                    >
                      <CheckCircle2 size={14} /> Done
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, false)}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-data text-[12px] font-medium transition ${!item.done ? 'bg-orange-500 text-white' : 'text-slateText hover:bg-white'}`}
                    >
                      <Clock3 size={14} /> Pending
                    </button>
                  </div>
                </div>
                <label className="mt-5 block">
                  <span className="mb-2 block font-data text-[12px] font-medium text-ink">Remark</span>
                  <textarea
                    value={item.remark}
                    onChange={(event) => updateRemark(item.id, event.target.value)}
                    className="min-h-24 w-full resize-y rounded-control border border-border bg-slate-50 px-3 py-2.5 font-data text-[14px] font-medium leading-[22px] text-ink outline-none transition focus:border-primary-soft focus:bg-white"
                    placeholder="เพิ่ม Remark สำหรับรายการนี้"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
