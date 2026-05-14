import { dailyFocusItems, dashboardKpis, encouragementMessages, moduleSummaries } from '../data/mockDashboard';

export const dashboardService = {
  getKpis: () => dashboardKpis,
  getModuleSummaries: () => moduleSummaries,
  getEncouragement: () => encouragementMessages[new Date('2026-05-04').getDate() % encouragementMessages.length],
  getFocusItems: () => dailyFocusItems,
};
