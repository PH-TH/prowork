import type { LearningSession, LearningSkill, MonthlyLearningPlan } from '../types/learning';

export const learningSkills: LearningSkill[] = [
  { id: 'skill-english', name: 'English', color: '#16A34A', progress: 72, weeklyTargetHours: 2 },
  { id: 'skill-ai', name: 'AI', color: '#8B5CF6', progress: 66, weeklyTargetHours: 2 },
  { id: 'skill-react', name: 'React / Web Dev', color: '#3B82F6', progress: 58, weeklyTargetHours: 3 },
  { id: 'skill-data', name: 'Data / Dashboard', color: '#F59E0B', progress: 51, weeklyTargetHours: 2 },
  { id: 'skill-trading', name: 'Trading Review', color: '#EF4444', progress: 46, weeklyTargetHours: 1 },
];

const mayWeekdays = Array.from({ length: 31 }, (_, index) => index + 1).filter((day) => {
  const date = new Date(2026, 4, day);
  return date.getDay() !== 0 && date.getDay() !== 6;
});

const weekendDays = Array.from({ length: 31 }, (_, index) => index + 1).filter((day) => {
  const date = new Date(2026, 4, day);
  return date.getDay() === 0 || date.getDay() === 6;
});

export const monthlyLearningPlans: MonthlyLearningPlan[] = [
  {
    month: 'May 2026',
    workShift: '09:30-18:30',
    weekdayLearning: '07:00-07:45',
    weekendDeepLearning: 'Sat 09:00-12:00 / 14:00-16:00',
    weeklyTarget: '8-10 hrs',
    chips: [
      ...mayWeekdays.flatMap((day, index) => [
        {
          id: `may-learn-${day}`,
          date: `2026-05-${String(day).padStart(2, '0')}`,
          label: ['English', 'AI Prompt', 'React', 'Data', 'Review'][index % 5],
          time: '07:00',
          type: 'Learning' as const,
        },
        {
          id: `may-work-${day}`,
          date: `2026-05-${String(day).padStart(2, '0')}`,
          label: 'Work',
          time: '09:30',
          type: 'Work' as const,
        },
      ]),
      ...weekendDays.flatMap((day) => [
        {
          id: `may-deep-${day}`,
          date: `2026-05-${String(day).padStart(2, '0')}`,
          label: 'Deep Learning',
          time: '09:00',
          type: 'Learning' as const,
        },
        {
          id: `may-review-${day}`,
          date: `2026-05-${String(day).padStart(2, '0')}`,
          label: day % 2 ? 'Weekly Planning' : 'Project Build',
          time: '14:00',
          type: 'Review' as const,
        },
      ]),
    ],
  },
  {
    month: 'June 2026',
    workShift: '11:00-20:00',
    weekdayLearning: '07:30-08:30',
    retrievalBlock: '09:00-09:20',
    weekendDeepLearning: 'Sat 09:00-12:00 / Sun Review',
    weeklyTarget: '9-11 hrs',
    chips: Array.from({ length: 30 }, (_, index) => index + 1).flatMap((day) => {
      const date = new Date(2026, 5, day);
      const key = `2026-06-${String(day).padStart(2, '0')}`;
      if (date.getDay() === 0 || date.getDay() === 6) {
        return [
          { id: `jun-deep-${day}`, date: key, label: 'Build Project', time: '09:00', type: 'Learning' as const },
          { id: `jun-review-${day}`, date: key, label: 'Review', time: '16:00', type: 'Review' as const },
        ];
      }
      return [
        { id: `jun-learn-${day}`, date: key, label: 'Study', time: '07:30', type: 'Learning' as const },
        { id: `jun-retrieval-${day}`, date: key, label: 'Retrieval', time: '09:00', type: 'Review' as const },
        { id: `jun-work-${day}`, date: key, label: 'Work', time: '11:00', type: 'Work' as const },
      ];
    }),
  },
];

export const learningSessions: LearningSession[] = [
  {
    id: 'ls-1',
    skillId: 'skill-english',
    date: '2026-05-04',
    sessionType: 'Reading',
    startTime: '07:00',
    endTime: '07:45',
    durationMinutes: 45,
    energyBefore: 7,
    energyAfter: 8,
    focusScore: 8,
    outputType: 'Summary',
    remark: 'Read one article and captured five phrases.',
  },
  {
    id: 'ls-2',
    skillId: 'skill-ai',
    date: '2026-05-04',
    sessionType: 'Prompt Testing',
    startTime: '20:45',
    endTime: '21:30',
    durationMinutes: 45,
    energyBefore: 5,
    energyAfter: 6,
    focusScore: 7,
    outputType: 'Prompt',
    remark: 'Built one reusable planning prompt.',
  },
];

export const weeklyTemplate = [
  ['Monday', 'English Reading'],
  ['Tuesday', 'AI Prompt'],
  ['Wednesday', 'React / Web Dev'],
  ['Thursday', 'Data / Dashboard'],
  ['Friday', 'Review + Flashcard'],
  ['Saturday', 'Deep Learning + Project Build'],
  ['Sunday', 'Review + Weekly Planning'],
];

export const learningPrinciples = [
  'Spaced learning',
  'Retrieval practice',
  'Weekend deep work',
  'Light review before sleep',
  'Protect trading energy',
];
