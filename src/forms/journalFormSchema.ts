import { z } from 'zod';
import { MOODS } from '../lib/constants';

export const journalTypes = ['Daily Journal', 'Self Growth', 'Emotion Check-in', 'Manifest', 'Reflection'] as const;
export const journalStatuses = ['Draft', 'Completed'] as const;
export const fixReasons = ['System', 'Emotion', 'Procrastination', 'Poor Planning', 'Lost Focus', 'Low Energy'] as const;

export const journalFormSchema = z.object({
  date: z.string().min(1),
  subject: z.string().min(1).default('Today I noticed my real state.'),
  journalType: z.enum(journalTypes),
  status: z.enum(journalStatuses),
  mood: z.enum(MOODS),
  energyScore: z.coerce.number().min(1).max(10),
  tags: z.string().optional().default(''),
  keepDoing: z.string().optional().default(''),
  fixChecked: z.boolean().default(false),
  fixWhatHappened: z.string().optional().default(''),
  fixReason: z.enum(fixReasons),
  fixActionTomorrow: z.string().optional().default(''),
  moneyGrowthToday: z.string().optional().default(''),
  moneyGrowthSkill: z.string().optional().default('React / Web Dev'),
  moneyGrowthResult30Days: z.string().optional().default(''),
  oneBigMoveChecked: z.boolean().default(false),
  oneBigMoveText: z.string().optional().default(''),
  commitmentChecked: z.boolean().default(false),
  commitmentText: z.string().optional().default(''),
  gratitude1: z.string().optional().default(''),
  gratitude2: z.string().optional().default(''),
  gratitude3: z.string().optional().default(''),
  manifestFocus: z.string().optional().default(''),
  manifestAffirmation: z.string().optional().default(''),
  manifestVisual: z.string().optional().default(''),
});

export type JournalFormValues = z.infer<typeof journalFormSchema>;
