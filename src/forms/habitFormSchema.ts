import { z } from 'zod';
import { HABIT_CATEGORIES, HABIT_FREQUENCIES } from '../lib/constants';

export const habitFormSchema = z.object({
  name: z.string().min(2),
  category: z.enum(HABIT_CATEGORIES),
  frequency: z.enum(HABIT_FREQUENCIES),
  startDate: z.string().min(1),
  reminderTime: z.string().min(1),
  targetValue: z.coerce.number().min(1),
  unit: z.string().min(1),
  color: z.string().min(1),
  icon: z.string().min(1),
  remark: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type HabitFormValues = z.infer<typeof habitFormSchema>;
