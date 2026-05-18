export type PageKey = 'dashboard' | 'work' | 'habit' | 'learning' | 'finance' | 'journals' | 'trading' | 'backtest' | 'investment' | 'settings';

export interface DashboardKpi {
  id: string;
  label: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  helper: string;
  tone: 'green' | 'blue' | 'orange' | 'purple' | 'red' | 'gold';
}

export interface ModuleSummary {
  id: PageKey;
  title: string;
  description: string;
  metric: string;
  status: string;
  progress: number;
  tone: 'green' | 'blue' | 'orange' | 'purple' | 'red' | 'gold';
}
