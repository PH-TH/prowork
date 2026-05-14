import { BellRing } from 'lucide-react';
import { useHabit } from '../../hooks/useHabit';
import { Card } from '../ui/Card';

interface HabitRemindersProps {
  categoryFilter?: string;
}

export function HabitReminders({ categoryFilter = 'All Habits' }: HabitRemindersProps) {
  const { reminders, habits } = useHabit();
  const visibleReminders = reminders.filter((reminder) => {
    if (categoryFilter === 'All Habits') return true;
    const habit = habits.find((item) => item.id === reminder.habitId);
    return habit?.category === categoryFilter;
  });

  return (
    <Card hover={false}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-section-title">Upcoming Reminders</p>
          <p className="text-page-subtitle">Next habit nudges</p>
        </div>
        <BellRing className="text-primary" size={20} />
      </div>
      <div className="space-y-3">
        {visibleReminders.map((reminder) => (
          <div key={reminder.id} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 px-4 py-3">
            <span className="text-body-ui text-ink">{reminder.label}</span>
            <span className="font-inter text-[14px] font-bold leading-5 text-primary">{reminder.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
