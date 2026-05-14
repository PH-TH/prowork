import { AppShell } from './components/layout/AppShell';
import { BacktestPage } from './pages/BacktestPage';
import { DashboardPage } from './pages/DashboardPage';
import { FinancePage } from './pages/FinancePage';
import { HabitPage } from './pages/HabitPage';
import { JournalsPage } from './pages/JournalsPage';
import { LearningPage } from './pages/LearningPage';
import { SettingsPage } from './pages/SettingsPage';
import { TradingPage } from './pages/TradingPage';
import { WorkPage } from './pages/WorkPage';
import { useAppStore } from './stores/appStore';

const pages = {
  dashboard: <DashboardPage />,
  work: <WorkPage />,
  habit: <HabitPage />,
  learning: <LearningPage />,
  finance: <FinancePage />,
  journals: <JournalsPage />,
  trading: <TradingPage />,
  backtest: <BacktestPage />,
  settings: <SettingsPage />,
};

export default function App() {
  const activePage = useAppStore((state) => state.activePage);

  return <AppShell>{pages[activePage]}</AppShell>;
}
