import { create } from 'zustand';
import { learningService } from '../services/learningService';
import type { LearningSession, LearningSkill, MonthlyLearningPlan } from '../types/learning';
import { uid } from '../lib/utils';

interface LearningState {
  skills: LearningSkill[];
  sessions: LearningSession[];
  monthlyPlans: MonthlyLearningPlan[];
  activeMonth: MonthlyLearningPlan['month'];
  setActiveMonth: (month: MonthlyLearningPlan['month']) => void;
  addSession: (session: Omit<LearningSession, 'id'>) => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  skills: learningService.getSkills(),
  sessions: learningService.getSessions(),
  monthlyPlans: learningService.getMonthlyPlans(),
  activeMonth: 'May 2026',
  setActiveMonth: (activeMonth) => set({ activeMonth }),
  addSession: (session) =>
    set((state) => ({
      sessions: [{ id: uid('learn'), ...session }, ...state.sessions],
      skills: state.skills.map((skill) =>
        skill.id === session.skillId
          ? { ...skill, progress: Math.min(100, skill.progress + Math.max(1, Math.round(session.durationMinutes / 45))) }
          : skill,
      ),
    })),
}));
