export type HabitCategory =
  | 'Health'
  | 'Mind'
  | 'Productivity'
  | 'Learning'
  | 'Finance'
  | 'Trading'
  | 'Lifestyle';

export type HabitFrequency = 'Daily' | 'Weekdays' | 'Weekly' | 'Specific Days' | 'Monthly';
export type HabitLogStatus = 'No Data' | 'Missed' | 'Partial' | 'Completed' | 'Perfect';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetValue: number;
  unit: string;
  startDate: string;
  reminderTime: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  status: HabitLogStatus;
  value: number;
  remark: string;
}

export interface HabitReminder {
  id: string;
  habitId: string;
  time: string;
  label: string;
}
