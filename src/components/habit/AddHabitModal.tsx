import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { habitFormSchema, type HabitFormValues } from '../../forms/habitFormSchema';
import { HABIT_CATEGORIES, HABIT_FREQUENCIES } from '../../lib/constants';
import { useAppStore } from '../../stores/appStore';
import { useHabitStore } from '../../stores/habitStore';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Toggle } from '../ui/Toggle';

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddHabitModal({ open, onClose }: AddHabitModalProps) {
  const addHabit = useHabitStore((state) => state.addHabit);
  const addToast = useAppStore((state) => state.addToast);
  const { register, handleSubmit, setValue, watch, reset } = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: '',
      category: 'Health',
      frequency: 'Daily',
      startDate: '2026-05-04',
      reminderTime: '08:00',
      targetValue: 1,
      unit: 'day',
      color: '#16A34A',
      icon: 'Activity',
      remark: '',
      isActive: true,
    },
  });

  const submit = ({ remark: _remark, ...values }: HabitFormValues) => {
    addHabit(values);
    addToast({ title: 'Saved successfully', description: 'Habit added to your checklist.' });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Habit"
      subtitle="Define the behavior, target, reminder, and review context."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="add-habit-form" icon={<Plus size={16} />}>Save Habit</Button>
        </div>
      }
    >
      <form id="add-habit-form" onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2">
        <Input label="Habit Name" placeholder="Morning walk" {...register('name')} />
        <Select label="Category" options={HABIT_CATEGORIES} {...register('category')} />
        <Select label="Frequency" options={HABIT_FREQUENCIES} {...register('frequency')} />
        <DatePicker label="Start Date" {...register('startDate')} />
        <Input label="Reminder Time" type="time" {...register('reminderTime')} />
        <Input label="Target Value" type="number" {...register('targetValue')} />
        <Select label="Unit" options={['minutes', 'pages', 'ml', 'hours', 'day', 'sessions']} {...register('unit')} />
        <Input label="Color" type="color" className="h-11 p-1" {...register('color')} />
        <Select label="Icon" options={['Activity', 'Brain', 'BookOpen', 'Droplets', 'Moon', 'Wallet']} {...register('icon')} />
        <div>
          <Toggle checked={watch('isActive')} onChange={(value) => setValue('isActive', value)} label="Active" />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Remark" placeholder="Why this habit matters, friction, or rule" {...register('remark')} />
        </div>
      </form>
    </Modal>
  );
}
