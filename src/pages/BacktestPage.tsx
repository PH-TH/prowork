import { useMemo, useState } from 'react';
import { Archive, BarChart3, CheckCircle2, DatabaseZap, Gauge, Plus, ShieldAlert, TrendingUp } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, KpiCard } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { BarChart } from '../charts/BarChart';
import { DonutChart } from '../charts/DonutChart';
import { LineChart } from '../charts/LineChart';
import { useAppStore } from '../stores/appStore';
import { useBacktestStore } from '../stores/backtestStore';
import { useBacktest } from '../hooks/useBacktest';
import type { BacktestMarketCondition, BacktestStatus } from '../types/backtest';

const symbols = ['EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY', 'NAS100', 'US30'];
const strategies = ['Liquidity Sweep + BOS', 'Supply Rejection', 'Opening Range Failure', 'Range Fade', 'Breakout Retest'];
const timeframes = ['M1', 'M5', 'M15', 'H1', 'H4'];
const conditions: BacktestMarketCondition[] = ['Trending', 'Range', 'Breakout', 'News', 'Low Volatility'];
const statuses: BacktestStatus[] = ['Draft', 'In Review', 'Validated', 'Rejected'];
const directionOptions = [
  { label: 'Buy / Long', value: 'Long' },
  { label: 'Short / Sell', value: 'Short' },
];

const symbolClassMap: Record<string, string> = {
  EURUSD: 'border-blue-100 bg-blue-50 text-blue-700',
  GBPUSD: 'border-indigo-100 bg-indigo-50 text-indigo-700',
  XAUUSD: 'border-amber-100 bg-amber-50 text-amber-700',
  USDJPY: 'border-cyan-100 bg-cyan-50 text-cyan-700',
  NAS100: 'border-purple-100 bg-purple-50 text-purple-700',
  US30: 'border-orange-100 bg-orange-50 text-orange-700',
};

const strategyClassMap: Record<string, string> = {
  'Liquidity Sweep + BOS': 'border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700',
  'Supply Rejection': 'border-rose-100 bg-rose-50 text-rose-700',
  'Opening Range Failure': 'border-orange-100 bg-orange-50 text-orange-700',
  'Range Fade': 'border-cyan-100 bg-cyan-50 text-cyan-700',
  'Breakout Retest': 'border-blue-100 bg-blue-50 text-blue-700',
  'London sweep': 'border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700',
  'NY rejection': 'border-rose-100 bg-rose-50 text-rose-700',
  'Opening fail': 'border-orange-100 bg-orange-50 text-orange-700',
  'Asia fade': 'border-cyan-100 bg-cyan-50 text-cyan-700',
};

const strategyColorMap: Record<string, string> = {
  'Liquidity Sweep + BOS': '#D946EF',
  'Supply Rejection': '#F43F5E',
  'Opening Range Failure': '#F97316',
  'Range Fade': '#06B6D4',
  'Breakout Retest': '#3B82F6',
  'London sweep': '#D946EF',
  'NY rejection': '#F43F5E',
  'Opening fail': '#F97316',
  'Asia fade': '#06B6D4',
};

const initialSessionForm = {
  name: 'EURUSD London Sweep Batch',
  symbol: 'EURUSD',
  strategy: 'Liquidity Sweep + BOS',
  timeframe: 'M15',
  marketCondition: 'Trending' as BacktestMarketCondition,
  startDate: '2025-06-01',
  endDate: '2025-06-30',
  trades: '30',
  wins: '16',
  losses: '10',
  breakeven: '4',
  netR: '11.2',
  profitFactor: '1.54',
  expectancyR: '0.37',
  maxDrawdownR: '4.8',
  ruleAdherence: '84',
  status: 'In Review' as BacktestStatus,
  keyFinding: 'Best trades happen after liquidity sweep and clean displacement candle.',
  nextAction: 'Forward test only in London session with fixed 0.5% risk.',
};

