import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, Bell, CheckCircle2, Gauge, Info, LineChart as LineChartIcon, ShieldAlert, Star, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { cn } from '../../lib/utils';

type PerformanceFilters = {
  dateRange: string;
  strategy: string;
  symbol: string;
  timeframe: string;
  session: string;
  dataType: string;
};

const defaultFilters: PerformanceFilters = {
  dateRange: '2025-01-01 - 2025-05-31',
  strategy: 'All Strategies',
  symbol: 'All Symbols',
  timeframe: 'M5',
  session: 'All Sessions',
  dataType: 'All Data',
};

const filterOptions = {
  dateRange: ['2025-01-01 - 2025-05-31', '2025-01-01 - 2025-04-30', '2025-02-01 - 2025-05-31', 'All Time'],
  strategy: ['All Strategies', 'Liquidity Sweep + BOS', 'Supply Rejection', 'Opening Range Failure', 'Range Fade'],
  symbol: ['All Symbols', 'EURUSD', 'XAUUSD', 'NAS100', 'GBPUSD'],
  timeframe: ['M5', 'M15', 'H1'],
  session: ['All Sessions', 'London', 'New York', 'Asia', 'Overlap (LDN+NY)'],
  dataType: ['All Data', 'In-sample', 'Out-of-sample', 'Forward Test'],
};

const strategyColor: Record<string, string> = {
  'Liquidity Sweep + BOS': '#8B5CF6',
  'Supply Rejection': '#E11D48',
  'Opening Range Failure': '#F97316',
  'Range Fade': '#06B6D4',
};

const snapshot = {
  kpis: {
    totalNetR: 48.6,
    profitFactor: 1.62,
    winRate: 48.2,
    expectancy: 0.43,
    avgWin: 1.36,
    avgLoss: -0.83,
    totalTrades: 196,
    bestStrategyShort: 'LS + BOS',
    bestStrategyName: 'Liquidity Sweep + BOS',
  },
  equityCurve: [
    { date: "Jan '25", cumulativeR: 0.2 },
    { date: "Feb '25", cumulativeR: 8.4 },
    { date: "Mar '25", cumulativeR: 23.6 },
    { date: "Apr '25", cumulativeR: 27.8 },
    { date: "May '25", cumulativeR: 39.1 },
    { date: "May '25", cumulativeR: 48.6 },
  ],
  strategyBars: [
    { strategy: 'Liquidity Sweep + BOS', netR: 28.4 },
    { strategy: 'Supply Rejection', netR: 12.1 },
    { strategy: 'Opening Range Failure', netR: 9.6 },
    { strategy: 'Range Fade', netR: -3.2 },
  ],
  heatmap: {
    monthKeys: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    matrix: [
      { year: '2025', values: [5.1, 4.2, 7.8, 10.3, 21.2, 0, 0, 0, 0, 0, 0, 0] },
      { year: '2024', values: [-2.1, 3.6, 6.5, 8.1, -1.4, 6.2, 4.8, -3.0, 7.5, 5.1, 2.7, 6.4] },
      { year: '2023', values: [1.2, -0.8, 2.9, 4.4, 3.3, -1.2, 2.1, 1.5, -0.6, 2.8, 1.9, 3.2] },
    ],
  },
  setupExpectancy: [
    { setup: 'Liquidity Sweep', expectancy: 0.68 },
    { setup: 'Supply Rejection', expectancy: 0.45 },
    { setup: 'Opening Range Failure', expectancy: 0.42 },
    { setup: 'Range Fade', expectancy: -0.18 },
  ],
  sessionPerformance: [
    { session: 'London', netR: 28.7 },
    { session: 'New York', netR: 16.3 },
    { session: 'Asia', netR: 4.8 },
    { session: 'Overlap (LDN+NY)', netR: 11.2 },
  ],
  symbolPerformance: [
    { symbol: 'EURUSD', trades: 84, netR: 28.4, winRate: 51.2, pf: 1.78 },
    { symbol: 'XAUUSD', trades: 58, netR: 12.1, winRate: 47.4, pf: 1.42 },
    { symbol: 'NAS100', trades: 36, netR: 6.8, winRate: 50.0, pf: 1.31 },
    { symbol: 'GBPUSD', trades: 18, netR: 1.3, winRate: 44.4, pf: 1.15 },
  ],
  rDistributionPct: [
    { bucket: '-2R+', pct: 3 },
    { bucket: '-2R to -1R', pct: 8 },
    { bucket: '-1R to -0.5R', pct: 16 },
    { bucket: '-0.5R to 0', pct: 16 },
    { bucket: '0 to 0.5R', pct: 20 },
    { bucket: '0.5R to 1R', pct: 17 },
    { bucket: '1R to 2R', pct: 14 },
    { bucket: '2R+', pct: 6 },
  ],
  breakdown: {
    wins: 94,
    losses: 97,
    breakEven: 5,
  },
  insights: {
    bestSession: { name: 'London', value: '28.7R (59.1% of total)' },
    strongest: { name: 'Liquidity Sweep + BOS', value: '28.4R (58.4% of total)' },
    weakest: { name: 'Range Fade', value: '-3.2R (-6.6% of total)' },
    recommendation: 'Focus on London and New York sessions where performance is strongest. Reduce or deprioritize Range Fade testing.',
  },
};

