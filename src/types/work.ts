export type WorkTabType =
  | 'Estimator'
  | 'Part Price'
  | 'Manpower'
  | 'Project'
  | 'Product'
  | 'Samsung Member'
  | 'PLM Status'
  | 'Timeline';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Todo' | 'In Progress' | 'In Review' | 'Done' | 'Blocked' | 'Overdue';
export type ProjectStatus = 'Completed' | 'In Progress' | 'At Risk' | 'Overdue';

export interface WorkMember {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
}

export interface WorkProject {
  id: string;
  name: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: ProjectStatus;
  remark: string;
  color: string;
}

export interface WorkTask {
  id: string;
  title: string;
  projectId: string;
  tabType: WorkTabType;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  assigneeId: string;
  progress: number;
  remark: string;
}

export interface WorkScheduleItem {
  id: string;
  time: string;
  title: string;
  type: 'Meeting' | 'Review' | 'Follow-up' | 'Planning';
}

export interface PlmStatusRecord {
  id: string;
  plm: string;
  symptom: string;
  group: string;
  pic: string;
  status: string;
  model: string;
  requestDate: string;
  registerDate: string;
  confirmDate: string;
  channel: string;
  remark: string;
}