const initialTradeForm = {
  sessionId: 'bt-ict-london-eu',
  index: '5',
  date: '2025-06-03',
  symbol: 'EURUSD',
  direction: 'Long' as 'Long' | 'Short',
  setup: 'London sweep',
  entryModel: 'BOS + FVG retrace',
  resultR: '1.8',
  mfeR: '2.4',
  maeR: '0.5',
  mistake: 'None',
  screenshotUrl: 'FX Replay 2025-06-03 EURUSD',
};

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function statusTone(status: BacktestStatus) {
  if (status === 'Validated') return 'green';
  if (status === 'In Review') return 'blue';
  if (status === 'Rejected') return 'red';
  return 'orange';
}

function directionLabel(direction: 'Long' | 'Short') {
  return direction === 'Long' ? 'Buy' : 'Short';
}

function directionChipClass(direction: 'Long' | 'Short') {
  return direction === 'Long'
    ? 'border-sky-100 bg-sky-50 text-sky-700'
    : 'border-red-100 bg-red-50 text-red-700';
}

function symbolChipClass(symbol: string) {
  return symbolClassMap[symbol] ?? 'border-slate-200 bg-slate-50 text-slate-700';
}

function strategyChipClass(strategy: string) {
  return strategyClassMap[strategy] ?? 'border-slate-200 bg-slate-50 text-slate-700';
}

function strategyColor(strategy: string) {
  return strategyColorMap[strategy] ?? '#64748B';
}

function mistakeChipClass(mistake: string) {
  if (mistake === 'None') return 'border-slate-200 bg-slate-50 text-slate-600';
  if (/early|before|late/i.test(mistake)) return 'border-orange-100 bg-orange-50 text-orange-700';
  if (/loss|drawdown|invalid|rejected/i.test(mistake)) return 'border-red-100 bg-red-50 text-red-700';
  return 'border-violet-100 bg-violet-50 text-violet-700';
}