function toSignedR(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}R`;
}

function buildSparkPath(points: number[]) {
  if (!points.length) return '';
  const step = 54 / Math.max(1, points.length - 1);
  const path = points.map((value, index) => `${index === 0 ? 'M' : 'L'} ${Math.round(step * index)} ${value}`);
  return path.join(' ');
}

const tooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number | string }>; label?: string | number }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-[0_12px_22px_rgba(15,23,42,0.08)]">
      <p className="font-inter text-[12px] font-semibold text-slate-500">{label}</p>
      {payload.map((entry) => (
        <p key={`${entry.name ?? 'value'}`} className="font-inter text-[12px] font-bold text-slate-900">
          {entry.name ?? 'Value'}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
        </p>
      ))}
    </div>
  );
};

export function PerformanceTabV2() {
  const [filters, setFilters] = useState<PerformanceFilters>(defaultFilters);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 30);
    return () => window.clearTimeout(timer);
  }, []);

  const breakdownTotal = snapshot.breakdown.wins + snapshot.breakdown.losses + snapshot.breakdown.breakEven;

  const kpiCards = [
    {
      label: 'Total Net R',
      value: `${snapshot.kpis.totalNetR.toFixed(1)}R`,
      trend: '↑ 28.4R (140.6%)',
      tone: 'green',
      icon: TrendingUp,
      spark: [24, 24, 22, 18, 14, 14, 12, 10],
    },
    {
      label: 'Profit Factor',
      value: snapshot.kpis.profitFactor.toFixed(2),
      trend: '↑ 0.21 (14.9%)',
      tone: 'pink',
      icon: ShieldAlert,
      spark: [20, 19, 18, 16, 12, 10, 12, 9],
    },
    {
      label: 'Win Rate',
      value: `${snapshot.kpis.winRate.toFixed(1)}%`,
      trend: '↑ 4.6 pp',
      tone: 'emerald',
      icon: Gauge,
      spark: [22, 20, 16, 17, 14, 11, 11, 8],
    },
    {
      label: 'Expectancy / Trade',
      value: `${snapshot.kpis.expectancy.toFixed(2)}R`,
      trend: '↑ 0.12R',
      tone: 'blue',
      icon: Bell,
      spark: [22, 22, 18, 14, 13, 10, 8, 10],
    },
    {
      label: 'Avg Win',
      value: `${snapshot.kpis.avgWin.toFixed(2)}R`,
      trend: '↑ 0.19R',
      tone: 'green',
      icon: CheckCircle2,
      spark: [24, 22, 20, 18, 16, 12, 10, 10],
    },
    {
      label: 'Avg Loss',
      value: `${snapshot.kpis.avgLoss.toFixed(2)}R`,
      trend: '↓ -0.06R',
      tone: 'red',
      icon: AlertTriangle,
      spark: [10, 12, 14, 16, 17, 19, 19, 21],
    },
    {
      label: 'Total Trades',
      value: `${snapshot.kpis.totalTrades}`,
      trend: '↑ 22',
      tone: 'indigo',
      icon: LineChartIcon,
      spark: [24, 22, 20, 18, 16, 14, 12, 9],
    },
    {
      label: 'Best Strategy',
      value: snapshot.kpis.bestStrategyShort,
      trend: snapshot.kpis.bestStrategyName,
      tone: 'amber',
      icon: Star,
      spark: null,
    },
  ];

  return (
    <div className={cn('space-y-4 transition-all duration-300 motion-reduce:transition-none', isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')}>
      <Card hover={false} className="p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
        <div className="grid items-end gap-4 xl:grid-cols-[1.35fr_1fr_1fr_0.9fr_1fr_1fr_auto]">
          <Select label="Date Range" options={filterOptions.dateRange} value={filters.dateRange} onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))} />
          <Select label="Strategy" options={filterOptions.strategy} value={filters.strategy} onChange={(e) => setFilters((prev) => ({ ...prev, strategy: e.target.value }))} />
          <Select label="Symbol" options={filterOptions.symbol} value={filters.symbol} onChange={(e) => setFilters((prev) => ({ ...prev, symbol: e.target.value }))} />
          <Select label="Timeframe" options={filterOptions.timeframe} value={filters.timeframe} onChange={(e) => setFilters((prev) => ({ ...prev, timeframe: e.target.value }))} />
          <Select label="Session" options={filterOptions.session} value={filters.session} onChange={(e) => setFilters((prev) => ({ ...prev, session: e.target.value }))} />
          <Select label="Data Type" options={filterOptions.dataType} value={filters.dataType} onChange={(e) => setFilters((prev) => ({ ...prev, dataType: e.target.value }))} />
          <Button
            className="h-11 min-w-[112px] border-violet-300 text-violet-700 hover:border-violet-400 hover:bg-violet-50"
            variant="secondary"
            onClick={() => setFilters(defaultFilters)}
          >
            Reset
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {kpiCards.map((item) => (
          <Card
            key={item.label}
            hover={false}
            className="h-full min-h-[118px] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-transform duration-200 hover:-translate-y-[2px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-full',
                  item.tone === 'green' && 'bg-emerald-100 text-emerald-600',
                  item.tone === 'pink' && 'bg-rose-100 text-rose-600',
                  item.tone === 'emerald' && 'bg-emerald-100 text-emerald-600',
                  item.tone === 'blue' && 'bg-blue-100 text-blue-600',
                  item.tone === 'red' && 'bg-red-100 text-red-600',
                  item.tone === 'indigo' && 'bg-indigo-100 text-indigo-600',
                  item.tone === 'amber' && 'bg-amber-100 text-amber-600',
                )}
              >
                <item.icon size={16} />
              </div>
              {item.spark ? (
                <svg viewBox="0 0 56 28" className="h-8 w-16">
                  <path
                    d={buildSparkPath(item.spark)}
                    fill="none"
                    stroke={
                      item.tone === 'red'
                        ? '#F43F5E'
                        : item.tone === 'pink'
                          ? '#EC4899'
                          : item.tone === 'blue'
                            ? '#3B82F6'
                            : item.tone === 'indigo'
                              ? '#2563EB'
                              : '#22C55E'
                    }
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : null}
            </div>
            <p className="mt-2 font-inter text-[12px] font-semibold leading-4 text-slate-500">{item.label}</p>
            <p className="mt-1 font-inter text-[36px] font-extrabold leading-[40px] tracking-[-0.03em] text-slate-950">{item.value}</p>
            {item.tone === 'amber' ? (
              <Badge tone="purple" className="mt-2">{item.trend}</Badge>
            ) : (
              <p
                className={cn(
                  'mt-1 font-inter text-[12px] font-semibold',
                  item.tone === 'red'
                    ? 'text-red-600'
                    : item.tone === 'pink'
                      ? 'text-pink-600'
                      : item.tone === 'blue'
                        ? 'text-blue-600'
                        : item.tone === 'indigo'
                          ? 'text-indigo-600'
                          : 'text-emerald-600',
                )}
              >
                {item.trend}
              </p>
            )}
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.75fr_1.25fr]">
        <Card hover={false} className="p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-inter text-[16px] font-bold leading-5 text-slate-950">Equity Curve (Cumulative R)</h3>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-slate-200 px-3 py-1.5 font-inter text-[12px] font-semibold text-slate-600">Cumulative R</button>
              <Info size={15} className="text-slate-400" />
            </div>
          </div>
          <div className="h-[205px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshot.equityCurve}>
                <defs>
                  <linearGradient id="eqGradientV2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip content={tooltip} />
                <Area type="monotone" dataKey="cumulativeR" stroke="#8B5CF6" strokeWidth={2.4} fill="url(#eqGradientV2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-inter text-[16px] font-bold leading-5 text-slate-950">Net R by Strategy</h3>
            <Info size={15} className="text-slate-400" />
          </div>
          <div className="h-[205px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snapshot.strategyBars} margin={{ top: 18, right: 8, bottom: 10, left: 0 }}>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="strategy" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} interval={0} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip content={tooltip} />
                <Bar dataKey="netR" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#334155', fontSize: 12, formatter: (value: number) => `${value.toFixed(1)}R` }}>
                  {snapshot.strategyBars.map((row) => (
                    <Cell key={row.strategy} fill={strategyColor[row.strategy] ?? (row.netR >= 0 ? '#22C55E' : '#EF4444')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-inter text-[16px] font-bold leading-5 text-slate-950">Monthly Performance Heatmap (Net R)</h3>
            <Info size={15} className="text-slate-400" />
          </div>
          <div className="mt-5 grid gap-1" style={{ gridTemplateColumns: '42px repeat(12, minmax(0, 1fr))' }}>
            <div />
            {snapshot.heatmap.monthKeys.map((month) => (
              <p key={month} className="text-center font-inter text-[11px] font-semibold text-slate-500">
                {month}
              </p>
            ))}
            {snapshot.heatmap.matrix.map((row) => (
              <div key={row.year} className="contents">
                <p className="grid place-items-center font-inter text-[12px] font-bold text-slate-600">{row.year}</p>
                {row.values.map((value, index) => (
                  <div
                    key={`${row.year}-${index}`}
                    className={cn(
                      'grid min-h-[36px] place-items-center rounded-md border px-1 text-center',
                      value > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : value < 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-500',
                    )}
                  >
                    <span className="font-inter text-[11px] font-semibold">{value === 0 ? '-' : `${Math.abs(value).toFixed(1)}R`}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Card hover={false} className="p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-inter text-[16px] font-bold leading-5 text-slate-950">Expectancy by Setup</h3>
            <Info size={15} className="text-slate-400" />
          </div>
          <div className="h-[155px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={snapshot.setupExpectancy} margin={{ top: 2, right: 12, bottom: 2, left: 8 }}>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="setup" type="category" tickLine={false} axisLine={false} width={138} tick={{ fontSize: 11 }} />
                <Tooltip content={tooltip} />
                <Bar dataKey="expectancy" radius={[0, 8, 8, 0]}>
                  {snapshot.setupExpectancy.map((row) => (
                    <Cell key={row.setup} fill={row.expectancy >= 0 ? '#8B5CF6' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-inter text-[16px] font-bold leading-5 text-slate-950">Performance by Session (Net R)</h3>
            <Info size={15} className="text-slate-400" />
          </div>
          <div className="h-[155px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snapshot.sessionPerformance}>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="session" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip content={tooltip} />
                <Bar dataKey="netR" radius={[8, 8, 0, 0]}>
                  {snapshot.sessionPerformance.map((row) => (
                    <Cell key={row.session} fill={row.netR >= 0 ? '#8B5CF6' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-inter text-[16px] font-bold leading-5 text-slate-950">Performance by Symbol</h3>
            <Info size={15} className="text-slate-400" />
          </div>
          <div className="overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Symbol', 'Trades', 'Net R', 'Win Rate', 'PF', ''].map((header) => (
                    <th key={header} className="border-b border-slate-200 px-2 py-2 text-left text-table-header">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {snapshot.symbolPerformance.map((row) => (
                  <tr key={row.symbol}>
                    <td className="px-2 py-1.5 text-table-cell">{row.symbol}</td>
                    <td className="px-2 py-1.5 text-table-cell">{row.trades}</td>
                    <td className={cn('px-2 py-2 text-table-cell font-bold', row.netR >= 0 ? 'text-emerald-600' : 'text-red-600')}>{toSignedR(row.netR)}</td>
                    <td className="px-2 py-2 text-table-cell">{row.winRate.toFixed(1)}%</td>
                    <td className="px-2 py-2 text-table-cell">{row.pf.toFixed(2)}</td>
                    <td className="px-2 py-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={cn('h-full rounded-full', row.netR >= 0 ? 'bg-violet-500' : 'bg-red-500')} style={{ width: `${Math.min(100, Math.max(8, Math.abs(row.netR) * 4))}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card hover={false} className="p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-inter text-[16px] font-bold leading-5 text-slate-950">R-Multiple Distribution (All Trades)</h3>
            <Info size={15} className="text-slate-400" />
          </div>
          <div className="h-[155px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snapshot.rDistributionPct}>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} unit="%" />
                <Tooltip content={tooltip} />
                <Bar dataKey="pct" fill="#8B5CF6" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#334155', fontSize: 12, formatter: (value: number) => `${value.toFixed(0)}%` }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_2.3fr]">
        <Card hover={false} className="p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-inter text-[16px] font-bold leading-5 text-slate-950">Win / Loss / Break-even Breakdown</h3>
            <Info size={15} className="text-slate-400" />
          </div>
          <div className="grid items-center gap-3 md:grid-cols-[140px_1fr]">
            <div className="relative h-[132px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Wins', value: snapshot.breakdown.wins, color: '#22C55E' },
                      { name: 'Losses', value: snapshot.breakdown.losses, color: '#EF4444' },
                      { name: 'Break-even', value: snapshot.breakdown.breakEven, color: '#94A3B8' },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="57%"
                    outerRadius="83%"
                    paddingAngle={2}
                  >
                    {[{ color: '#22C55E' }, { color: '#EF4444' }, { color: '#94A3B8' }].map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={tooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="font-inter text-[24px] font-extrabold leading-[26px] text-slate-950">{breakdownTotal}</p>
                  <p className="font-inter text-[11px] text-slate-500">Trades</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Wins', value: snapshot.breakdown.wins, pct: '48.0%', color: 'bg-emerald-500' },
                { label: 'Losses', value: snapshot.breakdown.losses, pct: '49.5%', color: 'bg-red-500' },
                { label: 'Break-even', value: snapshot.breakdown.breakEven, pct: '2.6%', color: 'bg-slate-400' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-3 w-3 rounded-full', row.color)} />
                    <span className="font-inter text-[13px] font-semibold text-slate-700">{row.label}</span>
                  </div>
                  <p className="font-inter text-[13px] text-slate-600">{row.value} ({row.pct})</p>
                </div>
              ))}
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-inter text-[11px] uppercase tracking-[0.02em] text-slate-500">Total closed trades</p>
                <p className="font-inter text-[16px] font-extrabold text-slate-950">{breakdownTotal}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card hover={false} className="bg-violet-50/40 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-inter text-[16px] font-bold leading-5 text-slate-950">Performance Insights</h3>
            <Info size={15} className="text-slate-400" />
          </div>
          <div className="grid min-h-[132px] items-center gap-3 md:grid-cols-[76px_1fr_1fr_1fr_1.35fr]">
            <div className="grid h-full min-h-[104px] place-items-center rounded-2xl border border-violet-200 bg-violet-100/70">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-violet-100 text-violet-600">
                <LineChartIcon size={24} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-inter text-[12px] font-semibold text-slate-500">Best Session</p>
              <p className="mt-2 font-inter text-[20px] font-extrabold leading-6 text-slate-950">{snapshot.insights.bestSession.name}</p>
              <p className="mt-1 font-inter text-[12px] text-slate-500">{snapshot.insights.bestSession.value}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-inter text-[12px] font-semibold text-slate-500">Strongest Strategy</p>
              <p className="mt-2 font-inter text-[20px] font-extrabold leading-6 text-slate-950">{snapshot.insights.strongest.name}</p>
              <p className="mt-1 font-inter text-[12px] text-slate-500">{snapshot.insights.strongest.value}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-inter text-[12px] font-semibold text-slate-500">Weakest Strategy</p>
              <p className="mt-2 font-inter text-[20px] font-extrabold leading-6 text-slate-950">{snapshot.insights.weakest.name}</p>
              <p className="mt-1 font-inter text-[12px] text-slate-500">{snapshot.insights.weakest.value}</p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
              <p className="font-inter text-[12px] font-semibold text-violet-700">Recommendation</p>
              <p className="mt-2 font-inter text-[13px] leading-6 text-slate-700">{snapshot.insights.recommendation}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
