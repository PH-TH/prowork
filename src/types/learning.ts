export type LearningSessionType =
  | 'Learn'
  | 'Practice'
  | 'Project'
  | 'Review'
  | 'Reading'
  | 'Backtest'
  | 'Prompt Testing';

export type LearningOutputType =
  | 'No Output'
  | 'Note'
  | 'Summary'
  | 'Prompt'
  | 'Code'
  | 'Dashboard'
  | 'Backtest Report'
  | 'Checklist'
  | 'Template';

export interface LearningSkill {
  id: string;
  name: string;
  color: string;
  progress: number;
  weeklyTargetHours: number;
}

export interface LearningSession {
  id: string;
  skillId: string;
  date: string;
  sessionType: LearningSessionType;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  energyBefore: number;
  energyAfter: number;
  focusScore: number;
  outputType: LearningOutputType;
  remark: string;
}

export interface LearningCalendarChip {
  id: string;
  date: string;
  label: string;
  time: string;
  type: 'Learning' | 'Work' | 'Trading' | 'Review';
}

export interface MonthlyLearningPlan {
  month: 'May 2026' | 'June 2026';
  workShift: string;
  weekdayLearning: string;
  retrievalBlock?: string;
  weekendDeepLearning: string;
  weeklyTarget: string;
  chips: LearningCalendarChip[];
}
