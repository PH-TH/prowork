import { z } from 'zod';
import { FINANCE_FREQUENCIES, FINANCE_RECORD_TYPES } from '../lib/constants';

export const financeFormSchema = z.object({
  recordType: z.enum(FINANCE_RECORD_TYPES),
  walletId: z.string().min(1),
  accountType: z.string().min(1),
  date: z.string().min(1),
  amount: z.coerce.number().min(1),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  remark: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  isRecurring: z.boolean().default(false),
  frequency: z.enum(FINANCE_FREQUENCIES),
  nextBillingDate: z.string().optional(),
  serviceName: z.string().optional(),
  planType: z.string().optional(),
  autoRenew: z.boolean().default(false),
});

export type FinanceFormValues = z.infer<typeof financeFormSchema>;
