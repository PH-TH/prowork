import { Activity, BarChart3, Brain, Target } from 'lucide-react';
import { BarChart } from '../../charts/BarChart';
import { DonutChart } from '../../charts/DonutChart';
import { LineChart } from '../../charts/LineChart';
import { habitCompletionRate, retirementProgress, workStats } from '../../lib/calculations';
import { useBacktest } from '../../hooks/useBacktest';
import { useTrading } from '../../hooks/useTrading';
import { useFinanceStore } from '../../stores/financeStore';
import { useHabitStore } from '../../stores/habitStore';
import { useJournalStore } from '../../stores/journalStore';
import { useLearningStore } from '../../stores/learningStore';
import { useWorkStore } from '../../stores/workStore';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function DashboardProgressCharts() {
  const work = useWorkStore();
  const habit = useHabitStore();
  const learning = useLearningStore();
  const finance = useFinanceStore();
  const journal = useJournalStore();
  const trading = useTrading();
  const backtest = useBacktest();

  const workProgress = workStats(work.tasks).progress;
  const habitProgress = habitCompletionRate(habit.logs);
  const learningProgress = clamp((learning.sessions.reduce((sum, session) => sum + session.durationMinutes, 0) / 900) * 100);
  const financeProgress = retirementProgress(finance.retirementPlan);
  const journalProgress = clamp((journal.entries.filter((entry) => entry.status === 'Completed').length / Math.max(1, journal.entries.length)) * 100);
  const tradingProgress = trading.disciplineScore;
  const backtestProgress = clamp((backtest.validatedCount / Math.max(1, backtest.sessions.length)) * 100);

  const momentumData = [
    { day: 'Mon', work: clamp(workProgress - 12), habit: clamp(habitProgress - 8), trading: clamp(tradingProgress - 10), backtest: clamp(backtestProgress - 6) },
    { day: 'Tue', work: clamp(workProgress - 8), habit: clamp(habitProgress - 5), trading: clamp(tradingProgress - 5), backtest: clamp(backtestProgress - 4) },
    { day: 'Wed', work: clamp(workProgress - 5), habit: clamp(habitProgress - 2), trading: clamp(tradingProgress - 2), backtest: clamp(backtestProgress - 2) },
    { day: 'Thu', work: clamp(workProgress - 2), habit: clamp(habitProgress + 1), trading: clamp(tradingProgress + 1), backtest: clamp(backtestProgress + 1) },
    { day: 'Fri', work: workProgress, habit: habitProgress, trading: tradingProgress, backtest: backtestProgress },
  ];

  const focusMix = [
    { name: 'Work', value: work.tasks.length, color: '#3B82F6' },
    { name: 'Habit', value: habit.habits.filter((item) => item.isActive).length, color: '#16A34A' },
    { name: 'Learning', value: learning.sessions.length, color: '#8B5CF6' },
    { name: 'Trading', value: trading.trades.length, color: '#F59E0B' },
    { name: 'Backtest', value: backtest.sessions.length, color: '#EF4444' },
  ];

  const moduleScores = [
    { module: 'Work', score: workProgress },
    { module: 'Habit', score: habitProgress },
    { module: 'Learning', score: learningProgress },
    { module: 'Finance', score: financeProgress },
    { module: 'Trading+', score: tradingProgress },
    { module: 'Backtest', score: backtestProgress },
  ];

  const insights = [
    {
      label: 'Focus Today',
      value: `${workStats(work.tasks).pending} pending work items`,
      helper: 'ควรเริ่มจากงานที่มีผลต่อ timeline ก่อน',
      tone: workStats(work.tasks).overdue ? 'red' : 'blue',
      progress: workProgress,
    },
    {
      label: 'Discipline Loop',
      value: `${trading.disciplineScore}% trading discipline`,
      helper: 'ใช้คู่กับ journal เพื่อดูว่าอารมณ์มีผลกับผลเทรดไหม',
      tone: trading.disciplineScore >= 80 ? 'green' : 'orange',
      progress: trading.disciplineScore,
    },
    {
      label: 'Edge Validation',
      value: `${backtest.validatedCount}/${backtest.sessions.length} systems validated`,
      helper: 'ระบบที่ผ่าน backtest แล้วค่อยนำไป forward test',
      tone: 'purple',
      progress: backtestProgress,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                <h2 className="text-section-title">Progress Momentum</h2>
              </div>
              <p className="text-page-subtitle-th">กราฟนี้ควรตอบว่า สัปดาห์นี้ระบบชีวิตกำลังดีขึ้นหรือเริ่มแผ่วลง</p>
            </div>
            <Badge tone="green">Weekly view</Badge>
          </div>
          <LineChart
            data={momentumData}
            lines={[
              { key: 'work', color: '#3B82F6', name: 'Work' },
              { key: 'habit', color: '#16A34A', name: 'Habit' },
              { key: 'trading', color: '#F59E0B', name: 'Trading' },
              { key: 'backtest', color: '#8B5CF6', name: 'Backtest' },
            ]}
            height={300}
          />
        </Card>

        <Card>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Target size={18} className="text-primary" />
                <h2 className="text-section-title">Focus Mix</h2>
              </div>
              <p className="text-page-subtitle-th">ดูสัดส่วนข้อมูลที่ระบบกำลังติดตามอยู่ในแต่ละหมวด</p>
            </div>
            <Badge tone="blue">Overview</Badge>
          </div>
          <DonutChart data={focusMix} height={260} />
          <div className="grid grid-cols-2 gap-2">
            {focusMix.map((item) => (
              <div key={item.name} className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-caption-ui">{item.name}</span>
                <span className="ml-auto font-inter text-[12px] font-bold text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                <h2 className="text-section-title">Module Health Score</h2>
              </div>
              <p className="text-page-subtitle-th">คะแนนรวมช่วยให้รู้ว่าเพจไหนต้องดูต่อเป็นพิเศษ</p>
            </div>
            <Badge tone="purple">0-100</Badge>
          </div>
          <BarChart data={moduleScores} xKey="module" barKey="score" color="#16A34A" height={300} />
        </Card>

        <Card>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Brain size={18} className="text-primary" />
                <h2 className="text-section-title">What To Improve Next</h2>
              </div>
              <p className="text-page-subtitle-th">สรุปสิ่งที่ควรดูต่อจากข้อมูลในทุกหน้า ไม่ใช่แค่ตัวเลขลอย ๆ</p>
            </div>
            <Badge tone="green">Actionable</Badge>
          </div>
          <div className="space-y-4">
            {insights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-card-title">{item.label}</p>
                    <p className="mt-1 font-inter text-[18px] font-extrabold leading-6 tracking-[-0.03em] text-slate-950">{item.value}</p>
                    <p className="mt-2 font-kanit text-[13px] leading-5 text-slate-500">{item.helper}</p>
                  </div>
                  <Badge tone={item.tone}>{item.progress}%</Badge>
                </div>
                <ProgressBar value={item.progress} className="mt-4" color={item.tone === 'red' ? '#EF4444' : item.tone === 'orange' ? '#F59E0B' : '#16A34A'} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
