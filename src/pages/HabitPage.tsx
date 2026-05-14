import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddHabitModal } from '../components/habit/AddHabitModal';
import { HabitHeatmap } from '../components/habit/HabitHeatmap';
import { HabitKpiCards } from '../components/habit/HabitKpiCards';
import { HabitReminders } from '../components/habit/HabitReminders';
import { HabitTrendChart } from '../components/habit/HabitTrendChart';
import { StreakCard } from '../components/habit/StreakCard';
import { TodayHabitList } from '../components/habit/TodayHabitList';
import { PageHeader } from '../components/layout/PageHeader';
import { RightPanel } from '../components/layout/RightPanel';
import { Button } from '../components/ui/Button';
import { Dropdown } from '../components/ui/Dropdown';

export function HabitPage() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('All Habits');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Habit"
        subtitle="Track personal habits, streaks, completion rate, and reminders."
        actions={
          <>
            <Dropdown label="Filter" options={['All Habits', 'Health', 'Mind', 'Learning', 'Lifestyle']} value={filter} onChange={setFilter} />
            <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>Add Habit</Button>
          </>
        }
      />
      <HabitKpiCards />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <HabitHeatmap categoryFilter={filter} />
        <RightPanel>
          <HabitReminders categoryFilter={filter} />
        </RightPanel>
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        <TodayHabitList categoryFilter={filter} />
        <StreakCard />
        <HabitTrendChart />
      </div>
      <AddHabitModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
