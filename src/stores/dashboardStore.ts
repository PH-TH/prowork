import { create } from 'zustand';
import { dashboardService } from '../services/dashboardService';
import type { DashboardKpi, ModuleSummary } from '../types/dashboard';

interface DashboardState {
  kpis: DashboardKpi[];
  summaries: ModuleSummary[];
  encouragement: { body: string; quote: string };
  focusItems: Array<{ id: string; label: string; module: string; priority: string }>;
}

export const useDashboardStore = create<DashboardState>(() => ({
  kpis: dashboardService.getKpis(),
  summaries: dashboardService.getModuleSummaries(),
  encouragement: dashboardService.getEncouragement(),
  focusItems: dashboardService.getFocusItems(),
}));
