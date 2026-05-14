import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { journalFormSchema, fixReasons, journalStatuses, journalTypes, type JournalFormValues } from '../../forms/journalFormSchema';
import { MOODS } from '../../lib/constants';
import { useAppStore } from '../../stores/appStore';
import { useJournalStore } from '../../stores/journalStore';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { DatePicker } from '../ui/DatePicker';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { MoodPicker } from '../ui/MoodPicker';
import { Select } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { Textarea } from '../ui/Textarea';

interface AddJournalModalProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
}

const defaultJournalValues = (date: string): JournalFormValues => ({
  date,
  subject: 'วันนี้เครียดอีกแล้ว',
  journalType: 'Daily Journal',
  status: 'Completed',
  mood: 'Calm',
  energyScore: 8,
  tags: 'calm, focus',
  keepDoing: 'Protected the first hour and finished one important item.',
  fixChecked: true,
  fixWhatHappened: 'Let one small admin task stay open too long.',
  fixReason: 'Poor Planning',
  fixActionTomorrow: 'Batch admin work into a 25-minute slot before lunch.',
  moneyGrowthToday: 'Reviewed one spending decision before buying.',
  moneyGrowthSkill: 'React / Web Dev',
  moneyGrowthResult30Days: 'A stronger portfolio and cleaner money habits.',
  oneBigMoveChecked: true,
  oneBigMoveText: 'Finish the most important follow-up before chat apps.',
  commitmentChecked: true,
  commitmentText: 'protect the first focused hour.',
  gratitude1: 'I kept one promise to myself.',
  gratitude2: 'I noticed progress.',
  gratitude3: 'I had enough energy to continue.',
  manifestFocus: 'A calm, healthy, financially free life.',
  manifestAffirmation: 'I build my future through clear systems and steady action.',
  manifestVisual: 'A clean dashboard showing work, money, learning, and health moving together.',
});

