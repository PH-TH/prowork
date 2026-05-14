export type JournalType = 'Daily Journal' | 'Self Growth' | 'Emotion Check-in' | 'Manifest' | 'Reflection';
export type JournalStatus = 'Draft' | 'Completed';
export type Mood = 'Calm' | 'Focused' | 'Grateful' | 'Stressed' | 'Tired' | 'Hopeful';
export type FixReason = 'System' | 'Emotion' | 'Procrastination' | 'Poor Planning' | 'Lost Focus' | 'Low Energy';

export interface JournalEntry {
  id: string;
  date: string;
  subject: string;
  journalType: JournalType;
  status: JournalStatus;
  mood: Mood;
  energyScore: number;
  tags: string[];
  keepDoing: string;
  fixChecked: boolean;
  fixWhatHappened: string;
  fixReason: FixReason;
  fixActionTomorrow: string;
  moneyGrowthToday: string;
  moneyGrowthSkill: string;
  moneyGrowthResult30Days: string;
  oneBigMoveChecked: boolean;
  oneBigMoveText: string;
  commitmentChecked: boolean;
  commitmentText: string;
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
  manifestFocus: string;
  manifestAffirmation: string;
  manifestVisual: string;
}

export interface LuckyColorSet {
  day: 'today' | 'tomorrow';
  colors: Array<{ name: string; hex: string }>;
}
