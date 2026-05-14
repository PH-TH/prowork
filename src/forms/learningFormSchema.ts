import { z } from 'zod';
import { LEARNING_OUTPUT_TYPES, LEARNING_SESSION_TYPES } from '../lib/constants';

export const learningFormSchema = z.object({
  skillId: z.string().min(1),
  sessionType: z.enum(LEARNING_SESSION_TYPES),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  durationMinutes: z.coerce.number().min(1),
  energyBefore: z.coerce.number().min(1).max(10),
  energyAfter: z.coerce.number().min(1).max(10),
  focusScore: z.coerce.number().min(1).max(10),
  outputType: z.enum(LEARNING_OUTPUT_TYPES),
  remark: z.string().optional().default(''),
});

export type LearningFormValues = z.infer<typeof learningFormSchema>;
