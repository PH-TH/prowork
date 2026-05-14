import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddTaskModal } from '../components/work/AddTaskModal';
import { PendingPriorityChart } from '../components/work/PendingPriorityChart';
import { TaskStatusChart } from '../components/work/TaskStatusChart';
import { TodaySchedule } from '../components/work/TodaySchedule';
import { WorkCalendar } from '../components/work/WorkCalendar';
import { WorkKpiCards } from '../components/work/WorkKpiCards';
import { WorkTabs } from '../components/work/WorkTabs';
import { PageHeader } from '../components/layout/PageHeader';
import { RightPanel } from '../components/layout/RightPanel';
import { Button } from '../components/ui/Button';
import { DatePicker } from '../components/ui/DatePicker';
import { Input } from '../components/ui/Input';
import { useAppStore } from '../stores/appStore';
import { useWorkStore } from '../stores/workStore';

export function WorkPage() {
  const [open, setOpen] = useState(false);
  const [taskDate, setTaskDate] = useState('2026-05-04');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { dateFilter, setDateFilter } = useAppStore();
  const deleteTask = useWorkStore((state) => state.deleteTask);
  const addToast = useAppStore((state) => state.addToast);

  const openTaskForDate = (date: string) => {
    setEditingTaskId(null);
    setTaskDate(date);
    setDateFilter(date);
    setOpen(true);
  };

  const openTaskEditor = (taskId: string) => {
    setEditingTaskId(taskId);
    setOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    addToast({ title: 'Deleted successfully', description: 'ลบงานออกจาก Timeline และ Calendar แล้ว' });
  };

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Work"
        subtitle="จัดการงาน โปรเจกต์ ตารางเวลา ไทม์ไลน์ และข้อมูลปฏิบัติการในที่เดียว"
        actions={
          <>
            <DatePicker value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="w-[170px]" />
            <Input placeholder="ค้นหางาน..." className="w-[220px]" />
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                setTaskDate(dateFilter);
                setEditingTaskId(null);
                setOpen(true);
              }}
            >
              Add Task
            </Button>
          </>
        }
      />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <WorkKpiCards />
          <WorkTabs selectedDate={dateFilter} onEditTask={openTaskEditor} />
          <div className="grid gap-4 xl:grid-cols-2">
            <TaskStatusChart />
            <PendingPriorityChart />
          </div>
        </div>
        <RightPanel>
          <WorkCalendar
            selectedDate={dateFilter}
            onSelectDate={setDateFilter}
            onAddTask={openTaskForDate}
            onEditTask={openTaskEditor}
            onDeleteTask={handleDeleteTask}
          />
          <TodaySchedule selectedDate={dateFilter} />
        </RightPanel>
      </div>
      <AddTaskModal open={open} onClose={() => setOpen(false)} initialDate={taskDate} taskId={editingTaskId} />
    </div>
  );
}
