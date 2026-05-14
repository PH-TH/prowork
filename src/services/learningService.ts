import { learningPrinciples, learningSessions, learningSkills, monthlyLearningPlans, weeklyTemplate } from '../data/mockLearning';

export const learningService = {
  getSkills: () => learningSkills,
  getSessions: () => learningSessions,
  getMonthlyPlans: () => monthlyLearningPlans,
  getWeeklyTemplate: () => weeklyTemplate,
  getPrinciples: () => learningPrinciples,
};
