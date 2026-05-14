import { create } from 'zustand';
import { journalService } from '../services/journalService';
import type { JournalEntry, LuckyColorSet, Mood } from '../types/journal';
import { uid } from '../lib/utils';

interface JournalState {
  entries: JournalEntry[];
  moodColors: Record<Mood, string>;
  luckyColors: LuckyColorSet[];
  categories: string[];
  weeklyEmotionTrend: Array<Record<string, number | string>>;
  addEntry: (entry: Omit<JournalEntry, 'id'>) => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: journalService.getEntries(),
  moodColors: journalService.getMoodColors(),
  luckyColors: journalService.getLuckyColors(),
  categories: journalService.getCategories(),
  weeklyEmotionTrend: journalService.getWeeklyEmotionTrend(),
  addEntry: (entry) => set((state) => ({ entries: [{ id: uid('journal'), ...entry }, ...state.entries] })),
}));