export function BacktestPage() {
  const backtest = useBacktest();
  const { addSession, addTrade } = useBacktestStore();
  const addToast = useAppStore((state) => state.addToast);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState(initialSessionForm);
  const [tradeForm, setTradeForm] = useState(initialTradeForm);
  const [replayFilters, setReplayFilters] = useState({
    symbol: 'All',
    direction: 'All',
    result: 'All',
    sort: 'date-desc',
  });
  const [sessionFilters, setSessionFilters] = useState({
    symbol: 'All',
    status: 'All',
    strategy: 'All',
    sort: 'netR-desc',
  });

  const sessionOptions = useMemo(
    () => backtest.sessions.map((session) => ({ label: `${session.symbol} • ${session.strategy}`, value: session.id })),
    [backtest.sessions],
  );

  const kpis = [
    { label: 'Backtest Sessions', value: backtest.sessions.length, helper: 'จำนวนชุดทดสอบทั้งหมด', tone: 'purple', icon: <Archive size={20} /> },
    { label: 'Total Trades', value: backtest.totalTrades, helper: 'จำนวนไม้จากทุก session', tone: 'blue', icon: <DatabaseZap size={20} /> },
    { label: 'Win Rate', value: backtest.winRate, suffix: '%', helper: `${backtest.totalWins} wins / ${backtest.totalLosses} losses`, tone: 'green', icon: <CheckCircle2 size={20} /> },
    { label: 'Net R', value: backtest.totalNetR, suffix: 'R', helper: 'ผลรวม R จากทุกระบบ', tone: backtest.totalNetR >= 0 ? 'green' : 'red', icon: <TrendingUp size={20} /> },
    { label: 'Profit Factor', value: backtest.avgProfitFactor, helper: 'ค่าเฉลี่ยจากทุก session', tone: 'orange', icon: <Gauge size={20} /> },
    { label: 'Max DD', value: backtest.maxDrawdownR, suffix: 'R', helper: 'drawdown สูงสุดที่พบ', tone: 'red', icon: <ShieldAlert size={20} /> },
  ];

  const strategyBars = useMemo(
    () => backtest.strategyPerformance.map((item) => ({ strategy: item.strategy.slice(0, 18), netR: item.netR })),
    [backtest.strategyPerformance],
  );

  const replaySymbolOptions = useMemo(
    () => ['All', ...Array.from(new Set(backtest.trades.map((trade) => trade.symbol))).sort()],
    [backtest.trades],
  );

  const sessionSymbolOptions = useMemo(
    () => ['All', ...Array.from(new Set(backtest.sessions.map((session) => session.symbol))).sort()],
    [backtest.sessions],
  );

  const sessionStrategyOptions = useMemo(
    () => ['All', ...Array.from(new Set(backtest.sessions.map((session) => session.strategy))).sort()],
    [backtest.sessions],
  );

  const filteredReplayTrades = useMemo(() => {
    const rows = backtest.trades.filter((trade) => {
      const result = trade.resultR > 0 ? 'Win' : trade.resultR < 0 ? 'Loss' : 'BE';
      return (
        (replayFilters.symbol === 'All' || trade.symbol === replayFilters.symbol) &&
        (replayFilters.direction === 'All' || trade.direction === replayFilters.direction) &&
        (replayFilters.result === 'All' || result === replayFilters.result)
      );
    });

    return [...rows].sort((a, b) => {
      if (replayFilters.sort === 'date-asc') return a.date.localeCompare(b.date);
      if (replayFilters.sort === 'result-desc') return b.resultR - a.resultR;
      if (replayFilters.sort === 'result-asc') return a.resultR - b.resultR;
      if (replayFilters.sort === 'mfe-desc') return b.mfeR - a.mfeR;
      if (replayFilters.sort === 'mae-asc') return a.maeR - b.maeR;
      return b.date.localeCompare(a.date);
    });
  }, [backtest.trades, replayFilters]);

  const filteredSessions = useMemo(() => {
    const rows = backtest.sessions.filter(
      (session) =>
        (sessionFilters.symbol === 'All' || session.symbol === sessionFilters.symbol) &&
        (sessionFilters.status === 'All' || session.status === sessionFilters.status) &&
        (sessionFilters.strategy === 'All' || session.strategy === sessionFilters.strategy),
    );

    return [...rows].sort((a, b) => {
      if (sessionFilters.sort === 'netR-asc') return a.netR - b.netR;
      if (sessionFilters.sort === 'winRate-desc') {
        const aRate = a.trades ? a.wins / a.trades : 0;
        const bRate = b.trades ? b.wins / b.trades : 0;
        return bRate - aRate;
      }
      if (sessionFilters.sort === 'trades-desc') return b.trades - a.trades;
      if (sessionFilters.sort === 'start-desc') return b.startDate.localeCompare(a.startDate);
      return b.netR - a.netR;
    });
  }, [backtest.sessions, sessionFilters]);

  const saveSession = () => {
    if (!sessionForm.name.trim()) {
      addToast({ title: 'Backtest needs a name', description: 'Please add a session name before saving.', type: 'warning' });
      return;
    }

    addSession({
      name: sessionForm.name,
      symbol: sessionForm.symbol,
      strategy: sessionForm.strategy,
      timeframe: sessionForm.timeframe,
      marketCondition: sessionForm.marketCondition,
      startDate: sessionForm.startDate,
      endDate: sessionForm.endDate,
      trades: numberValue(sessionForm.trades),
      wins: numberValue(sessionForm.wins),
      losses: numberValue(sessionForm.losses),
      breakeven: numberValue(sessionForm.breakeven),
      netR: numberValue(sessionForm.netR),
      profitFactor: numberValue(sessionForm.profitFactor),
      expectancyR: numberValue(sessionForm.expectancyR),
      maxDrawdownR: numberValue(sessionForm.maxDrawdownR),
      ruleAdherence: numberValue(sessionForm.ruleAdherence),
      status: sessionForm.status,
      keyFinding: sessionForm.keyFinding,
      nextAction: sessionForm.nextAction,
    });
    setSessionModalOpen(false);
    setSessionForm(initialSessionForm);
    addToast({ title: 'Saved successfully', description: 'Backtest library and performance metrics updated.' });
  };

  const saveReplayTrade = () => {
    if (!tradeForm.sessionId) {
      addToast({ title: 'Replay trade needs a session', description: 'Please choose the related backtest session.', type: 'warning' });
      return;
    }

    addTrade({
      sessionId: tradeForm.sessionId,
      index: numberValue(tradeForm.index),
      date: tradeForm.date,
      symbol: tradeForm.symbol,
      direction: tradeForm.direction,
      setup: tradeForm.setup,
      entryModel: tradeForm.entryModel,
      resultR: numberValue(tradeForm.resultR),
      mfeR: numberValue(tradeForm.mfeR),
      maeR: numberValue(tradeForm.maeR),
      mistake: tradeForm.mistake,
      screenshotUrl: tradeForm.screenshotUrl,
    });
    setTradeModalOpen(false);
    setTradeForm(initialTradeForm);
    addToast({ title: 'Saved successfully', description: 'FX Replay trade log updated.' });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Backtest"
        subtitle="คลัง Backtest แบบ FX Replay สำหรับวัด edge, performance, drawdown, mistake และแผนปรับปรุงก่อนใช้เงินจริง"
        actions={
          <>
            <Button variant="secondary" icon={<Plus size={16} />} onClick={() => setTradeModalOpen(true)}>Add Replay Trade</Button>
            <Button icon={<Plus size={16} />} onClick={() => setSessionModalOpen(true)}>Add Backtest</Button>
          </>
        }
      />

      <section className="grid gap-3 xl:grid-cols-3">
        {[
          {
            title: 'Research Lab',
            text: 'Backtest ควรเป็นพื้นที่ทดลองระบบ ไม่ใช่สมุดเทรดจริง จึงเน้น sample size, rule adherence, MFE/MAE และ market condition',
            icon: <DatabaseZap size={18} />,
            className: 'from-sky-500 via-blue-500 to-indigo-500',
          },
          {
            title: 'Forward-Test Gate',
            text: 'ใช้ตัดสินว่ากลยุทธ์พร้อมย้ายไป Trading+ หรือยัง โดยดู Validated, Profit Factor, Expectancy และ Max DD',
            icon: <ShieldAlert size={18} />,
            className: 'from-emerald-500 via-green-500 to-teal-500',
          },
          {
            title: 'Trading+ Sibling',
            text: 'หน้าตาควรคล้าย Trading+ เพื่ออ่านง่าย แต่ข้อมูลต้องแยกกัน: Backtest คือหลักฐานของ edge, Trading+ คือผลเงินจริง',
            icon: <BarChart3 size={18} />,
            className: 'from-violet-500 via-purple-500 to-fuchsia-500',
          },
        ].map((item) => (
          <div key={item.title} className={`relative overflow-hidden rounded-[22px] border border-white/25 bg-gradient-to-br ${item.className} p-5 text-white shadow-[0_18px_44px_rgba(15,23,42,0.14)]`}>
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full border border-white/25" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur">{item.icon}</span>
            <h2 className="relative mt-4 font-inter text-[18px] font-extrabold leading-6 text-white">{item.title}</h2>
            <p className="relative mt-2 font-kanit text-[13px] leading-6 text-white/84">{item.text}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-section-title">R-Multiple Performance Curve</h2>
              <p className="text-page-subtitle-th">ดูภาพรวมว่า edge ของระบบเพิ่มขึ้นจริงหรือกำลังสะสม drawdown</p>
            </div>
            <Badge tone="green">{backtest.totalNetR}R</Badge>
          </div>
          <LineChart
            data={backtest.equityCurve}
            lines={[
              { key: 'netR', color: '#16A34A', name: 'Net R' },
              { key: 'expectancy', color: '#8B5CF6', name: 'Expectancy' },
            ]}
            height={290}
          />
        </Card>

        <Card>
          <div className="mb-5">
            <h2 className="text-section-title">Validation Status</h2>
            <p className="text-page-subtitle-th">แยกระบบที่พร้อม forward test ออกจากระบบที่ต้องทบทวน</p>
          </div>
          <DonutChart data={backtest.statusDistribution} height={250} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {backtest.statusDistribution.map((item) => (
              <div key={item.name} className="rounded-2xl border border-border bg-slate-50 px-3 py-2">
                <p className="text-caption-ui">{item.name}</p>
                <p className="font-inter text-[22px] font-extrabold leading-7 tracking-[-0.03em] text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="mb-5">
            <h2 className="text-section-title">Strategy Performance</h2>
            <p className="text-page-subtitle-th">เทียบระบบด้วย Net R เพื่อรู้ว่าอะไรควรเอาไป forward test ต่อ</p>
          </div>
          <BarChart data={strategyBars} xKey="strategy" barKey="netR" color="#16A34A" height={300} />
        </Card>

        <Card hover={false}>
          <div className="mb-5">
            <h2 className="text-section-title">Strategy Matrix</h2>
            <p className="text-page-subtitle-th">ตารางรวมตัวชี้วัดสำคัญของแต่ละระบบ</p>
          </div>
          <div className="space-y-3">
            {backtest.strategyPerformance.map((item) => (
              <div key={item.strategy} className="rounded-2xl border border-border bg-white p-4 shadow-sm" style={{ boxShadow: `inset 4px 0 0 ${strategyColor(item.strategy)}, 0 4px 14px rgba(15,23,42,0.04)` }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 font-inter text-[12px] font-extrabold leading-4 ${strategyChipClass(item.strategy)}`}>{item.strategy}</span>
                    <p className="mt-1 text-caption-ui">PF {item.profitFactor} • {item.netR}R net</p>
                  </div>
                  <Badge tone={item.adherence >= 80 ? 'green' : 'orange'}>{item.adherence}% rules</Badge>
                </div>
                <ProgressBar value={item.adherence} className="mt-4" color={strategyColor(item.strategy)} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card hover={false}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-section-title">FX Replay Trade Log</h2>
            <p className="text-page-subtitle-th">เก็บข้อมูลรายไม้เหมือน replay journal: setup, entry model, MFE, MAE, mistake และ screenshot reference</p>
          </div>
          <Badge tone="purple">{filteredReplayTrades.length}/{backtest.trades.length} replay trades</Badge>
        </div>
        <div className="mb-4 grid gap-3 rounded-2xl border border-border bg-slate-50/80 p-3 md:grid-cols-4">
          <Select
            label="Symbol"
            options={replaySymbolOptions}
            value={replayFilters.symbol}
            onChange={(event) => setReplayFilters({ ...replayFilters, symbol: event.target.value })}
          />
          <Select
            label="Direction"
            options={[{ label: 'All', value: 'All' }, ...directionOptions]}
            value={replayFilters.direction}
            onChange={(event) => setReplayFilters({ ...replayFilters, direction: event.target.value })}
          />
          <Select
            label="Result"
            options={['All', 'Win', 'Loss', 'BE']}
            value={replayFilters.result}
            onChange={(event) => setReplayFilters({ ...replayFilters, result: event.target.value })}
          />
          <Select
            label="Sort"
            options={[
              { label: 'Newest first', value: 'date-desc' },
              { label: 'Oldest first', value: 'date-asc' },
              { label: 'Best R first', value: 'result-desc' },
              { label: 'Worst R first', value: 'result-asc' },
              { label: 'Highest MFE', value: 'mfe-desc' },
              { label: 'Lowest MAE', value: 'mae-asc' },
            ]}
            value={replayFilters.sort}
            onChange={(event) => setReplayFilters({ ...replayFilters, sort: event.target.value })}
          />
        </div>
        <div className="overflow-hidden">
          <table className="w-full table-fixed border-separate border-spacing-0">
            <colgroup>
              <col className="w-[4.5%]" />
              <col className="w-[8.5%]" />
              <col className="w-[9%]" />
              <col className="w-[8%]" />
              <col className="w-[11%]" />
              <col className="w-[15%]" />
              <col className="w-[7%]" />
              <col className="w-[6%]" />
              <col className="w-[6%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
            </colgroup>
            <thead>
              <tr className="text-left">
                {['#', 'Date', 'Symbol', 'Direction', 'Setup', 'Entry Model', 'Result', 'MFE', 'MAE', 'Mistake', 'Replay Frame'].map((header) => (
                  <th key={header} className="border-b border-border px-2 py-2 font-inter text-[10px] font-bold leading-4 tracking-[0.02em] text-slate-500">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReplayTrades.map((trade) => (
                <tr key={trade.id} title={`${trade.symbol} ${trade.setup} • ${trade.resultR}R • MFE ${trade.mfeR}R / MAE ${trade.maeR}R`} className="transition hover:bg-slate-50">
                  <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{trade.index}</td>
                  <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{trade.date}</td>
                  <td className="border-b border-border px-2 py-2">
                    <span className={`inline-flex max-w-full truncate rounded-full border px-2 py-0.5 font-inter text-[11px] font-extrabold leading-4 ${symbolChipClass(trade.symbol)}`}>{trade.symbol}</span>
                  </td>
                  <td className="border-b border-border px-2 py-2">
                    <span className={`inline-flex max-w-full truncate rounded-full border px-2 py-0.5 font-inter text-[11px] font-extrabold leading-4 ${directionChipClass(trade.direction)}`}>{directionLabel(trade.direction)}</span>
                  </td>
                  <td className="border-b border-border px-2 py-2">
                    <span className={`inline-flex max-w-full truncate rounded-full border px-2 py-0.5 font-inter text-[11px] font-bold leading-4 ${strategyChipClass(trade.setup)}`}>{trade.setup}</span>
                  </td>
                  <td className="truncate border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{trade.entryModel}</td>
                  <td className="border-b border-border px-2 py-2"><Badge tone={trade.resultR > 0 ? 'green' : trade.resultR < 0 ? 'red' : 'gray'}>{trade.resultR}R</Badge></td>
                  <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{trade.mfeR}R</td>
                  <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{trade.maeR}R</td>
                  <td className="border-b border-border px-2 py-2">
                    <span className={`inline-flex max-w-full truncate rounded-full border px-2 py-0.5 font-inter text-[10px] font-bold leading-4 ${mistakeChipClass(trade.mistake)}`}>{trade.mistake}</span>
                  </td>
                  <td className="truncate border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{trade.screenshotUrl ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card hover={false}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-section-title">Backtest Session Library</h2>
            <p className="text-page-subtitle-th">ข้อมูล session ทั้งหมดพร้อม finding และ action ถัดไป</p>
          </div>
          <Badge tone="blue">{filteredSessions.length}/{backtest.sessions.length} sessions</Badge>
        </div>
        <div className="mb-4 grid gap-3 rounded-2xl border border-border bg-slate-50/80 p-3 md:grid-cols-4">
          <Select
            label="Symbol"
            options={sessionSymbolOptions}
            value={sessionFilters.symbol}
            onChange={(event) => setSessionFilters({ ...sessionFilters, symbol: event.target.value })}
          />
          <Select
            label="Status"
            options={['All', ...statuses]}
            value={sessionFilters.status}
            onChange={(event) => setSessionFilters({ ...sessionFilters, status: event.target.value })}
          />
          <Select
            label="Strategy"
            options={sessionStrategyOptions}
            value={sessionFilters.strategy}
            onChange={(event) => setSessionFilters({ ...sessionFilters, strategy: event.target.value })}
          />
          <Select
            label="Sort"
            options={[
              { label: 'Highest Net R', value: 'netR-desc' },
              { label: 'Lowest Net R', value: 'netR-asc' },
              { label: 'Highest Win Rate', value: 'winRate-desc' },
              { label: 'Most Trades', value: 'trades-desc' },
              { label: 'Newest Period', value: 'start-desc' },
            ]}
            value={sessionFilters.sort}
            onChange={(event) => setSessionFilters({ ...sessionFilters, sort: event.target.value })}
          />
        </div>
        <div className="overflow-hidden">
          <table className="w-full table-fixed border-separate border-spacing-0">
            <colgroup>
              <col className="w-[10%]" />
              <col className="w-[9%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[4.5%]" />
              <col className="w-[5.5%]" />
              <col className="w-[5.5%]" />
              <col className="w-[4.5%]" />
              <col className="w-[5.5%]" />
              <col className="w-[5%]" />
              <col className="w-[6%]" />
              <col className="w-[11.5%]" />
              <col className="w-[11.5%]" />
            </colgroup>
            <thead>
              <tr className="text-left">
                {['Name', 'Market', 'Strategy', 'Period', 'Trades', 'Win Rate', 'Net R', 'PF', 'Max DD', 'Rules', 'Status', 'Finding', 'Next Action'].map((header) => (
                  <th key={header} className="border-b border-border px-2 py-2 font-inter text-[10px] font-bold leading-4 tracking-[0.02em] text-slate-500">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => {
                const sessionWinRate = session.trades ? Math.round((session.wins / session.trades) * 100) : 0;
                return (
                  <tr key={session.id} title={`${session.name} • ${session.netR}R • ${session.status}`} className="transition hover:bg-slate-50">
                    <td className="truncate border-b border-border px-2 py-2 font-inter text-[12px] font-semibold leading-4 text-slate-700">{session.name}</td>
                    <td className="border-b border-border px-2 py-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex max-w-full truncate rounded-full border px-2 py-0.5 font-inter text-[11px] font-extrabold leading-4 ${symbolChipClass(session.symbol)}`}>{session.symbol}</span>
                        <span className="font-inter text-[12px] font-bold text-slate-400">/ {session.timeframe}</span>
                      </div>
                    </td>
                    <td className="border-b border-border px-2 py-2">
                      <span className={`inline-flex max-w-full truncate rounded-full border px-2 py-0.5 font-inter text-[11px] font-bold leading-4 ${strategyChipClass(session.strategy)}`}>{session.strategy}</span>
                    </td>
                    <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{session.startDate} - {session.endDate}</td>
                    <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{session.trades}</td>
                    <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{sessionWinRate}%</td>
                    <td className="border-b border-border px-2 py-2"><Badge tone={session.netR >= 0 ? 'green' : 'red'}>{session.netR}R</Badge></td>
                    <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{session.profitFactor}</td>
                    <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{session.maxDrawdownR}R</td>
                    <td className="border-b border-border px-2 py-2">
                      <span className="inline-flex max-w-full truncate rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 font-inter text-[11px] font-extrabold leading-4 text-emerald-700">{session.ruleAdherence}%</span>
                    </td>
                    <td className="border-b border-border px-2 py-2"><Badge tone={statusTone(session.status)}>{session.status}</Badge></td>
                    <td className="truncate border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{session.keyFinding}</td>
                    <td className="truncate border-b border-border px-2 py-2 font-inter text-[12px] font-medium leading-4 text-slate-700">{session.nextAction}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        title="Add Backtest Session"
        subtitle="เพิ่มชุดทดสอบใหม่พร้อม performance, finding และ action ถัดไป"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSessionModalOpen(false)}>Cancel</Button>
            <Button icon={<Plus size={16} />} onClick={saveSession}>Save Backtest</Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Session Name" className="md:col-span-2" value={sessionForm.name} onChange={(event) => setSessionForm({ ...sessionForm, name: event.target.value })} />
          <Select label="Status" options={statuses} value={sessionForm.status} onChange={(event) => setSessionForm({ ...sessionForm, status: event.target.value as BacktestStatus })} />
          <Select label="Symbol" options={symbols} value={sessionForm.symbol} onChange={(event) => setSessionForm({ ...sessionForm, symbol: event.target.value })} />
          <Select label="Strategy" options={strategies} value={sessionForm.strategy} onChange={(event) => setSessionForm({ ...sessionForm, strategy: event.target.value })} />
          <Select label="Timeframe" options={timeframes} value={sessionForm.timeframe} onChange={(event) => setSessionForm({ ...sessionForm, timeframe: event.target.value })} />
          <Select label="Market Condition" options={conditions} value={sessionForm.marketCondition} onChange={(event) => setSessionForm({ ...sessionForm, marketCondition: event.target.value as BacktestMarketCondition })} />
          <Input label="Start Date" type="date" value={sessionForm.startDate} onChange={(event) => setSessionForm({ ...sessionForm, startDate: event.target.value })} />
          <Input label="End Date" type="date" value={sessionForm.endDate} onChange={(event) => setSessionForm({ ...sessionForm, endDate: event.target.value })} />
          <Input label="Trades" value={sessionForm.trades} onChange={(event) => setSessionForm({ ...sessionForm, trades: event.target.value })} />
          <Input label="Wins" value={sessionForm.wins} onChange={(event) => setSessionForm({ ...sessionForm, wins: event.target.value })} />
          <Input label="Losses" value={sessionForm.losses} onChange={(event) => setSessionForm({ ...sessionForm, losses: event.target.value })} />
          <Input label="Breakeven" value={sessionForm.breakeven} onChange={(event) => setSessionForm({ ...sessionForm, breakeven: event.target.value })} />
          <Input label="Net R" value={sessionForm.netR} onChange={(event) => setSessionForm({ ...sessionForm, netR: event.target.value })} />
          <Input label="Profit Factor" value={sessionForm.profitFactor} onChange={(event) => setSessionForm({ ...sessionForm, profitFactor: event.target.value })} />
          <Input label="Expectancy R" value={sessionForm.expectancyR} onChange={(event) => setSessionForm({ ...sessionForm, expectancyR: event.target.value })} />
          <Input label="Max Drawdown R" value={sessionForm.maxDrawdownR} onChange={(event) => setSessionForm({ ...sessionForm, maxDrawdownR: event.target.value })} />
          <Input label="Rule Adherence %" value={sessionForm.ruleAdherence} onChange={(event) => setSessionForm({ ...sessionForm, ruleAdherence: event.target.value })} />
          <Textarea label="Key Finding" className="md:col-span-3" value={sessionForm.keyFinding} onChange={(event) => setSessionForm({ ...sessionForm, keyFinding: event.target.value })} />
          <Textarea label="Next Action" className="md:col-span-3" value={sessionForm.nextAction} onChange={(event) => setSessionForm({ ...sessionForm, nextAction: event.target.value })} />
        </div>
      </Modal>

      <Modal
        open={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        title="Add FX Replay Trade"
        subtitle="บันทึกข้อมูลรายไม้จาก replay เพื่ออ่าน mistake, MFE/MAE และ execution quality"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setTradeModalOpen(false)}>Cancel</Button>
            <Button icon={<Plus size={16} />} onClick={saveReplayTrade}>Save Replay Trade</Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Select label="Backtest Session" className="md:col-span-2" options={sessionOptions} value={tradeForm.sessionId} onChange={(event) => setTradeForm({ ...tradeForm, sessionId: event.target.value })} />
          <Input label="Trade Index" value={tradeForm.index} onChange={(event) => setTradeForm({ ...tradeForm, index: event.target.value })} />
          <Input label="Date" type="date" value={tradeForm.date} onChange={(event) => setTradeForm({ ...tradeForm, date: event.target.value })} />
          <Select label="Symbol" options={symbols} value={tradeForm.symbol} onChange={(event) => setTradeForm({ ...tradeForm, symbol: event.target.value })} />
          <Select label="Direction" options={directionOptions} value={tradeForm.direction} onChange={(event) => setTradeForm({ ...tradeForm, direction: event.target.value as 'Long' | 'Short' })} />
          <Input label="Setup" value={tradeForm.setup} onChange={(event) => setTradeForm({ ...tradeForm, setup: event.target.value })} />
          <Input label="Entry Model" value={tradeForm.entryModel} onChange={(event) => setTradeForm({ ...tradeForm, entryModel: event.target.value })} />
          <Input label="Result R" value={tradeForm.resultR} onChange={(event) => setTradeForm({ ...tradeForm, resultR: event.target.value })} />
          <Input label="MFE R" value={tradeForm.mfeR} onChange={(event) => setTradeForm({ ...tradeForm, mfeR: event.target.value })} />
          <Input label="MAE R" value={tradeForm.maeR} onChange={(event) => setTradeForm({ ...tradeForm, maeR: event.target.value })} />
          <Input label="Screenshot / Replay Frame" className="md:col-span-2" value={tradeForm.screenshotUrl} onChange={(event) => setTradeForm({ ...tradeForm, screenshotUrl: event.target.value })} />
          <Textarea label="Mistake / Lesson" className="md:col-span-3" value={tradeForm.mistake} onChange={(event) => setTradeForm({ ...tradeForm, mistake: event.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
