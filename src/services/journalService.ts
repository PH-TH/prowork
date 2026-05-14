import { journalCategories, journalEntries, luckyColors, moodColors, weeklyEmotionTrend } from '../data/mockJournal';

export const journalService = {
  getEntries: () => journalEntries,
  getMoodColors: () => moodColors,
  getLuckyColors: () => luckyColors,
  getCategories: () => journalCategories,
  getWeeklyEmotionTrend: () => weeklyEmotionTrend,
};
