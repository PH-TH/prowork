import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { workFormSchema, type WorkFormValues } from '../../forms/workFormSchema';
import { PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '../../lib/constants';
import { useAppStore } from '../../stores/appStore';
import { useWorkStore } from '../../stores/workStore';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { Textarea } from '../ui/Textarea';

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  taskId?: string | null;
}

const projectColors = ['#BFE8C7', '#AFC6FF', '#FDBA5B', '#F47E83', '#C4B5FD', '#67E8F9', '#FDE68A'];

export function AddTaskModal({ open, onClose, initialDate = '2026-05-04', taskId }: AddTaskModalProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const { projects, members, tasks, addProject, addTask, updateProject, updateTask, deleteTask } = useWorkStore();
  const addToast = useAppStore((state) => state.addToast);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<WorkFormValues>({
    resolver: zodResolver(workFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      projectId: projects[0]?.id,
      tabType: 'Project',
      priority: 'Medium',
      status: 'Todo',
      startDate: initialDate,
      dueDate: '2026-05-11',
      assigneeId: members[0]?.id,
      progress: 0,
      remark: '',
    },
  });
  const editingTask = taskId ? tasks.find((task) => task.id === taskId) : null;
  const editingProject = editingTask ? projects.find((project) => project.id === editingTask.projectId) : null;
  const isEditing = Boolean(editingTask);

  useEffect(() => {
    if (open) {
      setNewProjectName(editingProject?.name ?? '');
      reset({
        title: editingTask?.title ?? '',
        projectId: editingTask?.projectId ?? projects[0]?.id,
        tabType: 'Project',
        priority: editingTask?.priority ?? 'Medium',
        status: editingTask?.status ?? 'Todo',
        startDate: editingTask?.startDate ?? initialDate,
        dueDate: editingTask?.dueDate ?? initialDate,
        assigneeId: editingTask?.assigneeId ?? members[0]?.id,
        progress: editingTask?.progress ?? 0,
        remark: editingTask?.remark ?? '',
      });
    }
  }, [editingProject?.name, editingTask, initialDate, members, open, projects, reset]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose, open]);

  const submit = (values: WorkFormValues) => {
    const ownerId = members[0]?.id ?? 'member-1';
    const projectName = newProjectName.trim();

    if (isEditing && editingTask && editingProject) {
      updateProject(editingProject.id, {
        name: projectName || editingProject.name,
        ownerId,
        startDate: values.startDate,
        endDate: values.dueDate,
        progress: Number(values.progress),
        status: projectStatusFromTask(values.status, values.priority),
        remark: values.remark || values.title,
      });

      updateTask(editingTask.id, {
        ...values,
        projectId: editingProject.id,
        tabType: 'Project',
        assigneeId: ownerId,
        progress: Number(values.progress),
        remark: values.remark ?? '',
      });
    } else {
      const projectId = projectName
        ? addProject({
            name: projectName,
            ownerId,
            startDate: values.startDate,
            endDate: values.dueDate,
            progress: Number(values.progress),
            status: projectStatusFromTask(values.status, values.priority),
            remark: values.remark || values.title,
            color: projectColors[projects.length % projectColors.length],
          })
        : values.projectId;

      addTask({
        ...values,
        projectId,
        tabType: 'Project',
        assigneeId: ownerId,
        progress: Number(values.progress),
        remark: values.remark ?? '',
      });
    }

    addToast({
      title: 'Saved successfully',
      description: isEditing ? 'อัปเดตงานนี้เรียบร้อยแล้ว' : projectName ? 'เพิ่มโปรเจกต์และงานใหม่เรียบร้อยแล้ว' : 'เพิ่มงานใหม่เรียบร้อยแล้ว',
    });
    onClose();
  };

  const showInvalidToast = (invalidErrors: typeof errors) => {
    const firstError = invalidErrors.title?.message
      ?? invalidErrors.startDate?.message
      ?? invalidErrors.dueDate?.message
      ?? invalidErrors.projectId?.message
      ?? 'กรุณากรอกข้อมูลที่จำเป็นให้ครบก่อนบันทึก';
    addToast({ title: 'Unable to save task', description: firstError, type: 'warning' });
  };

  const handleDelete = () => {
    if (!editingTask) return;
    deleteTask(editingTask.id);
    addToast({ title: 'Deleted successfully', description: 'ลบงานออกจาก Timeline และ Calendar แล้ว' });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Add Task'}
      subtitle={isEditing ? 'แก้ไขหรือลบงานนี้ แล้วอัปเดต Timeline และ Calendar ให้สัมพันธ์กัน' : 'สร้างงานใหม่และเชื่อมกับโปรเจกต์ เพื่อให้แสดงบน Timeline และ Calendar'}
      footer={
        <div className="flex justify-between gap-2 font-data">
          <div>
            {isEditing ? <Button type="button" variant="outline" onClick={handleDelete} icon={<Trash2 size={16} />}>Delete</Button> : null}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="add-task-form" icon={<Plus size={16} />}>{isEditing ? 'Save Changes' : 'Save Task'}</Button>
          </div>
        </div>
      }
    >
      <form id="add-task-form" onSubmit={handleSubmit(submit, showInvalidToast)} className="grid gap-4 font-data md:grid-cols-2">
        <div>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                label="Task Title"
                placeholder="ชื่องาน"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          />
          {errors.title ? (
            <p className="mt-1.5 flex items-center gap-1 text-caption-ui text-red-600"><TriangleAlert size={13} />{errors.title.message}</p>
          ) : null}
        </div>
        <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <Select
                label="Project"
                options={projects.map((project) => ({ label: project.name, value: project.id }))}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          />
          <Input
            label="Project Name"
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
            placeholder="พิมพ์ชื่อโปรเจกต์ใหม่"
          />
        </div>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Status"
              options={TASK_STATUS_OPTIONS}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Start Date"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Due Date"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
        <div className="md:col-span-2">
          <Controller
            name="progress"
            control={control}
            render={({ field }) => (
              <Slider
                label="Progress"
                min={0}
                max={100}
                value={Number(field.value ?? 0)}
                onChange={(event) => field.onChange(Number(event.target.value))}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          />
        </div>
        <div className="md:col-span-2">
          <Controller
            name="remark"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Remark"
                placeholder="บริบท อุปสรรค หรือสิ่งที่ต้องทำต่อ"
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          />
        </div>
      </form>
    </Modal>
  );
}

function projectStatusFromTask(status: WorkFormValues['status'], priority: WorkFormValues['priority']) {
  if (status === 'Done') return 'Completed';
  if (status === 'Overdue' || status === 'Blocked') return 'Overdue';
  if (priority === 'High' || priority === 'Critical' || status === 'In Review') return 'At Risk';
  return 'In Progress';
}
