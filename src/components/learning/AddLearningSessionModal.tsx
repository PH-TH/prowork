import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { learningFormSchema, type LearningFormValues } from '../../forms/learningFormSchema';
import { LEARNING_OUTPUT_TYPES, LEARNING_SESSION_TYPES } from '../../lib/constants';
import { useAppStore } from '../../stores/appStore';
import { useLearningStore } from '../../stores/learningStore';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { Textarea } from '../ui/Textarea';

interface AddLearningSessionModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddLearningSessionModal({ open, onClose }: AddLearningSessionModalProps) {
  const { skills, addSession } = useLearningStore();
  const addToast = useAppStore((state) => state.addToast);
  const { register, handleSubmit, watch, reset } = useForm<LearningFormValues>({
    resolver: zodResolver(learningFormSchema),
    defaultValues: {
      skillId: skills[0]?.id,
      sessionType: 'Learn',
      date: '2026-05-04',
      startTime: '07:00',
      endTime: '07:45',
      durationMinutes: 45,
      energyBefore: 7,
      energyAfter: 8,
      focusScore: 8,
      outputType: 'Note',
      remark: '',
    },
  });

  const submit = (values: LearningFormValues) => {
    addSession({ ...values, remark: values.remark ?? '' });
    addToast({ title: 'Saved successfully', description: 'Learning session logged.' });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Learning Session"
      subtitle="Track skill, focus, output, and energy."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="add-learning-form" icon={<Plus size={16} />}>Save Session</Button>
        </div>
      }
    >
      <form id="add-learning-form" onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2">
        <Select label="Skill Category" options={skills.map((skill) => ({ label: skill.name, value: skill.id }))} {...register('skillId')} />
        <Select label="Session Type" options={LEARNING_SESSION_TYPES} {...register('sessionType')} />
        <DatePicker label="Date" {...register('date')} />
        <Input label="Duration" type="number" {...register('durationMinutes')} />
        <Input label="Start Time" type="time" {...register('startTime')} />
        <Input label="End Time" type="time" {...register('endTime')} />
        <Slider label="Energy Before" min={1} max={10} value={watch('energyBefore')} {...register('energyBefore')} />
        <Slider label="Energy After" min={1} max={10} value={watch('energyAfter')} {...register('energyAfter')} />
        <Slider label="Focus Score" min={1} max={10} value={watch('focusScore')} {...register('focusScore')} />
        <Select label="Output Created" options={LEARNING_OUTPUT_TYPES} {...register('outputType')} />
        <div className="md:col-span-2">
          <Textarea label="Remark" placeholder="What did you learn, produce, or notice?" {...register('remark')} />
        </div>
      </form>
    </Modal>
  );
}
