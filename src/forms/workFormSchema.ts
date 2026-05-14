import { z } from 'zod';
import { PRIORITY_OPTIONS, TASK_STATUS_OPTIONS, WORK_TAB_TYPES } from '../lib/constants';

export const workFormSchema = z.object({
  title: z.string().min(2, 'กรุณากรอกชื่องานอย่างน้อย 2 ตัวอักษร'),
  projectId: z.string().min(1, 'กรุณาเลือกโปรเจกต์หรือสร้างโปรเจกต์ใหม่'),
  tabType: z.enum(WORK_TAB_TYPES).default('Project'),
  priority: z.enum(PRIORITY_OPTIONS),
  status: z.enum(TASK_STATUS_OPTIONS),
  startDate: z.string().min(1, 'กรุณาเลือกวันเริ่มต้น'),
  dueDate: z.string().min(1, 'กรุณาเลือกวันครบกำหนด'),
  assigneeId: z.string().default('member-1'),
  progress: z.coerce.number().min(0).max(100),
  remark: z.string().optional().default(''),
});

export type WorkFormValues = z.infer<typeof workFormSchema>;