export function AddJournalModal({ open, onClose, initialDate = '2026-05-04' }: AddJournalModalProps) {
  const addEntry = useJournalStore((state) => state.addEntry);
  const addToast = useAppStore((state) => state.addToast);
  const { register, handleSubmit, watch, setValue, reset } = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: defaultJournalValues(initialDate),
  });

  useEffect(() => {
    if (open) {
      setValue('date', initialDate);
    }
  }, [initialDate, open, setValue]);

  const submit = ({ tags, ...values }: JournalFormValues) => {
    addEntry({ ...values, tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [] });
    addToast({ title: 'Saved successfully', description: 'Journal saved and reflected on the page.' });
    reset(defaultJournalValues(initialDate));
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Journal"
      subtitle="ใส่หัวเรื่องของวันนี้ แล้วบันทึกอารมณ์ สิ่งที่ต้องแก้ และโฟกัสของวันพรุ่งนี้"
      size="full"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="outline" type="button" onClick={() => addToast({ title: 'Draft prepared', description: 'Draft mode is mocked for now.' })}>Save Draft</Button>
          <Button type="submit" form="add-journal-form" icon={<Save size={16} />}>Save Journal</Button>
        </div>
      }
    >
      <form id="add-journal-form" onSubmit={handleSubmit(submit)} className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Section title="Basic Info">
            <div className="grid gap-4 md:grid-cols-3">
              <DatePicker key={initialDate} label="Journal Date" defaultValue={initialDate} {...register('date')} />
              <div className="md:col-span-2">
                <Input label="หัวเรื่อง" placeholder="เช่น วันนี้เครียดอีกแล้ว" {...register('subject')} />
              </div>
              <Select label="Journal Type" options={journalTypes} {...register('journalType')} />
              <Select label="Status" options={journalStatuses} {...register('status')} />
              <div className="md:col-span-2">
                <span className="mb-1.5 block text-label-ui">Mood</span>
                <MoodPicker value={watch('mood')} onChange={(mood) => setValue('mood', mood)} />
                <select className="sr-only" {...register('mood')}>
                  {MOODS.map((mood) => <option key={mood}>{mood}</option>)}
                </select>
              </div>
              <Slider label="Energy Score" min={1} max={10} value={watch('energyScore')} {...register('energyScore')} />
              <Input label="Tags" placeholder="calm, focus, money" {...register('tags')} />
            </div>
          </Section>

          <Section title="Keep Doing">
            <Textarea label="What worked today?" placeholder="Write the behavior you want to repeat." {...register('keepDoing')} />
          </Section>

          <Section title="Fix Honestly">
            <div className="grid gap-4 md:grid-cols-2">
              <Checkbox checked={watch('fixChecked')} onChange={(value) => setValue('fixChecked', value)} label="There is something to fix today" />
              <Select label="Main reason" options={fixReasons} {...register('fixReason')} />
              <Textarea label="What happened?" placeholder="Be specific without blaming yourself." {...register('fixWhatHappened')} />
              <Textarea label="Tomorrow action" placeholder="One practical correction for tomorrow." {...register('fixActionTomorrow')} />
            </div>
          </Section>

          <Section title="Money & Growth">
            <div className="grid gap-4 md:grid-cols-2">
              <Textarea label="How did I move closer to money today?" {...register('moneyGrowthToday')} />
              <Select label="Skill improved 1%" options={['English', 'AI', 'React / Web Dev', 'Data / Dashboard', 'Trading Review']} {...register('moneyGrowthSkill')} />
              <div className="md:col-span-2">
                <Textarea label="If I repeat this for 30 days, what changes?" {...register('moneyGrowthResult30Days')} />
              </div>
            </div>
          </Section>

          <Section title="One Big Move">
            <div className="grid gap-4 md:grid-cols-2">
              <Checkbox checked={watch('oneBigMoveChecked')} onChange={(value) => setValue('oneBigMoveChecked', value)} label="Use this as tomorrow focus" />
              <Input label="Tomorrow's one must-win action" {...register('oneBigMoveText')} />
            </div>
          </Section>

          <Section title="Commitment">
            <div className="grid gap-4 md:grid-cols-2">
              <Checkbox checked={watch('commitmentChecked')} onChange={(value) => setValue('commitmentChecked', value)} label="I confirm I will do this" />
              <Input label="Tomorrow I will..." {...register('commitmentText')} />
            </div>
            <p className="mt-3 rounded-2xl border border-red-100 bg-red-50 p-3 text-body-ui text-red-700">If I avoid it, I am avoiding the next version of myself.</p>
          </Section>

          <Section title="Gratitude">
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Gratitude Item 1" {...register('gratitude1')} />
              <Input label="Gratitude Item 2" {...register('gratitude2')} />
              <Input label="Gratitude Item 3" {...register('gratitude3')} />
            </div>
            <p className="mt-2 text-body-ui text-slateText">At least one item should be about yourself.</p>
          </Section>

          <Section title="Manifest">
            <div className="grid gap-4 md:grid-cols-2">
              <Textarea label="What am I attracting into life?" {...register('manifestFocus')} />
              <Input label="Today's affirmation" {...register('manifestAffirmation')} />
              <div className="md:col-span-2">
                <Textarea label="Life visual I am building" {...register('manifestVisual')} />
              </div>
            </div>
          </Section>
        </div>

        <aside className="rounded-card border border-border bg-slate-50 p-5">
          <p className="text-card-title">Field Help</p>
          <div className="mt-4 space-y-3 text-body-ui text-slateText">
            <p><b className="text-ink">หัวเรื่อง</b>: สรุปความรู้สึกหรือประเด็นสำคัญของวันนั้นให้เห็นใน Calendar.</p>
            <p><b className="text-ink">Dropdown</b>: controlled categories for clean reports.</p>
            <p><b className="text-ink">Mood Picker</b>: one emotional state for trend charts.</p>
            <p><b className="text-ink">Slider</b>: energy score from 1 to 10.</p>
            <p><b className="text-ink">Text Area</b>: honest reflection with enough room.</p>
            <p><b className="text-ink">Checkbox</b>: deliberate commitment flags.</p>
          </div>
        </aside>
      </form>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-white p-5">
      <h3 className="mb-4 text-card-title">{title}</h3>
      {children}
    </section>
  );
}
