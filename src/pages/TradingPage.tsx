import { useEffect, useMemo, useState, type ClipboardEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BarChart3, CalendarClock, Eye, Filter, Image as ImageIcon, Info, Pencil, Plus, RefreshCw, Table2, Upload, WalletCards } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, KpiCard } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { cn, formatCurrency } from '../lib/utils';
import { useAppStore } from '../stores/appStore';
import { useTradingStore } from '../stores/tradingStore';
import { useTrading } from '../hooks/useTrading';
import type {
  TradeDirection,
  TradeEntry,
  TradeStatus,
  FundingAccountStatus,
  TradingEmotion,
  TradingFundingAccount,
  TradingMistakeTag,
  TradingSession,
} from '../types/trading';

const symbols = ['EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY', 'NAS100', 'US30'];
const sessions: TradingSession[] = ['Asia', 'London', 'New York', 'Overlap'];
const statuses: TradeStatus[] = ['Planned', 'Open', 'Closed', 'Missed'];
const emotions: TradingEmotion[] = ['Calm', 'Confident', 'Fearful', 'Greedy', 'Revenge', 'Patient'];
const setups = ['Breakout', 'Trend Continuation', 'Pullback', 'Reversal', 'Liquidity sweep + BOS', 'Supply rejection', 'Opening range failure'];
const mistakeTags: TradingMistakeTag[] = ['None', 'Overconfidence', 'Revenge Trade', 'FOMO', 'Early Exit', 'Moved Stop', 'Late Entry', 'Patience'];
const checklistOptions = [
  'Bias matches higher timeframe',
  'Key level is marked',
  'Invalidation is clear',
  'Risk is within limit',
  'Entry trigger is confirmed',
  'News and session conditions checked',
];

type AccountScopeDateRange = 'All' | '7D' | '30D' | 'ThisMonth';

const accountScopeDateOptions: { label: string; value: AccountScopeDateRange }[] = [
  { label: 'All dates', value: 'All' },
  { label: 'Last 7 days', value: '7D' },
  { label: 'Last 30 days', value: '30D' },
  { label: 'This month', value: 'ThisMonth' },
];

const accountScopeSortOptions = [
  { label: 'Newest first', value: 'date-desc' },
  { label: 'Oldest first', value: 'date-asc' },
  { label: 'Best R first', value: 'result-desc' },
  { label: 'Worst R first', value: 'result-asc' },
  { label: 'Highest PnL', value: 'pnl-desc' },
  { label: 'Lowest PnL', value: 'pnl-asc' },
];

const futuresSymbols = ['NQ', 'MNQ', 'US30'];

const initialTradeForm = {
  date: '2026-06-18',
  fundingAccountId: '',
  entryTime: '09:30',
  exitTime: '11:00',
  symbol: 'EURUSD',
  direction: 'Long' as TradeDirection,
  session: 'London' as TradingSession,
  timeframe: 'M15',
  setup: 'Breakout',
  entryPrice: '1.0830',
  stopLoss: '1.0815',
  takeProfit: '1.0870',
  exitPrice: '1.0860',
  riskAmount: '1250',
  commission: '45',
  resultR: '1.5',
  mfeR: '2.1',
  maeR: '0.5',
  rrTarget: '2.7',
  confidenceScore: '78',
  status: 'Closed' as TradeStatus,
  emotion: 'Calm' as TradingEmotion,
  mistakeTags: ['None'] as TradingMistakeTag[],
  ruleFollowed: true,
  exitReason: 'Partial at 1R and close at next liquidity.',
  preTradeImageUrl: '',
  postTradeImageUrl: '',
  checklistItems: checklistOptions.slice(0, 4),
  checklistPassed: true,
  notes: 'Wait for displacement, confirm entry model, then manage at 1R.',
};

const initialAccountForm = {
  provider: 'FTMO',
  accountName: 'FTMO 100K Challenge',
  accountType: 'Challenge Phase 1',
  iconLabel: 'FT',
  status: 'Challenge' as FundingAccountStatus,
  purchaseDate: '2026-06-18',
  deadlineDate: '2026-07-18',
  minimumTradingDays: '4',
  completedTradingDays: '0',
  accountSize: '100000',
  startingBalance: '100000',
  currentBalance: '100000',
  purchaseFee: '540',
  resetFees: '0',
  monthlyFee: '0',
  profitTarget: '10000',
  maxDrawdownLimit: '10000',
  dailyDrawdownLimit: '5000',
  currentDrawdownPct: '0',
  platform: 'MT5',
  accountNumber: '',
  notes: 'New account added from Trading+ and ready to link with trade journal entries.',
};

function parseNumber(value: string) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function money(value: number) {
  return formatCurrency(value, 'USD');
}

function signedMoney(value: number) {
  return `${value >= 0 ? '+' : '-'}${money(Math.abs(value))}`;
}

function tradeProfit(trade: TradeEntry) {
  return trade.resultR * trade.riskAmount - (trade.commission ?? 0);
}

function closedTradeProfit(trade: TradeEntry) {
  return trade.status === 'Closed' ? tradeProfit(trade) : 0;
}

function resultName(trade: TradeEntry) {
  if (trade.status !== 'Closed') return 'Open';
  if (trade.resultR > 0) return 'Win';
  if (trade.resultR < 0) return 'Loss';
  return 'BE';
}

function resultTone(value: number) {
  if (value > 0) return 'green';
  if (value < 0) return 'red';
  return 'gray';
}

function assetTypeForSymbol(symbol: string) {
  return futuresSymbols.includes(symbol) ? 'Futures' : 'CFD';
}

function isReviewedTrade(trade: TradeEntry) {
  return Boolean(trade.notes || trade.exitReason || trade.checklistPassed);
}

function checklistStatus(trade: TradeEntry) {
  return trade.checklistPassed ? 'Passed' : 'Needs Review';
}

function sortTrades(trades: TradeEntry[], sort: string) {
  return [...trades].sort((a, b) => {
    if (sort === 'date-asc') return `${a.date}-${a.entryTime ?? '00:00'}`.localeCompare(`${b.date}-${b.entryTime ?? '00:00'}`);
    if (sort === 'result-desc') return b.resultR - a.resultR;
    if (sort === 'result-asc') return a.resultR - b.resultR;
    if (sort === 'pnl-desc') return tradeProfit(b) - tradeProfit(a);
    if (sort === 'pnl-asc') return tradeProfit(a) - tradeProfit(b);
    return `${b.date}-${b.entryTime ?? '00:00'}`.localeCompare(`${a.date}-${a.entryTime ?? '00:00'}`);
  });
}

function safePercent(value: number, total: number) {
  return total ? Number(((value / total) * 100).toFixed(2)) : 0;
}

function plannedRrr(trade: TradeEntry) {
  if (trade.rrTarget) return trade.rrTarget;
  const riskDistance = Math.abs(trade.entryPrice - trade.stopLoss);
  if (!riskDistance) return 0;
  return Number((Math.abs(trade.takeProfit - trade.entryPrice) / riskDistance).toFixed(2));
}

function actualRrr(trade: TradeEntry) {
  const riskDistance = Math.abs(trade.entryPrice - trade.stopLoss);
  if (!riskDistance || trade.exitPrice === undefined) return 0;
  return Number((Math.abs(trade.exitPrice - trade.entryPrice) / riskDistance).toFixed(2));
}

function tradeToForm(trade: TradeEntry) {
  return {
    date: trade.date,
    fundingAccountId: trade.fundingAccountId ?? '',
    entryTime: trade.entryTime ?? '09:30',
    exitTime: trade.exitTime ?? '',
    symbol: trade.symbol,
    direction: trade.direction,
    session: trade.session,
    timeframe: trade.timeframe,
    setup: trade.setup,
    entryPrice: String(trade.entryPrice),
    stopLoss: String(trade.stopLoss),
    takeProfit: String(trade.takeProfit),
    exitPrice: trade.exitPrice ? String(trade.exitPrice) : '',
    riskAmount: String(trade.riskAmount),
    commission: String(trade.commission ?? 0),
    resultR: String(trade.resultR),
    mfeR: String(trade.mfeR ?? 0),
    maeR: String(trade.maeR ?? 0),
    rrTarget: String(trade.rrTarget ?? 0),
    confidenceScore: String(trade.confidenceScore ?? 60),
    status: trade.status,
    emotion: trade.emotion,
    mistakeTags: (trade.mistakeTags?.length ? trade.mistakeTags : ['None']) as TradingMistakeTag[],
    ruleFollowed: trade.ruleFollowed,
    exitReason: trade.exitReason ?? '',
    preTradeImageUrl: trade.preTradeImageUrl ?? '',
    postTradeImageUrl: trade.postTradeImageUrl ?? '',
    checklistItems: trade.checklistItems ?? [],
    checklistPassed: Boolean(trade.checklistPassed),
    notes: trade.notes,
  };
}

function daysUntil(date: string) {
  const deadline = new Date(`${date}T00:00:00`).getTime();
  const today = new Date('2026-06-18T00:00:00').getTime();
  return Math.ceil((deadline - today) / 86_400_000);
}

function isDateInRange(date: string, range: AccountScopeDateRange, anchorDate: Date) {
  if (range === 'All') return true;
  const value = new Date(`${date}T00:00:00`).getTime();
  const anchor = new Date(anchorDate).setHours(0, 0, 0, 0);
  if (range === 'ThisMonth') {
    const anchorMonth = new Date(anchorDate).toISOString().slice(0, 7);
    return date.startsWith(anchorMonth);
  }
  const days = range === '7D' ? 7 : 30;
  return value >= anchor - (days - 1) * 86_400_000 && value <= anchor;
}

function longestStreak(trades: TradeEntry[], match: (trade: TradeEntry) => boolean) {
  let current = 0;
  let max = 0;
  [...trades]
    .sort((a, b) => (`${a.date}-${a.entryTime ?? '00:00'}`).localeCompare(`${b.date}-${b.entryTime ?? '00:00'}`))
    .forEach((trade) => {
      if (match(trade)) {
        current += 1;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    });
  return max;
}

function parseMonthKey(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return { year, month };
}

function daysInMonth(monthKey: string) {
  const { year, month } = parseMonthKey(monthKey);
  return new Date(year, month, 0).getDate();
}

function monthLabel(monthKey: string) {
  const { year, month } = parseMonthKey(monthKey);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function weekNumberInMonth(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return Math.floor((value.getDate() + new Date(value.getFullYear(), value.getMonth(), 1).getDay() - 1) / 7) + 1;
}

function heatmapTone(pnl: number, trades: number) {
  if (!trades) return 'border-slate-200 bg-white text-slate-400';
  if (pnl < 0) return 'border-red-200 bg-red-100 text-red-800';
  if (pnl === 0) return 'border-slate-200 bg-slate-100 text-slate-600';
  if (pnl < 1000) return 'border-emerald-200 bg-emerald-100 text-emerald-800';
  if (pnl < 2500) return 'border-emerald-300 bg-emerald-300 text-emerald-950';
  return 'border-emerald-700 bg-emerald-600 text-white';
}

function accountToForm(account: TradingFundingAccount) {
  return {
    provider: account.provider,
    accountName: account.accountName,
    accountType: account.accountType,
    iconLabel: account.iconLabel,
    status: account.status,
    purchaseDate: account.purchaseDate,
    deadlineDate: account.deadlineDate,
    minimumTradingDays: String(account.minimumTradingDays),
    completedTradingDays: String(account.completedTradingDays),
    accountSize: String(account.accountSize),
    startingBalance: String(account.startingBalance),
    currentBalance: String(account.currentBalance),
    purchaseFee: String(account.purchaseFee),
    resetFees: String(account.resetFees),
    monthlyFee: String(account.monthlyFee),
    profitTarget: String(account.profitTarget),
    maxDrawdownLimit: String(account.maxDrawdownLimit),
    dailyDrawdownLimit: String(account.dailyDrawdownLimit),
    currentDrawdownPct: String(account.currentDrawdownPct),
    platform: account.platform,
    accountNumber: account.accountNumber,
    notes: account.notes,
  };
}

function chipClass(tone: string) {
  const map: Record<string, string> = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    orange: 'border-orange-100 bg-orange-50 text-orange-700',
    purple: 'border-purple-100 bg-purple-50 text-purple-700',
    red: 'border-red-100 bg-red-50 text-red-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  };
  return map[tone] ?? map.slate;
}

function ChartPanel({ title, subtitle, children, className }: { title: string; subtitle: string; children: ReactNode; className?: string }) {
  return (
    <Card hover={false} className={cn('min-w-0', className)}>
      <div className="mb-4">
        <h2 className="text-section-title">{title}</h2>
        <p className="text-page-subtitle">{subtitle}</p>
      </div>
      {children}
    </Card>
  );
}

function AnalyticsTooltip() {
  return (
    <Tooltip
      cursor={{ stroke: '#38BDF8', strokeWidth: 1, strokeDasharray: '4 4' }}
      allowEscapeViewBox={{ x: true, y: true }}
      wrapperStyle={{ zIndex: 60, pointerEvents: 'none' }}
      contentStyle={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        color: '#0F172A',
        boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)',
        fontFamily: 'Inter',
        fontSize: 12,
      }}
      labelStyle={{ color: '#334155', fontWeight: 700 }}
    />
  );
}

function TerminalPanel({ title, children, className, action }: { title: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn('rounded-[8px] border border-slate-300 bg-white p-3 shadow-sm dark:border-[#18314d] dark:bg-[#07192b]', className)}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-inter text-[12px] font-extrabold leading-4 text-slate-900 dark:text-slate-100">{title}</h2>
        {action ?? <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-400 dark:border-[#254767] dark:text-slate-500">i</span>}
      </div>
      {children}
    </motion.div>
  );
}

function ScoreRing({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center justify-between rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#17314e] dark:bg-[#061426]">
      <span className="font-inter text-[11px] font-semibold text-slate-600 dark:text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <div className="grid h-12 w-12 place-items-center rounded-full" style={{ background: `conic-gradient(#3B82F6 ${pct * 3.6}deg, #17314e 0deg)` }}>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white font-inter text-[17px] font-extrabold text-blue-500 dark:bg-[#07192b]">{pct}</div>
        </div>
        <span className="font-inter text-[10px] leading-4 text-slate-500 dark:text-slate-400">/100<br />Score</span>
      </div>
    </div>
  );
}

function ImageDropZone({
  label,
  value,
  onPaste,
  onFile,
}: {
  label: string;
  value: string;
  onPaste: (event: ClipboardEvent<HTMLDivElement>) => void;
  onFile: (file?: File) => void;
}) {
  return (
    <div
      tabIndex={0}
      onPaste={onPaste}
      className="rounded-2xl border border-dashed border-border bg-slate-50/70 p-3 outline-none transition focus:border-primary-soft focus:bg-primary-pale/30"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-inter text-[12px] font-bold text-slate-700">{label}</span>
        <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-white px-3 font-inter text-[11px] font-bold text-slate-700 transition hover:border-primary-soft hover:text-primary">
          <Upload size={13} />
          Upload
          <input className="hidden" type="file" accept="image/*" onChange={(event) => onFile(event.target.files?.[0])} />
        </label>
      </div>
      {value ? (
        <img src={value} alt={label} className="h-36 w-full rounded-xl object-cover" />
      ) : (
        <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-border bg-white text-center">
          <ImageIcon size={22} className="text-slate-400" />
          <p className="mt-2 font-kanit text-[12px] leading-5 text-slate-500">Click here and press Ctrl+V to paste a chart image.</p>
        </div>
      )}
    </div>
  );
}

export function TradingPage() {
  const trading = useTrading();
  const { addTrade, updateTrade, addFundingAccount, updateFundingAccount } = useTradingStore();
  const addToast = useAppStore((state) => state.addToast);
  const allAccounts = trading.fundingAccounts;
  const allTrades = trading.trades;
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeEntry | null>(null);
  const [tradeForm, setTradeForm] = useState(initialTradeForm);
  const [accountForm, setAccountForm] = useState(initialAccountForm);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [heatmapMonth, setHeatmapMonth] = useState('All');
  const [calendarAccountFilter, setCalendarAccountFilter] = useState('All');
  const [customChecklist, setCustomChecklist] = useState('');
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  const [accountDetailOpen, setAccountDetailOpen] = useState(false);
  const [accountScopeFilters, setAccountScopeFilters] = useState<{
    account: string;
    provider: string;
    accountType: string;
    accountStatus: string;
    symbol: string;
    direction: string;
    outcome: string;
    setup: string;
    session: string;
    emotion: string;
    hasScreenshot: string;
    assetType: string;
    mistakeTag: string;
    checklistStatus: string;
    reviewed: string;
    riskLevel: string;
    sort: string;
    dateRange: AccountScopeDateRange;
  }>({
    account: 'All',
    provider: 'All',
    accountType: 'All',
    accountStatus: 'All',
    symbol: 'All',
    direction: 'All',
    outcome: 'All',
    setup: 'All',
    session: 'All',
    emotion: 'All',
    hasScreenshot: 'All',
    assetType: 'All',
    mistakeTag: 'All',
    checklistStatus: 'All',
    reviewed: 'All',
    riskLevel: 'All',
    sort: 'date-desc',
    dateRange: 'All',
  });
  const [accountCalendarMonth, setAccountCalendarMonth] = useState('2026-06');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-06-18');
  const [selectedDayTradeId, setSelectedDayTradeId] = useState<string | null>(null);
  const [accountPanelTab, setAccountPanelTab] = useState<'overview' | 'rules' | 'cfd' | 'futures'>('overview');

  const accountOptions = useMemo(
    () => [
      { label: 'All accounts', value: 'All' },
      { label: 'Unlinked', value: 'Unlinked' },
      ...allAccounts.map((account) => ({ label: account.accountName, value: account.id })),
    ],
    [allAccounts],
  );

  const monthOptions = useMemo(() => {
    const months = Array.from(new Set(allTrades.map((trade) => trade.date.slice(0, 7)))).sort().reverse();
    return ['All', ...months];
  }, [allTrades]);

  const calendarAccountOptions = useMemo(
    () => [
      { label: 'All Accounts', value: 'All' },
      ...allAccounts.map((account) => ({ label: account.accountName, value: account.id })),
      { label: 'Unlinked Trades', value: 'Unlinked' },
    ],
    [allAccounts],
  );

  const fundingAccountById = useMemo(() => new Map(allAccounts.map((account) => [account.id, account])), [allAccounts]);

  const providerOptions = useMemo(
    () => ['All', ...Array.from(new Set(allAccounts.map((account) => account.provider))).sort()],
    [allAccounts],
  );
  const accountTypeOptions = useMemo(
    () => ['All', ...Array.from(new Set(allAccounts.map((account) => account.accountType))).sort()],
    [allAccounts],
  );
  const accountStatusOptions = useMemo(
    () => ['All', ...Array.from(new Set(allAccounts.map((account) => account.status))).sort()],
    [allAccounts],
  );

  const accountScopeAnchorDate = useMemo(() => {
    const ordered = allTrades.filter((trade) => trade.status === 'Closed').sort((a, b) => a.date.localeCompare(b.date));
    const latestTradeDate = (ordered.length ? ordered[ordered.length - 1] : null)?.date ?? '2026-06-18';
    return new Date(`${latestTradeDate}T00:00:00`);
  }, [allTrades]);

  const filteredTrades = useMemo(() => {
    const rows = allTrades.filter((trade) => {
      const linkedAccount = trade.fundingAccountId ? fundingAccountById.get(trade.fundingAccountId) : null;
      const matchAccount =
        accountScopeFilters.account === 'All'
          ? true
          : accountScopeFilters.account === 'Unlinked'
            ? !trade.fundingAccountId
            : trade.fundingAccountId === accountScopeFilters.account;
      const matchProvider = accountScopeFilters.provider === 'All' || linkedAccount?.provider === accountScopeFilters.provider;
      const matchAccountType = accountScopeFilters.accountType === 'All' || linkedAccount?.accountType === accountScopeFilters.accountType;
      const matchAccountStatus = accountScopeFilters.accountStatus === 'All' || linkedAccount?.status === accountScopeFilters.accountStatus;
      const matchSymbol = accountScopeFilters.symbol === 'All' || trade.symbol === accountScopeFilters.symbol;
      const matchDirection = accountScopeFilters.direction === 'All' || trade.direction === accountScopeFilters.direction;
      const matchOutcome = accountScopeFilters.outcome === 'All' || resultName(trade) === accountScopeFilters.outcome;
      const matchSetup = accountScopeFilters.setup === 'All' || trade.setup === accountScopeFilters.setup;
      const matchSession = accountScopeFilters.session === 'All' || trade.session === accountScopeFilters.session;
      const matchEmotion = accountScopeFilters.emotion === 'All' || trade.emotion === accountScopeFilters.emotion;
      const matchAssetType = accountScopeFilters.assetType === 'All' || assetTypeForSymbol(trade.symbol) === accountScopeFilters.assetType;
      const matchMistakeTag = accountScopeFilters.mistakeTag === 'All' || (trade.mistakeTags ?? ['None']).includes(accountScopeFilters.mistakeTag as TradingMistakeTag);
      const matchChecklist = accountScopeFilters.checklistStatus === 'All' || checklistStatus(trade) === accountScopeFilters.checklistStatus;
      const reviewed = isReviewedTrade(trade);
      const matchReviewed = accountScopeFilters.reviewed === 'All' || (accountScopeFilters.reviewed === 'Reviewed' ? reviewed : !reviewed);
      const hasScreenshot = Boolean(trade.preTradeImageUrl || trade.postTradeImageUrl || trade.screenshotUrl);
      const matchScreenshot =
        accountScopeFilters.hasScreenshot === 'All'
          ? true
          : accountScopeFilters.hasScreenshot === 'Yes'
            ? hasScreenshot
            : !hasScreenshot;
      const riskPct = linkedAccount?.currentBalance ? (trade.riskAmount / linkedAccount.currentBalance) * 100 : 0;
      const matchRisk =
        accountScopeFilters.riskLevel === 'All'
          ? true
          : accountScopeFilters.riskLevel === 'High'
            ? riskPct >= 1
            : accountScopeFilters.riskLevel === 'Medium'
              ? riskPct >= 0.5 && riskPct < 1
              : riskPct < 0.5;
      const matchDate = isDateInRange(trade.date, accountScopeFilters.dateRange, accountScopeAnchorDate);
      return (
        matchAccount &&
        matchProvider &&
        matchAccountType &&
        matchAccountStatus &&
        matchSymbol &&
        matchDirection &&
        matchOutcome &&
        matchSetup &&
        matchSession &&
        matchEmotion &&
        matchAssetType &&
        matchMistakeTag &&
        matchChecklist &&
        matchReviewed &&
        matchScreenshot &&
        matchRisk &&
        matchDate
      );
    });

    return sortTrades(rows, accountScopeFilters.sort);
  }, [
    accountScopeAnchorDate,
    accountScopeFilters.account,
    accountScopeFilters.accountStatus,
    accountScopeFilters.accountType,
    accountScopeFilters.assetType,
    accountScopeFilters.checklistStatus,
    accountScopeFilters.dateRange,
    accountScopeFilters.direction,
    accountScopeFilters.emotion,
    accountScopeFilters.hasScreenshot,
    accountScopeFilters.mistakeTag,
    accountScopeFilters.outcome,
    accountScopeFilters.provider,
    accountScopeFilters.reviewed,
    accountScopeFilters.riskLevel,
    accountScopeFilters.session,
    accountScopeFilters.setup,
    accountScopeFilters.sort,
    accountScopeFilters.symbol,
    fundingAccountById,
    allTrades,
  ]);

  const scopedClosedTrades = useMemo(() => filteredTrades.filter((trade) => trade.status === 'Closed'), [filteredTrades]);

  const accountMetricsMap = useMemo(() => {
    const map = new Map<string, {
      closedTrades: TradeEntry[];
      totalTrades: number;
      wins: number;
      losses: number;
      be: number;
      winRate: number;
      lossRate: number;
      beRate: number;
      grossPnl: number;
      netPnl: number;
      totalR: number;
      avgR: number;
      profitFactor: number;
      averageWin: number;
      averageLoss: number;
      bestTrade: number;
      worstTrade: number;
      maxConsecutiveWins: number;
      maxConsecutiveLosses: number;
      registrationFee: number;
      resetFee: number;
      activationFee: number;
      monthlyFee: number;
      totalCost: number;
      netAfterCost: number;
      refundableStatus: string;
      costToProfit: number;
      equityDelta: number;
      remainingDrawdown: number;
      remainingTradingDays: number;
      ruleWarning: boolean;
      daysRemaining: number;
    }>();

    allAccounts.forEach((account) => {
      const accountClosedTrades = scopedClosedTrades.filter((trade) => trade.fundingAccountId === account.id);
      const wins = accountClosedTrades.filter((trade) => trade.resultR > 0);
      const losses = accountClosedTrades.filter((trade) => trade.resultR < 0);
      const be = accountClosedTrades.filter((trade) => trade.resultR === 0);
      const grossPnl = wins.reduce((sum, trade) => sum + tradeProfit(trade), 0);
      const lossAbs = Math.abs(losses.reduce((sum, trade) => sum + tradeProfit(trade), 0));
      const netPnl = accountClosedTrades.reduce((sum, trade) => sum + tradeProfit(trade), 0);
      const totalR = accountClosedTrades.reduce((sum, trade) => sum + trade.resultR, 0);
      const totalCost = account.purchaseFee + account.resetFees + account.monthlyFee;
      const equityDelta = account.currentBalance - account.startingBalance;
      const drawdownUsed = Math.max(0, account.startingBalance - account.currentBalance);
      const remainingDrawdown = Math.max(0, account.maxDrawdownLimit - drawdownUsed);
      const daysRemaining = daysUntil(account.deadlineDate);
      const remainingTradingDays = Math.max(0, account.minimumTradingDays - account.completedTradingDays);
      const ruleWarning = remainingDrawdown <= 0 || daysRemaining < 0 || (daysRemaining <= 5 && account.status !== 'Passed' && account.status !== 'Funded');

      map.set(account.id, {
        closedTrades: accountClosedTrades,
        totalTrades: accountClosedTrades.length,
        wins: wins.length,
        losses: losses.length,
        be: be.length,
        winRate: accountClosedTrades.length ? Number(((wins.length / accountClosedTrades.length) * 100).toFixed(2)) : 0,
        lossRate: accountClosedTrades.length ? Number(((losses.length / accountClosedTrades.length) * 100).toFixed(2)) : 0,
        beRate: accountClosedTrades.length ? Number(((be.length / accountClosedTrades.length) * 100).toFixed(2)) : 0,
        grossPnl: Math.round(grossPnl),
        netPnl: Math.round(netPnl),
        totalR: Number(totalR.toFixed(2)),
        avgR: accountClosedTrades.length ? Number((totalR / accountClosedTrades.length).toFixed(2)) : 0,
        profitFactor: lossAbs ? Number((grossPnl / lossAbs).toFixed(2)) : wins.length ? 99 : 0,
        averageWin: wins.length ? Math.round(grossPnl / wins.length) : 0,
        averageLoss: losses.length ? Math.round(losses.reduce((sum, trade) => sum + tradeProfit(trade), 0) / losses.length) : 0,
        bestTrade: accountClosedTrades.length ? Math.round(Math.max(...accountClosedTrades.map((trade) => tradeProfit(trade)))) : 0,
        worstTrade: accountClosedTrades.length ? Math.round(Math.min(...accountClosedTrades.map((trade) => tradeProfit(trade)))) : 0,
        maxConsecutiveWins: longestStreak(accountClosedTrades, (trade) => trade.resultR > 0),
        maxConsecutiveLosses: longestStreak(accountClosedTrades, (trade) => trade.resultR < 0),
        registrationFee: account.purchaseFee,
        resetFee: account.resetFees,
        activationFee: 0,
        monthlyFee: account.monthlyFee,
        totalCost: Math.round(totalCost),
        netAfterCost: Math.round(equityDelta - totalCost),
        refundableStatus: account.status === 'Passed' || account.status === 'Funded' ? 'Refundable' : 'Non-refundable',
        costToProfit: grossPnl > 0 ? Number(((totalCost / grossPnl) * 100).toFixed(2)) : 0,
        equityDelta: Math.round(equityDelta),
        remainingDrawdown: Math.round(remainingDrawdown),
        remainingTradingDays,
        ruleWarning,
        daysRemaining,
      });
    });

    return map;
  }, [allAccounts, scopedClosedTrades]);

  const visibleFundingAccounts = useMemo(() => {
    return allAccounts.filter((account) => {
      const matchProvider = accountScopeFilters.provider === 'All' || account.provider === accountScopeFilters.provider;
      const matchType = accountScopeFilters.accountType === 'All' || account.accountType === accountScopeFilters.accountType;
      const matchStatus = accountScopeFilters.accountStatus === 'All' || account.status === accountScopeFilters.accountStatus;
      return matchProvider && matchType && matchStatus;
    });
  }, [
    accountScopeFilters.accountStatus,
    accountScopeFilters.accountType,
    accountScopeFilters.provider,
    allAccounts,
  ]);

  const accountScopeKpis = useMemo(() => {
    const accounts = visibleFundingAccounts;
    const scopedAccountIds =
      accountScopeFilters.account === 'All'
        ? accounts.map((account) => account.id)
        : accountScopeFilters.account === 'Unlinked'
          ? []
          : [accountScopeFilters.account];

    const scopedStats = scopedAccountIds.map((id) => accountMetricsMap.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
    const totalTrades = scopedStats.reduce((sum, item) => sum + item.totalTrades, 0);
    const wins = scopedStats.reduce((sum, item) => sum + item.wins, 0);
    const losses = scopedStats.reduce((sum, item) => sum + item.losses, 0);
    const be = scopedStats.reduce((sum, item) => sum + item.be, 0);
    const gross = scopedStats.reduce((sum, item) => sum + item.grossPnl, 0);
    const net = scopedStats.reduce((sum, item) => sum + item.netPnl, 0);
    const totalCost = scopedStats.reduce((sum, item) => sum + item.totalCost, 0);
    const warnings = scopedStats.filter((item) => item.ruleWarning).length;
    const passed = accounts.filter((account) => ['Passed', 'Funded'].includes(account.status)).length;
    return {
      totalTrades,
      winRate: totalTrades ? Number(((wins / totalTrades) * 100).toFixed(2)) : 0,
      lossRate: totalTrades ? Number(((losses / totalTrades) * 100).toFixed(2)) : 0,
      beRate: totalTrades ? Number(((be / totalTrades) * 100).toFixed(2)) : 0,
      gross,
      net,
      totalCost,
      warnings,
      passed,
    };
  }, [accountMetricsMap, accountScopeFilters.account, allAccounts.length, visibleFundingAccounts]);

  const tradingHeatmap = useMemo(() => {
    const month = heatmapMonth === 'All' ? (monthOptions.find((item) => item !== 'All') ?? '2026-06') : heatmapMonth;
    const rowDefs = [
      { id: 'asia', label: 'Asia Session', match: (trade: TradeEntry) => trade.session === 'Asia' },
      { id: 'london', label: 'London Session', match: (trade: TradeEntry) => trade.session === 'London' },
      { id: 'ny', label: 'New York Session', match: (trade: TradeEntry) => trade.session === 'New York' },
      { id: 'overlap', label: 'Overlap Session', match: (trade: TradeEntry) => trade.session === 'Overlap' },
      { id: 'buy', label: 'Buy / Long', match: (trade: TradeEntry) => trade.direction === 'Long' },
      { id: 'short', label: 'Short / Sell', match: (trade: TradeEntry) => trade.direction === 'Short' },
    ];

    return {
      month,
      days: daysInMonth(month),
      rows: rowDefs.map((row) => ({
        ...row,
        cells: Array.from({ length: 31 }, (_, index) => {
          const day = index + 1;
          const date = `${month}-${String(day).padStart(2, '0')}`;
          const trades = day <= daysInMonth(month) ? scopedClosedTrades.filter((trade) => trade.date === date && row.match(trade)) : [];
          const pnl = trades.reduce((sum, trade) => sum + tradeProfit(trade), 0);
          const r = trades.reduce((sum, trade) => sum + trade.resultR, 0);
          return { date, day, trades, pnl, r, disabled: day > daysInMonth(month) };
        }),
      })),
    };
  }, [heatmapMonth, monthOptions, scopedClosedTrades]);

  const accountCalendar = useMemo(() => {
    const rows = trading.closedTrades.filter((trade) =>
      calendarAccountFilter === 'All'
        ? true
        : calendarAccountFilter === 'Unlinked'
          ? !trade.fundingAccountId
          : trade.fundingAccountId === calendarAccountFilter,
    );
    const dates = Array.from(new Set(rows.map((trade) => trade.date))).sort();
    return dates.slice(-21).map((date) => {
      const dayTrades = rows.filter((trade) => trade.date === date);
      const pnl = dayTrades.reduce((sum, trade) => sum + tradeProfit(trade), 0);
      const r = dayTrades.reduce((sum, trade) => sum + trade.resultR, 0);
      return {
        date,
        weekday: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
        trades: dayTrades.length,
        pnl,
        r,
        winners: dayTrades.filter((trade) => trade.resultR > 0).length,
        losses: dayTrades.filter((trade) => trade.resultR < 0).length,
      };
    });
  }, [calendarAccountFilter, trading.closedTrades]);

  const setTradeImageFromFile = (field: 'preTradeImageUrl' | 'postTradeImageUrl', file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast({ title: 'Image only', description: 'Please choose or paste an image file.', type: 'warning' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setTradeForm((current) => ({ ...current, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handlePasteImage = (field: 'preTradeImageUrl' | 'postTradeImageUrl', event: ClipboardEvent<HTMLDivElement>) => {
    const imageFile = Array.from(event.clipboardData.files).find((file) => file.type.startsWith('image/'));
    if (!imageFile) return;
    event.preventDefault();
    setTradeImageFromFile(field, imageFile);
  };

  const toggleChecklist = (item: string) => {
    setTradeForm((current) => ({
      ...current,
      checklistItems: current.checklistItems.includes(item)
        ? current.checklistItems.filter((value) => value !== item)
        : [...current.checklistItems, item],
    }));
  };

  const addChecklist = () => {
    const next = customChecklist.trim();
    if (!next) return;
    setTradeForm((current) => ({ ...current, checklistItems: current.checklistItems.includes(next) ? current.checklistItems : [...current.checklistItems, next] }));
    setCustomChecklist('');
  };

  const saveTrade = () => {
    if (!tradeForm.symbol.trim() || !tradeForm.setup.trim()) {
      addToast({ title: 'Trade needs core data', description: 'Please add symbol and setup before saving.', type: 'warning' });
      return;
    }

    const checklistItems = tradeForm.checklistItems.length ? tradeForm.checklistItems : [];
    const nextTrade: Omit<TradeEntry, 'id'> = {
      fundingAccountId: tradeForm.fundingAccountId || undefined,
      date: tradeForm.date,
      entryTime: tradeForm.entryTime,
      exitTime: tradeForm.exitTime,
      symbol: tradeForm.symbol,
      direction: tradeForm.direction,
      session: tradeForm.session,
      timeframe: tradeForm.timeframe,
      setup: tradeForm.setup,
      entryPrice: parseNumber(tradeForm.entryPrice),
      stopLoss: parseNumber(tradeForm.stopLoss),
      takeProfit: parseNumber(tradeForm.takeProfit),
      exitPrice: tradeForm.exitPrice ? parseNumber(tradeForm.exitPrice) : undefined,
      riskAmount: parseNumber(tradeForm.riskAmount),
      commission: parseNumber(tradeForm.commission),
      resultR: parseNumber(tradeForm.resultR),
      mfeR: parseNumber(tradeForm.mfeR),
      maeR: parseNumber(tradeForm.maeR),
      rrTarget: parseNumber(tradeForm.rrTarget),
      confidenceScore: parseNumber(tradeForm.confidenceScore),
      status: tradeForm.status,
      emotion: tradeForm.emotion,
      mistakeTags: tradeForm.mistakeTags.length ? tradeForm.mistakeTags : ['None'],
      ruleFollowed: tradeForm.ruleFollowed,
      exitReason: tradeForm.exitReason,
      preTradeImageUrl: tradeForm.preTradeImageUrl,
      postTradeImageUrl: tradeForm.postTradeImageUrl,
      checklistItems,
      checklistPassed: tradeForm.checklistPassed && checklistItems.length >= 3,
      notes: tradeForm.notes,
    };

    if (editingTradeId) {
      updateTrade(editingTradeId, nextTrade);
    } else {
      addTrade(nextTrade);
    }
    setHeatmapMonth('All');
    setTradeModalOpen(false);
    setTradeForm(initialTradeForm);
    setEditingTradeId(null);
    addToast({
      title: editingTradeId ? 'Trade updated' : 'Saved successfully',
      description: editingTradeId ? 'Linked account metrics, calendar, and charts were refreshed.' : 'Filters were reset so the newest trade is visible in Trading+.',
    });
  };

  const saveAccount = () => {
    if (!accountForm.accountName.trim() || !accountForm.provider.trim()) {
      addToast({ title: 'Account needs data', description: 'Please add provider and account name before saving.', type: 'warning' });
      return;
    }

    const nextAccount: Omit<TradingFundingAccount, 'id'> = {
      provider: accountForm.provider,
      accountName: accountForm.accountName,
      accountType: accountForm.accountType,
      iconUrl: '',
      iconLabel: accountForm.iconLabel || accountForm.provider.slice(0, 2).toUpperCase(),
      status: accountForm.status,
      purchaseDate: accountForm.purchaseDate,
      deadlineDate: accountForm.deadlineDate,
      minimumTradingDays: parseNumber(accountForm.minimumTradingDays),
      completedTradingDays: parseNumber(accountForm.completedTradingDays),
      accountSize: parseNumber(accountForm.accountSize),
      startingBalance: parseNumber(accountForm.startingBalance),
      currentBalance: parseNumber(accountForm.currentBalance),
      purchaseFee: parseNumber(accountForm.purchaseFee),
      resetFees: parseNumber(accountForm.resetFees),
      monthlyFee: parseNumber(accountForm.monthlyFee),
      profitTarget: parseNumber(accountForm.profitTarget),
      maxDrawdownLimit: parseNumber(accountForm.maxDrawdownLimit),
      dailyDrawdownLimit: parseNumber(accountForm.dailyDrawdownLimit),
      currentDrawdownPct: parseNumber(accountForm.currentDrawdownPct),
      currency: 'USD',
      platform: accountForm.platform,
      accountNumber: accountForm.accountNumber,
      notes: accountForm.notes,
    };

    if (editingAccountId) {
      updateFundingAccount(editingAccountId, nextAccount);
    } else {
      addFundingAccount(nextAccount);
    }
    setAccountModalOpen(false);
    setAccountForm(initialAccountForm);
    setEditingAccountId(null);
    addToast({
      title: editingAccountId ? 'Account updated' : 'Account added',
      description: 'Funding monitor, account filters, and Add Trade account list were updated.',
    });
  };

  const openNewTradeModal = (defaults?: Partial<typeof initialTradeForm>) => {
    setEditingTradeId(null);
    setTradeForm({ ...initialTradeForm, ...defaults });
    setTradeModalOpen(true);
  };

  const openNewAccountModal = () => {
    setEditingAccountId(null);
    setAccountForm(initialAccountForm);
    setAccountModalOpen(true);
  };

  const openEditTradeModal = (trade: TradeEntry) => {
    setEditingTradeId(trade.id);
    setTradeForm(tradeToForm(trade));
    setTradeModalOpen(true);
  };

  const openEditAccountModal = (account: TradingFundingAccount) => {
    setEditingAccountId(account.id);
    setAccountForm(accountToForm(account));
    setAccountModalOpen(true);
  };

  const selectedAccount = allAccounts.find((account) => account.id === expandedAccountId) ?? null;
  const activeAccount =
    selectedAccount ??
    (accountScopeFilters.account === 'Unlinked'
      ? null
      : accountScopeFilters.account !== 'All'
        ? allAccounts.find((account) => account.id === accountScopeFilters.account) ?? null
        : visibleFundingAccounts[0] ?? allAccounts[0] ?? null);
  const totalCapital = visibleFundingAccounts.reduce((sum, account) => sum + account.accountSize, 0);
  const scopedWinners = scopedClosedTrades.filter((trade) => trade.resultR > 0);
  const scopedLosers = scopedClosedTrades.filter((trade) => trade.resultR < 0);
  const scopedBreakeven = scopedClosedTrades.filter((trade) => trade.resultR === 0);
  const avgWin = scopedWinners.length ? scopedWinners.reduce((sum, trade) => sum + tradeProfit(trade), 0) / scopedWinners.length : 0;
  const avgLoss = scopedLosers.length ? scopedLosers.reduce((sum, trade) => sum + tradeProfit(trade), 0) / scopedLosers.length : 0;
  const bestTrade = scopedClosedTrades.length ? Math.max(...scopedClosedTrades.map((trade) => tradeProfit(trade))) : 0;
  const worstTrade = scopedClosedTrades.length ? Math.min(...scopedClosedTrades.map((trade) => tradeProfit(trade))) : 0;
  const scopedNetPnl = scopedClosedTrades.reduce((sum, trade) => sum + tradeProfit(trade), 0);
  const scopedTotalR = scopedClosedTrades.reduce((sum, trade) => sum + trade.resultR, 0);
  const scopedGrossWin = scopedWinners.reduce((sum, trade) => sum + tradeProfit(trade), 0);
  const scopedGrossLoss = Math.abs(scopedLosers.reduce((sum, trade) => sum + tradeProfit(trade), 0));
  const scopedProfitFactor = scopedGrossLoss ? Number((scopedGrossWin / scopedGrossLoss).toFixed(2)) : scopedWinners.length ? 99 : 0;
  const scopedWinRate = safePercent(scopedWinners.length, scopedClosedTrades.length);
  const scopedDisciplineScore = scopedClosedTrades.length ? safePercent(scopedClosedTrades.filter((trade) => trade.ruleFollowed).length, scopedClosedTrades.length) : 0;
  const scopedCommissionTotal = scopedClosedTrades.reduce((sum, trade) => sum + (trade.commission ?? 0), 0);
  const benchmarkBase = activeAccount?.startingBalance ?? allAccounts[0]?.startingBalance ?? trading.account.balance;
  const benchmarkCurve = scopedClosedTrades.reduce((rows, trade, index) => {
    const previousEquity = rows[index - 1]?.equity ?? benchmarkBase;
    rows.push({
      day: trade.date.slice(5),
      equity: Math.round(previousEquity + tradeProfit(trade)),
      benchmark: Math.round(benchmarkBase + index * 260 + Math.sin(index / 2) * 520),
      buyHold: Math.round(benchmarkBase + index * 150),
    });
    return rows;
  }, [] as { day: string; equity: number; benchmark: number; buyHold: number }[]);
  const monthlyPnl = Array.from(
    scopedClosedTrades.reduce((map, trade) => {
      const month = new Date(`${trade.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short' });
      map.set(month, (map.get(month) ?? 0) + tradeProfit(trade));
      return map;
    }, new Map<string, number>()),
    ([month, pnl]) => ({ month, pnl: Math.round(pnl) }),
  );
  const rDistribution = [
    { bucket: '< -2R', value: scopedClosedTrades.filter((trade) => trade.resultR < -2).length },
    { bucket: '-2R to -1R', value: scopedClosedTrades.filter((trade) => trade.resultR >= -2 && trade.resultR < -1).length },
    { bucket: '-1R to 0R', value: scopedClosedTrades.filter((trade) => trade.resultR >= -1 && trade.resultR < 0).length },
    { bucket: '0R to 1R', value: scopedClosedTrades.filter((trade) => trade.resultR >= 0 && trade.resultR < 1).length },
    { bucket: '1R to 2R', value: scopedClosedTrades.filter((trade) => trade.resultR >= 1 && trade.resultR < 2).length },
    { bucket: '2R to 3R', value: scopedClosedTrades.filter((trade) => trade.resultR >= 2 && trade.resultR < 3).length },
    { bucket: '>3R', value: scopedClosedTrades.filter((trade) => trade.resultR >= 3).length },
  ];
  const scopedSortedClosedTrades = sortTrades(scopedClosedTrades, 'date-asc');
  const streakData = scopedSortedClosedTrades.map((trade, index) => ({
    day: trade.date.slice(5),
    win: scopedSortedClosedTrades.slice(0, index + 1).filter((item) => item.resultR > 0).length,
    loss: scopedSortedClosedTrades.slice(0, index + 1).filter((item) => item.resultR < 0).length,
  }));
  const groupedSessionStats = Array.from(
    scopedClosedTrades.reduce((map, trade) => {
      const current = map.get(trade.session) ?? { session: trade.session, trades: 0, wins: 0, netPnl: 0, netR: 0 };
      map.set(trade.session, {
        session: trade.session,
        trades: current.trades + 1,
        wins: current.wins + (trade.resultR > 0 ? 1 : 0),
        netPnl: current.netPnl + tradeProfit(trade),
        netR: current.netR + trade.resultR,
      });
      return map;
    }, new Map<string, { session: TradingSession; trades: number; wins: number; netPnl: number; netR: number }>()),
    ([, value]) => ({
      ...value,
      winRate: safePercent(value.wins, value.trades),
      avgR: value.trades ? Number((value.netR / value.trades).toFixed(2)) : 0,
    }),
  );
  const groupedSetupStats = Array.from(
    scopedClosedTrades.reduce((map, trade) => {
      const current = map.get(trade.setup) ?? { setup: trade.setup, trades: 0, wins: 0, netPnl: 0, netR: 0 };
      map.set(trade.setup, {
        setup: trade.setup,
        trades: current.trades + 1,
        wins: current.wins + (trade.resultR > 0 ? 1 : 0),
        netPnl: current.netPnl + tradeProfit(trade),
        netR: current.netR + trade.resultR,
      });
      return map;
    }, new Map<string, { setup: string; trades: number; wins: number; netPnl: number; netR: number }>()),
    ([, value]) => ({
      ...value,
      winRate: safePercent(value.wins, value.trades),
      avgR: value.trades ? Number((value.netR / value.trades).toFixed(2)) : 0,
    }),
  ).sort((a, b) => b.netPnl - a.netPnl);
  const groupedAssetPerformance = Array.from(
    scopedClosedTrades.reduce((map, trade) => {
      const current = map.get(trade.symbol) ?? { name: trade.symbol, value: 0, netPnl: 0, netR: 0, wins: 0 };
      map.set(trade.symbol, {
        name: trade.symbol,
        value: current.value + 1,
        netPnl: current.netPnl + tradeProfit(trade),
        netR: current.netR + trade.resultR,
        wins: current.wins + (trade.resultR > 0 ? 1 : 0),
      });
      return map;
    }, new Map<string, { name: string; value: number; netPnl: number; netR: number; wins: number }>()),
    ([, value]) => value,
  ).sort((a, b) => b.netPnl - a.netPnl);
  const scopedMaeMfeData = scopedClosedTrades.map((trade) => ({
    symbol: trade.symbol,
    setup: trade.setup,
    session: trade.session,
    result: resultName(trade),
    mae: -(trade.maeR ?? 0),
    mfe: trade.mfeR ?? 0,
    pnl: tradeProfit(trade),
    r: trade.resultR,
  }));
  const scopedWinLossBreakEven = [
    { name: 'Win', value: scopedWinners.length, color: '#22C55E' },
    { name: 'Loss', value: scopedLosers.length, color: '#EF4444' },
    { name: 'BE', value: scopedBreakeven.length, color: '#94A3B8' },
  ];
  const scopedDrawdownCurve = scopedSortedClosedTrades.reduce((rows, trade) => {
    const previousEquity = rows[rows.length - 1]?.equity ?? benchmarkBase;
    const equity = previousEquity + tradeProfit(trade);
    const previousPeak = rows[rows.length - 1]?.peak ?? benchmarkBase;
    const peak = Math.max(previousPeak, equity);
    rows.push({
      day: trade.date.slice(5),
      equity: Math.round(equity),
      peak: Math.round(peak),
      drawdownPct: peak ? Number((((equity - peak) / peak) * 100).toFixed(2)) : 0,
      drawdown: Math.round(equity - peak),
      pnl: Math.round(tradeProfit(trade)),
    });
    return rows;
  }, [] as { day: string; equity: number; peak: number; drawdownPct: number; drawdown: number; pnl: number }[]);
  const scopedRrrData = scopedClosedTrades.map((trade) => ({
    symbol: trade.symbol,
    setup: trade.setup,
    planned: plannedRrr(trade),
    actual: actualRrr(trade),
    realized: trade.resultR,
    pnl: tradeProfit(trade),
    result: resultName(trade),
  }));
  const scopedEmotionStats = Array.from(
    scopedClosedTrades.reduce((map, trade) => {
      const current = map.get(trade.emotion) ?? { emotion: trade.emotion, trades: 0, wins: 0, netPnl: 0, totalR: 0, mistakes: 0 };
      const mistakeCount = (trade.mistakeTags ?? []).filter((tag) => tag !== 'None').length;
      map.set(trade.emotion, {
        emotion: trade.emotion,
        trades: current.trades + 1,
        wins: current.wins + (trade.resultR > 0 ? 1 : 0),
        netPnl: current.netPnl + tradeProfit(trade),
        totalR: current.totalR + trade.resultR,
        mistakes: current.mistakes + mistakeCount,
      });
      return map;
    }, new Map<string, { emotion: TradingEmotion; trades: number; wins: number; netPnl: number; totalR: number; mistakes: number }>()),
    ([, value]) => ({
      ...value,
      winRate: safePercent(value.wins, value.trades),
      avgR: value.trades ? Number((value.totalR / value.trades).toFixed(2)) : 0,
    }),
  ).sort((a, b) => b.trades - a.trades);
  const commissionImpactData = [
    { label: 'Gross PnL', value: Math.round(scopedGrossWin - scopedGrossLoss), fill: scopedNetPnl >= 0 ? '#22C55E' : '#EF4444' },
    { label: 'Commission', value: Math.round(scopedCommissionTotal), fill: '#F59E0B' },
    { label: 'Net PnL', value: Math.round(scopedNetPnl), fill: scopedNetPnl >= 0 ? '#16A34A' : '#EF4444' },
  ];
  const bestConditions = groupedSessionStats.filter((item) => item.netPnl >= 0).sort((a, b) => b.netPnl - a.netPnl).slice(0, 3);
  const worstConditions = groupedSessionStats.filter((item) => item.netPnl < 0).sort((a, b) => a.netPnl - b.netPnl).slice(0, 3);

  useEffect(() => {
    if (!activeAccount) return;
    const dates = Array.from(
      new Set(
        (accountScopeFilters.account === 'All' ? scopedClosedTrades : scopedClosedTrades.filter((trade) => trade.fundingAccountId === activeAccount.id)).map(
          (trade) => trade.date,
        ),
      ),
    ).sort();
    const fallbackDate = dates[dates.length - 1] ?? activeAccount.purchaseDate;
    const fallbackMonth = fallbackDate.slice(0, 7);
    setAccountCalendarMonth((current) => (dates.some((date) => date.startsWith(current)) ? current : fallbackMonth));
    setSelectedCalendarDate((current) => (dates.includes(current) ? current : fallbackDate));
  }, [accountScopeFilters.account, activeAccount, scopedClosedTrades]);

  useEffect(() => {
    if (!activeAccount) return;
    const dayTrades = filteredTrades
      .filter((trade) => (accountScopeFilters.account === 'All' || trade.fundingAccountId === activeAccount.id) && trade.date === selectedCalendarDate)
      .sort((a, b) => (`${a.date}-${a.entryTime ?? '00:00'}`).localeCompare(`${b.date}-${b.entryTime ?? '00:00'}`));
    setSelectedDayTradeId((current) => (dayTrades.some((trade) => trade.id === current) ? current : dayTrades[0]?.id ?? null));
  }, [accountScopeFilters.account, activeAccount, filteredTrades, selectedCalendarDate]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Trading+"
        subtitle="Performance cockpit for prop accounts, trade journals, drawdown, heatmap, and execution review."
        actions={
          <>
            <Button variant="secondary" icon={<Plus size={16} />} onClick={openNewAccountModal}>Add Account</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Filtered Trades" value={filteredTrades.length} helper={`${scopedClosedTrades.length} closed trades in current command center scope`} tone="blue" icon={<BarChart3 size={18} />} />
        <KpiCard label="Win Rate" value={scopedWinRate} suffix="%" helper={`${scopedWinners.length} wins / ${scopedClosedTrades.length} closed`} tone="green" />
        <KpiCard label="Net PnL" value={signedMoney(scopedNetPnl)} helper={`${scopedTotalR.toFixed(2)}R from filtered closed trades`} tone={scopedNetPnl >= 0 ? 'green' : 'red'} />
        <KpiCard label="Discipline" value={scopedDisciplineScore} suffix="%" helper="Rule-following score from filtered trades" tone="purple" />
      </div>

      <Card hover={false} className="overflow-hidden border-slate-200 bg-white">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone="blue">Prop Firm Workflow</Badge>
            <h2 className="mt-3 font-inter text-[24px] font-extrabold leading-8 text-slate-950">Prop Firm & Broker Accounts</h2>
            <p className="mt-1 font-kanit text-[13px] leading-5 text-slate-500">แดชบอร์ดนี้เชื่อมบัญชี เทรด ปฏิทิน ความเสี่ยง และกราฟทั้งหมดเข้าด้วยกัน เมื่อเลือกบัญชีหรือปรับ filter ข้อมูลทุกส่วนจะอัปเดตจากชุดข้อมูลเดียวกัน</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Plus size={16} />} onClick={openNewAccountModal}>Add Account</Button>
            <Button icon={<Plus size={16} />} onClick={() => openNewTradeModal()}>Add Trade</Button>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-border bg-slate-50/80 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Filter size={14} className="text-blue-600" />
            <p className="font-inter text-[12px] font-extrabold uppercase tracking-[0.08em] text-slate-600">Linked Section Filters</p>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
            <Select
              label="Date range"
              options={accountScopeDateOptions}
              value={accountScopeFilters.dateRange}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, dateRange: event.target.value as AccountScopeDateRange }))}
            />
            <Select
              label="Account"
              options={accountOptions}
              value={accountScopeFilters.account}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, account: event.target.value }))}
            />
            <Select
              label="Firm / Broker"
              options={providerOptions}
              value={accountScopeFilters.provider}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, provider: event.target.value }))}
            />
            <Select
              label="Account Type"
              options={accountTypeOptions}
              value={accountScopeFilters.accountType}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, accountType: event.target.value }))}
            />
            <Select
              label="Account Status"
              options={accountStatusOptions}
              value={accountScopeFilters.accountStatus}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, accountStatus: event.target.value }))}
            />
            <Select
              label="Symbol"
              options={['All', ...symbols]}
              value={accountScopeFilters.symbol}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, symbol: event.target.value }))}
            />
            <Select
              label="Asset Type"
              options={['All', 'CFD', 'Futures']}
              value={accountScopeFilters.assetType}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, assetType: event.target.value }))}
            />
            <Select
              label="Direction"
              options={['All', 'Long', 'Short']}
              value={accountScopeFilters.direction}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, direction: event.target.value }))}
            />
            <Select
              label="Setup"
              options={['All', ...setups]}
              value={accountScopeFilters.setup}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, setup: event.target.value }))}
            />
            <Select
              label="Session"
              options={['All', ...sessions]}
              value={accountScopeFilters.session}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, session: event.target.value }))}
            />
            <Select
              label="Outcome"
              options={['All', 'Win', 'Loss', 'BE', 'Open']}
              value={accountScopeFilters.outcome}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, outcome: event.target.value }))}
            />
            <Select
              label="Emotion"
              options={['All', ...emotions]}
              value={accountScopeFilters.emotion}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, emotion: event.target.value }))}
            />
            <Select
              label="Mistake Tag"
              options={['All', ...mistakeTags]}
              value={accountScopeFilters.mistakeTag}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, mistakeTag: event.target.value }))}
            />
            <Select
              label="Checklist"
              options={['All', 'Passed', 'Needs Review']}
              value={accountScopeFilters.checklistStatus}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, checklistStatus: event.target.value }))}
            />
            <Select
              label="Risk Level"
              options={['All', 'Low', 'Medium', 'High']}
              value={accountScopeFilters.riskLevel}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, riskLevel: event.target.value }))}
            />
            <Select
              label="Has Screenshot"
              options={['All', 'Yes', 'No']}
              value={accountScopeFilters.hasScreenshot}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, hasScreenshot: event.target.value }))}
            />
            <Select
              label="Reviewed"
              options={['All', 'Reviewed', 'Not Reviewed']}
              value={accountScopeFilters.reviewed}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, reviewed: event.target.value }))}
            />
            <Select
              label="Sort"
              options={accountScopeSortOptions}
              value={accountScopeFilters.sort}
              onChange={(event) => setAccountScopeFilters((current) => ({ ...current, sort: event.target.value }))}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          {[
            ['Total Capital', money(totalCapital), 'Combined account size', 'emerald'],
            ['Scoped Trades', `${accountScopeKpis.totalTrades}`, 'After linked filters', 'blue'],
            ['Win / Loss / BE', `${safePercent(scopedWinners.length, scopedClosedTrades.length)}% / ${safePercent(scopedLosers.length, scopedClosedTrades.length)}% / ${safePercent(scopedBreakeven.length, scopedClosedTrades.length)}%`, 'From filtered closed trades', 'purple'],
            ['Gross PnL', signedMoney(scopedGrossWin - scopedGrossLoss), 'Before costs', scopedGrossWin - scopedGrossLoss >= 0 ? 'green' : 'red'],
            ['Net PnL', signedMoney(scopedNetPnl), 'From linked trade history', scopedNetPnl >= 0 ? 'green' : 'red'],
            ['Testing Cost', money(accountScopeKpis.totalCost), 'Registration + reset + monthly', 'orange'],
            ['Funded / Passed', `${accountScopeKpis.passed}/${visibleFundingAccounts.length}`, 'Accounts in good standing', 'cyan'],
            ['Risk Alerts', `${accountScopeKpis.warnings}`, 'Deadline or drawdown warning', accountScopeKpis.warnings ? 'red' : 'green'],
          ].map(([label, value, helper, tone]) => (
            <div
              key={label}
              className={cn(
                'rounded-2xl border p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-lift',
                tone === 'red' && 'border-red-200 bg-red-50',
                tone === 'orange' && 'border-orange-200 bg-orange-50',
                tone === 'blue' && 'border-blue-200 bg-blue-50',
                tone === 'purple' && 'border-purple-200 bg-purple-50',
                tone === 'cyan' && 'border-cyan-200 bg-cyan-50',
                (tone === 'green' || tone === 'emerald') && 'border-emerald-200 bg-emerald-50',
              )}
            >
              <p className="font-inter text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600">{label}</p>
              <p className={cn('mt-3 font-inter text-[22px] font-extrabold leading-7', tone === 'red' ? 'text-red-600' : tone === 'orange' ? 'text-orange-600' : tone === 'blue' ? 'text-blue-700' : tone === 'purple' ? 'text-purple-700' : tone === 'cyan' ? 'text-cyan-700' : 'text-emerald-700')}>{value}</p>
              <p className="mt-2 font-kanit text-[12px] leading-5 text-slate-600">{helper}</p>
            </div>
          ))}
        </div>

        {accountScopeKpis.warnings > 0 ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle size={16} className="mt-0.5 text-amber-500" />
            <div>
              <p className="font-inter text-[12px] font-extrabold text-amber-700">Rule violation warning</p>
              <p className="font-kanit text-[12px] leading-5 text-amber-700">มีบัญชีที่เข้าใกล้ deadline หรือใช้ drawdown สูง ควรเปิดดูรายละเอียดบัญชีและลดความเสี่ยงก่อนเทรดต่อ</p>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleFundingAccounts.map((account, index) => {
          const metrics = accountMetricsMap.get(account.id);
          if (!metrics) return null;
          const deadlineDays = metrics.daysRemaining;
          const passProgress = account.profitTarget ? Math.max(0, Math.min(100, ((account.currentBalance - account.startingBalance) / account.profitTarget) * 100)) : 0;
          const statusTone = account.status === 'Failed' ? 'red' : account.status === 'Passed' || account.status === 'Funded' ? 'green' : account.status === 'Active' ? 'blue' : 'orange';
          const accent =
            statusTone === 'red'
              ? { border: 'border-red-200', bg: 'bg-red-500' }
              : statusTone === 'green'
                ? { border: 'border-emerald-200', bg: 'bg-emerald-500' }
                : statusTone === 'blue'
                  ? { border: 'border-blue-200', bg: 'bg-blue-500' }
                  : { border: 'border-orange-200', bg: 'bg-orange-500' };
          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              whileHover={{ y: -5, scale: 1.006 }}
              transition={{ duration: 0.24, ease: 'easeOut', delay: index * 0.03 }}
              role="button"
              tabIndex={0}
              onClick={() => {
                setExpandedAccountId(account.id);
                setCalendarAccountFilter(account.id);
                setAccountScopeFilters((current) => ({ ...current, account: account.id }));
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setExpandedAccountId(account.id);
                  setCalendarAccountFilter(account.id);
                  setAccountScopeFilters((current) => ({ ...current, account: account.id }));
                }
              }}
              className={cn(
                'relative min-h-[404px] cursor-pointer overflow-hidden rounded-2xl border bg-white p-5 text-slate-950 shadow-card transition-shadow hover:border-emerald-100 hover:shadow-lift',
                activeAccount?.id === account.id ? 'border-emerald-300 ring-4 ring-emerald-100' : accent.border,
              )}
            >
              <div className={cn('absolute inset-x-0 top-0 h-1', accent.bg)} />
              <div className="flex items-start justify-between">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 font-inter text-[14px] font-extrabold text-slate-800">{account.iconLabel}</div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone}>{account.status}</Badge>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedAccountId(account.id);
                      setAccountScopeFilters((current) => ({ ...current, account: account.id }));
                      openEditAccountModal(account);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:scale-105 hover:border-emerald-200 hover:text-emerald-600"
                    aria-label={`Edit ${account.accountName}`}
                    title="Edit account"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedAccountId(account.id);
                      setCalendarAccountFilter(account.id);
                      setAccountScopeFilters((current) => ({ ...current, account: account.id }));
                      setAccountDetailOpen(true);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:scale-105 hover:border-blue-200 hover:text-blue-600"
                    aria-label={`Toggle ${account.accountName} information`}
                    title="Account information"
                  >
                    <Info size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-5 font-inter text-[17px] font-extrabold leading-6 text-slate-950">{account.accountName}</p>
              <p className="mt-1 font-kanit text-[12px] text-slate-500">{account.provider} · {account.platform} · {account.accountType}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div>
                  <p className="font-inter text-[11px] font-bold text-slate-500">Balance</p>
                  <p className="font-inter text-[18px] font-extrabold text-slate-950">{money(account.currentBalance)}</p>
                </div>
                <div>
                  <p className="font-inter text-[11px] font-bold text-slate-500">Net PnL</p>
                  <p className={cn('font-inter text-[18px] font-extrabold', metrics.netPnl >= 0 ? 'text-emerald-600' : 'text-red-500')}>{signedMoney(metrics.netPnl)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="font-inter text-[10px] font-bold text-slate-500">Total Cost</p>
                  <p className="font-inter text-[13px] font-extrabold text-slate-900">{money(metrics.totalCost)}</p>
                </div>
                <div>
                  <p className="font-inter text-[10px] font-bold text-slate-500">Days Left</p>
                  <p className={cn('font-inter text-[13px] font-extrabold', deadlineDays < 0 ? 'text-red-500' : 'text-slate-900')}>{deadlineDays < 0 ? 'Expired' : `${deadlineDays}d`}</p>
                </div>
                <div>
                  <p className="font-inter text-[10px] font-bold text-slate-500">Trades</p>
                  <p className="font-inter text-[13px] font-extrabold text-slate-900">{metrics.totalTrades}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between font-inter text-[10px] font-bold text-slate-500">
                  <span>Profit target</span>
                  <span>{money(account.currentBalance - account.startingBalance)} / {money(account.profitTarget)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={cn('h-full rounded-full', accent.bg)} style={{ width: `${passProgress}%` }} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3">
                <div>
                  <p className="font-inter text-[10px] font-bold text-slate-500">Remaining DD</p>
                  <p className={cn('font-inter text-[13px] font-extrabold', metrics.remainingDrawdown < account.dailyDrawdownLimit ? 'text-amber-600' : 'text-slate-900')}>{money(metrics.remainingDrawdown)}</p>
                </div>
                <div>
                  <p className="font-inter text-[10px] font-bold text-slate-500">Rule Status</p>
                  <p className={cn('font-inter text-[13px] font-extrabold', metrics.ruleWarning ? 'text-amber-600' : 'text-emerald-600')}>{metrics.ruleWarning ? 'Warning' : 'Healthy'}</p>
                </div>
              </div>
            </motion.div>
          );
          })}
        </div>

        {activeAccount ? (() => {
          const metrics = accountMetricsMap.get(activeAccount.id);
          if (!metrics) return null;
          return (
            <Card hover={false} className="h-full border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/60">
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={activeAccount.status === 'Failed' ? 'red' : activeAccount.status === 'Passed' || activeAccount.status === 'Funded' ? 'green' : 'blue'}>{activeAccount.status}</Badge>
                      <span className="font-inter text-[12px] font-bold text-slate-500">{activeAccount.provider} · {activeAccount.accountType}</span>
                    </div>
                    <h3 className="mt-3 font-inter text-[21px] font-extrabold leading-7 text-slate-950">{activeAccount.accountName}</h3>
                    <p className="mt-1 font-kanit text-[13px] leading-5 text-slate-500">รีวิวบัญชีที่เลือก พร้อมตัวเลขจาก trade journal ปัจจุบัน</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={() => openEditAccountModal(activeAccount)}>Edit</Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      icon={<Info size={14} />}
                      onClick={() => setAccountDetailOpen(true)}
                      aria-label="Open account full view"
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2 2xl:grid-cols-1 min-[1780px]:grid-cols-2">
                  {[
                    ['Current Balance', money(activeAccount.currentBalance), 'blue'],
                    ['Net After Fees', signedMoney(metrics.netAfterCost), metrics.netAfterCost >= 0 ? 'green' : 'red'],
                    ['Journal PnL', signedMoney(metrics.netPnl), metrics.netPnl >= 0 ? 'green' : 'red'],
                    ['Win Rate', `${metrics.winRate}%`, 'blue'],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
                      <p className="font-inter text-[11px] font-bold text-slate-500">{label}</p>
                      <p className={cn('mt-1 font-inter text-[20px] font-extrabold leading-7', tone === 'green' ? 'text-emerald-600' : tone === 'red' ? 'text-red-500' : 'text-slate-900')}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })() : null}
      </div>

      {false && (
      <Card hover={false} className="hidden overflow-hidden">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-slate-50 px-3 py-1">
              <Table2 size={14} className="text-blue-600" />
              <span className="font-inter text-[11px] font-extrabold text-slate-700">Account Overview Table</span>
            </div>
            <h3 className="mt-2 font-inter text-[18px] font-extrabold text-slate-950 dark:text-white">Prop Firm & Broker Account Overview</h3>
            <p className="font-kanit text-[13px] leading-5 text-slate-500 dark:text-slate-400">คลิกแถวเพื่อเปิดรายละเอียดเต็มจอพร้อม performance, rules, costs และ trade history ของบัญชีนั้น</p>
          </div>
          <Badge tone="blue">{trading.fundingAccounts.length} accounts</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1460px]">
            <thead className="bg-slate-50">
              <tr>
                {[
                  'Account',
                  'Type',
                  'Status',
                  'Account Size',
                  'Starting',
                  'Current',
                  'Profit Target',
                  'Max Daily Loss',
                  'Max Drawdown',
                  'Remaining DD',
                  'Days Left',
                  'Deadline',
                  'Trades',
                  'Win Rate',
                  'Net PnL',
                ].map((header) => (
                  <th key={header} className="border-b border-border px-3 py-2 text-left font-inter text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trading.fundingAccounts.map((account) => {
                const metrics = accountMetricsMap.get(account.id);
                if (!metrics) return null;
                return (
                  <tr
                    key={account.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setExpandedAccountId(account.id);
                      setCalendarAccountFilter(account.id);
                      setAccountScopeFilters((current) => ({ ...current, account: account.id }));
                      setAccountDetailOpen(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        setExpandedAccountId(account.id);
                        setCalendarAccountFilter(account.id);
                        setAccountScopeFilters((current) => ({ ...current, account: account.id }));
                        setAccountDetailOpen(true);
                      }
                    }}
                    className="cursor-pointer transition hover:bg-slate-50"
                  >
                    <td className="border-b border-border px-3 py-3">
                      <p className="font-inter text-[13px] font-extrabold text-slate-900">{account.accountName}</p>
                      <p className="font-kanit text-[12px] text-slate-500">{account.provider} · {account.platform}</p>
                    </td>
                    <td className="border-b border-border px-3 py-3 font-inter text-[13px] font-semibold text-slate-700">{account.accountType}</td>
                    <td className="border-b border-border px-3 py-3"><Badge tone={account.status === 'Failed' ? 'red' : account.status === 'Passed' || account.status === 'Funded' ? 'green' : 'blue'}>{account.status}</Badge></td>
                    <td className="border-b border-border px-3 py-3 font-inter text-[13px] font-semibold text-slate-700">{money(account.accountSize)}</td>
                    <td className="border-b border-border px-3 py-3 font-inter text-[13px] text-slate-700">{money(account.startingBalance)}</td>
                    <td className="border-b border-border px-3 py-3 font-inter text-[13px] font-semibold text-slate-700">{money(account.currentBalance)}</td>
                    <td className="border-b border-border px-3 py-3 font-inter text-[13px] text-slate-700">{money(account.profitTarget)}</td>
                    <td className="border-b border-border px-3 py-3 font-inter text-[13px] text-slate-700">{money(account.dailyDrawdownLimit)}</td>
                    <td className="border-b border-border px-3 py-3 font-inter text-[13px] text-slate-700">{money(account.maxDrawdownLimit)}</td>
                    <td className={cn('border-b border-border px-3 py-3 font-inter text-[13px] font-semibold', metrics.remainingDrawdown <= account.dailyDrawdownLimit ? 'text-amber-600' : 'text-slate-700')}>{money(metrics.remainingDrawdown)}</td>
                    <td className={cn('border-b border-border px-3 py-3 font-inter text-[13px] font-bold', metrics.daysRemaining <= 5 ? 'text-amber-600' : 'text-slate-700')}>{metrics.daysRemaining < 0 ? 'Expired' : `${metrics.daysRemaining}d`}</td>
                    <td className="border-b border-border px-3 py-3 font-inter text-[13px] text-slate-700">{account.deadlineDate}</td>
                    <td className="border-b border-border px-3 py-3 font-inter text-[13px] font-bold text-slate-700">{metrics.totalTrades}</td>
                    <td className="border-b border-border px-3 py-3 font-inter text-[13px] font-bold text-slate-700">{metrics.winRate}%</td>
                    <td className={cn('border-b border-border px-3 py-3 font-inter text-[13px] font-extrabold', metrics.netPnl >= 0 ? 'text-emerald-600' : 'text-red-500')}>{signedMoney(metrics.netPnl)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {activeAccount ? (() => {
        const account = activeAccount;
        const metrics = accountMetricsMap.get(account.id);
        if (!metrics) return null;

        const accountClosedTrades = scopedClosedTrades
          .filter((trade) => trade.fundingAccountId === account.id)
          .sort((a, b) => (`${a.date}-${a.entryTime ?? '00:00'}`).localeCompare(`${b.date}-${b.entryTime ?? '00:00'}`));

        const accountAllTrades = (accountScopeFilters.account === 'All' ? filteredTrades : filteredTrades.filter((trade) => trade.fundingAccountId === account.id))
          .sort((a, b) => (`${a.date}-${a.entryTime ?? '00:00'}`).localeCompare(`${b.date}-${b.entryTime ?? '00:00'}`));
        const accountFilteredClosedTrades = accountAllTrades.filter((trade) => trade.status === 'Closed');

        const selectedDayTrades = accountAllTrades.filter((trade) => trade.date === selectedCalendarDate);
        const selectedDayTrade = selectedDayTrades.find((trade) => trade.id === selectedDayTradeId) ?? selectedDayTrades[0] ?? null;
        const selectedTradeAccount = selectedDayTrade?.fundingAccountId ? fundingAccountById.get(selectedDayTrade.fundingAccountId) ?? account : account;
        const calendarNetPnl = accountFilteredClosedTrades.reduce((sum, trade) => sum + tradeProfit(trade), 0);
        const calendarGrossWin = accountFilteredClosedTrades.filter((trade) => trade.resultR > 0).reduce((sum, trade) => sum + tradeProfit(trade), 0);
        const calendarGrossLoss = Math.abs(accountFilteredClosedTrades.filter((trade) => trade.resultR < 0).reduce((sum, trade) => sum + tradeProfit(trade), 0));
        const calendarProfitFactor = calendarGrossLoss ? Number((calendarGrossWin / calendarGrossLoss).toFixed(2)) : calendarGrossWin ? 99 : 0;
        const calendarTotalR = accountFilteredClosedTrades.reduce((sum, trade) => sum + trade.resultR, 0);

        const monthDays = daysInMonth(accountCalendarMonth);
        const firstWeekday = new Date(`${accountCalendarMonth}-01T00:00:00`).getDay();
        const calendarCells = Array.from({ length: 42 }, (_, index) => {
          const day = index - firstWeekday + 1;
          const inMonth = day >= 1 && day <= monthDays;
          const date = `${accountCalendarMonth}-${String(Math.max(1, Math.min(monthDays, day))).padStart(2, '0')}`;
          const dayTrades = inMonth ? accountAllTrades.filter((trade) => trade.date === date) : [];
          const pnl = dayTrades.reduce((sum, trade) => sum + closedTradeProfit(trade), 0);
          const winCount = dayTrades.filter((trade) => trade.resultR > 0).length;
          return { day, inMonth, date, trades: dayTrades.length, pnl, winCount };
        });

        const dailyPnlMap = accountFilteredClosedTrades.reduce((map, trade) => {
          const key = trade.date;
          map.set(key, (map.get(key) ?? 0) + tradeProfit(trade));
          return map;
        }, new Map<string, number>());
        const weeklyPnl = Array.from({ length: 5 }, (_, index) => {
          const start = index * 7 + 1;
          const end = Math.min(monthDays, start + 6);
          const dates = Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => `${accountCalendarMonth}-${String(start + i).padStart(2, '0')}`);
          const pnl = dates.reduce((sum, date) => sum + (dailyPnlMap.get(date) ?? 0), 0);
          const trades = dates.reduce((sum, date) => sum + accountFilteredClosedTrades.filter((trade) => trade.date === date).length, 0);
          return { label: `W${index + 1}`, pnl, trades };
        }).filter((item) => item.trades > 0 || item.pnl !== 0);

        const monthSummary = Array.from(
          accountFilteredClosedTrades.reduce((map, trade) => {
            const key = trade.date.slice(0, 7);
            map.set(key, (map.get(key) ?? 0) + tradeProfit(trade));
            return map;
          }, new Map<string, number>()),
          ([month, pnl]) => ({ month, pnl }),
        );

        const setupSummary = Array.from(
          accountFilteredClosedTrades.reduce((map, trade) => {
            const key = trade.setup;
            const current = map.get(key) ?? { setup: key, trades: 0, pnl: 0, r: 0 };
            map.set(key, { setup: key, trades: current.trades + 1, pnl: current.pnl + tradeProfit(trade), r: current.r + trade.resultR });
            return map;
          }, new Map<string, { setup: string; trades: number; pnl: number; r: number }>()),
          ([, value]) => value,
        ).sort((a, b) => b.pnl - a.pnl);

        const sessionSummary = Array.from(
          accountFilteredClosedTrades.reduce((map, trade) => {
            const key = trade.session;
            const current = map.get(key) ?? { session: key, trades: 0, pnl: 0, r: 0 };
            map.set(key, { session: key, trades: current.trades + 1, pnl: current.pnl + tradeProfit(trade), r: current.r + trade.resultR });
            return map;
          }, new Map<string, { session: string; trades: number; pnl: number; r: number }>()),
          ([, value]) => value,
        ).sort((a, b) => b.pnl - a.pnl);

        const symbolSummary = Array.from(
          accountClosedTrades.reduce((map, trade) => {
            const key = trade.symbol;
            const current = map.get(key) ?? { symbol: key, trades: 0, pnl: 0, r: 0, wins: 0 };
            map.set(key, { symbol: key, trades: current.trades + 1, pnl: current.pnl + tradeProfit(trade), r: current.r + trade.resultR, wins: current.wins + (trade.resultR > 0 ? 1 : 0) });
            return map;
          }, new Map<string, { symbol: string; trades: number; pnl: number; r: number; wins: number }>()),
          ([, value]) => value,
        ).sort((a, b) => b.pnl - a.pnl);

        const equitySeries = accountFilteredClosedTrades.reduce((rows, trade) => {
          const previous = rows[rows.length - 1]?.equity ?? account.startingBalance;
          rows.push({
            date: trade.date.slice(5),
            equity: previous + tradeProfit(trade),
            pnl: tradeProfit(trade),
            r: trade.resultR,
          });
          return rows;
        }, [] as { date: string; equity: number; pnl: number; r: number }[]);

        const drawdownUsed = Math.max(0, account.maxDrawdownLimit - metrics.remainingDrawdown);
        const drawdownUsedPct = account.maxDrawdownLimit ? Math.min(100, (drawdownUsed / account.maxDrawdownLimit) * 100) : 0;
        const selectedDayLoss = Math.max(0, -selectedDayTrades.reduce((sum, trade) => sum + closedTradeProfit(trade), 0));
        const dailyRiskUsedPct = account.dailyDrawdownLimit ? Math.min(100, (selectedDayLoss / account.dailyDrawdownLimit) * 100) : 0;
        const avgConfidence = accountFilteredClosedTrades.length
          ? Math.round(accountFilteredClosedTrades.reduce((sum, trade) => sum + (trade.confidenceScore ?? 60), 0) / accountFilteredClosedTrades.length)
          : 0;
        const emotionRiskCount = accountFilteredClosedTrades.filter((trade) => ['Fearful', 'Greedy', 'Revenge'].includes(trade.emotion)).length;
        const checklistDone = accountFilteredClosedTrades.filter((trade) => trade.checklistPassed).length;
        const checklistRate = accountFilteredClosedTrades.length ? Math.round((checklistDone / accountFilteredClosedTrades.length) * 100) : 0;
        const lossStreak = metrics.maxConsecutiveLosses;
        const commissionTotal = Math.round(accountFilteredClosedTrades.reduce((sum, trade) => sum + (trade.commission ?? 0), 0));

        const warningCards = [
          drawdownUsedPct >= 90
            ? { tone: 'red', title: 'Critical Drawdown Usage', detail: `Used ${drawdownUsedPct.toFixed(0)}% of max drawdown. Reduce size immediately.` }
            : drawdownUsedPct >= 70
              ? { tone: 'orange', title: 'High Drawdown Usage', detail: `Used ${drawdownUsedPct.toFixed(0)}% of max drawdown. Tighten risk control.` }
              : null,
          dailyRiskUsedPct >= 90
            ? { tone: 'red', title: 'Critical Daily Risk', detail: `Today's loss uses ${dailyRiskUsedPct.toFixed(0)}% of daily limit.` }
            : dailyRiskUsedPct >= 70
              ? { tone: 'orange', title: 'High Daily Risk', detail: `Today's loss uses ${dailyRiskUsedPct.toFixed(0)}% of daily limit.` }
              : null,
          lossStreak >= 3
            ? { tone: 'red', title: 'Loss Streak', detail: `${lossStreak} consecutive losses. Pause and review before next trade.` }
            : lossStreak >= 2
              ? { tone: 'orange', title: 'Consecutive Losses', detail: `${lossStreak} losses in a row. Reduce risk and wait for A+ setup.` }
              : null,
          emotionRiskCount >= 3
            ? { tone: 'orange', title: 'Emotion Risk', detail: 'Fear/Greed/Revenge emotion appears frequently. Follow checklist before entries.' }
            : null,
          checklistRate < 70 && accountFilteredClosedTrades.length > 0
            ? { tone: 'yellow', title: 'Checklist Incomplete', detail: `Checklist pass rate is ${checklistRate}%. Reinforce pre-trade checklist.` }
            : null,
          metrics.daysRemaining <= 5 && metrics.remainingTradingDays > 0
            ? { tone: 'orange', title: 'Deadline Risk', detail: `${metrics.daysRemaining} days left and ${metrics.remainingTradingDays} minimum trading days remaining.` }
            : null,
          metrics.netPnl !== 0 && Math.abs(commissionTotal / metrics.netPnl) > 0.2
            ? { tone: 'yellow', title: 'Commission Drag', detail: `Commission is ${Math.round((commissionTotal / Math.abs(metrics.netPnl)) * 100)}% of net PnL.` }
            : null,
        ].filter((item): item is { tone: 'red' | 'orange' | 'yellow'; title: string; detail: string } => Boolean(item));

        const selectedTradeRiskAmount = selectedDayTrade?.riskAmount ?? 0;
        const selectedTradeRiskPct = selectedTradeAccount.currentBalance ? (selectedTradeRiskAmount / selectedTradeAccount.currentBalance) * 100 : 0;
        const selectedTradeDuration = selectedDayTrade?.entryTime && selectedDayTrade?.exitTime
          ? (() => {
              const [entryH, entryM] = selectedDayTrade.entryTime.split(':').map(Number);
              const [exitH, exitM] = selectedDayTrade.exitTime.split(':').map(Number);
              const entry = entryH * 60 + entryM;
              const exit = exitH * 60 + exitM;
              const minutes = Math.max(0, exit - entry);
              return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
            })()
          : '-';

        const instrumentRows = (selectedDayTrades.length ? selectedDayTrades : accountFilteredClosedTrades.slice(0, 5)).map((trade) => {
          const isFutures = assetTypeForSymbol(trade.symbol) === 'Futures';
          const stopDistance = Math.max(0.0001, Math.abs(trade.entryPrice - trade.stopLoss));
          const pointValue = isFutures ? (trade.symbol === 'MNQ' ? 2 : trade.symbol === 'US30' ? 5 : 20) : trade.symbol === 'XAUUSD' ? 100 : 10;
          const contracts = isFutures ? Math.max(1, Math.round(trade.riskAmount / (stopDistance * pointValue))) : 0;
          const lotSize = isFutures ? 0 : Number((trade.riskAmount / Math.max(1, stopDistance * pointValue * 10)).toFixed(2));
          const actualRrr = stopDistance ? Number((Math.abs((trade.exitPrice ?? trade.entryPrice) - trade.entryPrice) / stopDistance).toFixed(2)) : 0;
          const plannedRrr = trade.rrTarget ?? 0;
          return {
            id: trade.id,
            symbol: trade.symbol,
            assetType: isFutures ? 'Futures' : 'CFD',
            pointValue,
            stopDistance,
            contracts,
            lotSize,
            riskAmount: trade.riskAmount,
            commission: trade.commission ?? 0,
            plannedRrr,
            actualRrr,
          };
        });

        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.45fr)_340px]">
            <div className="space-y-4">
              <Card hover={false} className="hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={account.status === 'Failed' ? 'red' : account.status === 'Passed' || account.status === 'Funded' ? 'green' : 'blue'}>{account.status}</Badge>
                      <span className="font-inter text-[12px] font-bold text-slate-500">{account.provider} · {account.accountType}</span>
                    </div>
                    <h3 className="mt-2 font-inter text-[20px] font-extrabold text-slate-950">{account.accountName}</h3>
                    <p className="font-kanit text-[13px] leading-5 text-slate-500">Selected account review ที่ลิงก์กับ trade journal ปัจจุบัน</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={() => openEditAccountModal(account)}>Edit</Button>
                    <Button variant="secondary" size="icon" icon={<Info size={14} />} onClick={() => setAccountDetailOpen(true)} aria-label="Open account full view" />
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {[
                    ['Current Balance', money(account.currentBalance), 'blue'],
                    ['Net After Fees', signedMoney(metrics.netAfterCost), metrics.netAfterCost >= 0 ? 'green' : 'red'],
                    ['Journal PnL', signedMoney(metrics.netPnl), metrics.netPnl >= 0 ? 'green' : 'red'],
                    ['Win Rate', `${metrics.winRate}%`, 'blue'],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="rounded-xl border border-border bg-slate-50 p-3">
                      <p className="font-inter text-[11px] font-bold text-slate-500">{label}</p>
                      <p className={cn('mt-1 font-inter text-[20px] font-extrabold', tone === 'green' ? 'text-emerald-600' : tone === 'red' ? 'text-red-500' : 'text-slate-900')}>{value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card hover={false}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-inter text-[14px] font-extrabold text-slate-950">Account Details</h4>
                  <div className="flex flex-wrap gap-1 rounded-full border border-border bg-slate-50 p-1">
                    {[
                      ['overview', 'Overview'],
                      ['rules', 'Rules & Fees'],
                      ['cfd', 'CFD'],
                      ['futures', 'Futures'],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setAccountPanelTab(id as 'overview' | 'rules' | 'cfd' | 'futures')}
                        className={cn('rounded-full px-3 py-1.5 font-inter text-[11px] font-extrabold transition', accountPanelTab === id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900')}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {accountPanelTab === 'overview' ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      ['Account Size', money(account.accountSize)],
                      ['Starting Balance', money(account.startingBalance)],
                      ['Current Balance', money(account.currentBalance)],
                      ['Platform', account.platform],
                      ['Account Number', account.accountNumber || '-'],
                      ['Currency', account.currency],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-border bg-slate-50 px-3 py-2">
                        <p className="font-inter text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">{label}</p>
                        <p className="mt-1 font-inter text-[13px] font-extrabold text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {accountPanelTab === 'rules' ? (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        ['Purchase Fee', money(metrics.registrationFee)],
                        ['Reset Fee', money(metrics.resetFee)],
                        ['Monthly Fee', money(metrics.monthlyFee)],
                        ['Activation Fee', money(metrics.activationFee)],
                        ['Commission Total', money(commissionTotal)],
                        ['Total Testing Cost', money(metrics.totalCost + commissionTotal)],
                        ['Refundable Status', metrics.refundableStatus],
                        ['Days Remaining', metrics.daysRemaining < 0 ? 'Expired' : `${metrics.daysRemaining} days`],
                        ['Profit Target', money(account.profitTarget)],
                        ['Daily Loss Limit', money(account.dailyDrawdownLimit)],
                        ['Max Drawdown', money(account.maxDrawdownLimit)],
                        ['Trading Days', `${account.completedTradingDays}/${account.minimumTradingDays}`],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-border bg-white px-3 py-2">
                          <p className="font-inter text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">{label}</p>
                          <p className="mt-1 font-inter text-[13px] font-extrabold text-slate-800">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        ['Profit target progress', account.profitTarget ? ((account.currentBalance - account.startingBalance) / account.profitTarget) * 100 : 0, `${money(account.currentBalance - account.startingBalance)} / ${money(account.profitTarget)}`],
                        ['Drawdown usage', drawdownUsedPct, `${money(drawdownUsed)} used / ${money(account.maxDrawdownLimit)}`],
                        ['Trading day progress', account.minimumTradingDays ? (account.completedTradingDays / account.minimumTradingDays) * 100 : 100, `${account.completedTradingDays}/${account.minimumTradingDays} days`],
                      ].map(([label, value, helper]) => (
                        <div key={label}>
                          <div className="mb-1 flex items-center justify-between">
                            <p className="font-inter text-[12px] font-bold text-slate-700">{label}</p>
                            <span className="font-inter text-[11px] font-bold text-slate-500">{Math.max(0, Math.min(100, Number(value))).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className={cn('h-full rounded-full', Number(value) >= 90 ? 'bg-red-500' : Number(value) >= 70 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${Math.max(0, Math.min(100, Number(value)))}%` }} />
                          </div>
                          <p className="mt-1 font-kanit text-[12px] leading-5 text-slate-500">{helper}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                {accountPanelTab === 'cfd' || accountPanelTab === 'futures' ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                      <p className="font-kanit text-[12px] leading-5 text-blue-700">{accountPanelTab === 'cfd' ? 'CFD ใช้ lot size, contract size, spread และ commission เป็นตัวคุมความเสี่ยง' : 'Futures ใช้ point value, tick value, contracts และ commission ต่อสัญญาในการคำนวณ'}</p>
                      <WalletCards size={16} className="text-blue-600" />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px]">
                        <thead>
                          <tr className="text-left">
                            {['Instrument', 'Type', 'Point/Tick', 'Stop', 'Contracts/Lot', 'Risk', 'Commission', 'Planned RRR', 'Actual RRR'].map((item) => (
                              <th key={item} className="border-b border-border px-2 py-2 font-inter text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">{item}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {instrumentRows.filter((item) => accountPanelTab === 'cfd' ? item.assetType === 'CFD' : item.assetType === 'Futures').map((item) => (
                            <tr key={item.id}>
                              <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-extrabold text-slate-800">{item.symbol}</td>
                              <td className="border-b border-border px-2 py-2"><Badge tone={item.assetType === 'Futures' ? 'blue' : 'green'}>{item.assetType}</Badge></td>
                              <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{item.pointValue}</td>
                              <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{item.stopDistance.toFixed(4)}</td>
                              <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{item.assetType === 'Futures' ? `${item.contracts} contracts` : `${item.lotSize} lot`}</td>
                              <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{money(item.riskAmount)}</td>
                              <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{money(item.commission)}</td>
                              <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{item.plannedRrr.toFixed(2)}R</td>
                              <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{item.actualRrr.toFixed(2)}R</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </Card>
            </div>

            <div className="space-y-4">
              <Card hover={false}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="font-inter text-[16px] font-extrabold text-slate-950">Trading Calendar</h4>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => {
                      const current = new Date(`${accountCalendarMonth}-01T00:00:00`);
                      current.setMonth(current.getMonth() - 1);
                      setAccountCalendarMonth(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
                    }}>Prev</Button>
                    <p className="font-inter text-[13px] font-bold text-slate-700">{monthLabel(accountCalendarMonth)}</p>
                    <Button variant="secondary" size="sm" onClick={() => {
                      const current = new Date(`${accountCalendarMonth}-01T00:00:00`);
                      current.setMonth(current.getMonth() + 1);
                      setAccountCalendarMonth(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
                    }}>Next</Button>
                    <Button variant="secondary" size="sm" onClick={() => {
                      const today = '2026-06-18';
                      setAccountCalendarMonth(today.slice(0, 7));
                      setSelectedCalendarDate(today);
                    }}>Today</Button>
                  </div>
                </div>
                <div className="mb-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
                  {[
                    ['Net PnL', signedMoney(calendarNetPnl), calendarNetPnl >= 0 ? 'text-emerald-600' : 'text-red-500'],
                    ['Trades', `${accountFilteredClosedTrades.length}`, 'text-slate-900'],
                    ['Win Rate', `${safePercent(accountFilteredClosedTrades.filter((trade) => trade.resultR > 0).length, accountFilteredClosedTrades.length)}%`, 'text-blue-600'],
                    ['Profit Factor', `${calendarProfitFactor}`, 'text-slate-900'],
                    ['Total R', `${calendarTotalR.toFixed(2)}R`, 'text-emerald-600'],
                    ['Average R', `${(calendarTotalR / Math.max(1, accountFilteredClosedTrades.length)).toFixed(2)}R`, 'text-slate-900'],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="rounded-xl border border-border bg-slate-50 p-3">
                      <p className="font-inter text-[11px] font-bold text-slate-500">{label}</p>
                      <p className={cn('mt-1 font-inter text-[18px] font-extrabold', tone)}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-1 text-center font-inter text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">{day}</div>
                  ))}
                  {calendarCells.map((cell, index) => (
                    <button
                      key={`${cell.date}-${index}`}
                      type="button"
                      disabled={!cell.inMonth}
                      onClick={() => setSelectedCalendarDate(cell.date)}
                      className={cn(
                        'min-h-[74px] rounded-lg border p-2 text-left transition',
                        !cell.inMonth && 'cursor-default border-slate-100 bg-slate-50 opacity-45',
                        cell.inMonth && 'border-slate-200 bg-white hover:border-blue-300',
                        cell.inMonth && cell.pnl > 0 && 'bg-emerald-50',
                        cell.inMonth && cell.pnl < 0 && 'bg-red-50',
                        selectedCalendarDate === cell.date && 'ring-2 ring-blue-500',
                      )}
                    >
                      <p className={cn('font-inter text-[11px] font-bold', selectedCalendarDate === cell.date ? 'text-blue-700' : 'text-slate-700')}>{cell.inMonth ? cell.day : ''}</p>
                      {cell.inMonth && cell.trades > 0 ? (
                        <>
                          <p className={cn('mt-1 font-inter text-[11px] font-extrabold', cell.pnl >= 0 ? 'text-emerald-600' : 'text-red-500')}>{signedMoney(cell.pnl)}</p>
                          <p className="font-inter text-[10px] font-bold text-slate-500">{cell.trades} trades</p>
                        </>
                      ) : null}
                    </button>
                  ))}
                </div>
              </Card>

              <Card hover={false}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="font-inter text-[14px] font-extrabold text-slate-950">Selected Day Trade History</h4>
                  <Badge tone="blue">{selectedCalendarDate}</Badge>
                </div>
                {selectedDayTrades.length ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedDayTrades.map((trade) => (
                      <button
                        key={trade.id}
                        type="button"
                        onClick={() => {
                          setSelectedDayTradeId(trade.id);
                          setSelectedTrade(trade);
                        }}
                        className={cn(
                          'min-w-[210px] rounded-xl border p-3 text-left transition',
                          selectedDayTradeId === trade.id ? 'border-blue-400 bg-blue-50' : 'border-border bg-white hover:border-blue-300',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-inter text-[13px] font-extrabold text-slate-900">{trade.symbol} {trade.direction}</p>
                          <Badge tone={resultTone(trade.resultR)}>{trade.resultR}R</Badge>
                        </div>
                        <p className="mt-1 font-inter text-[12px] font-semibold text-slate-600">{trade.entryTime ?? '-'} · {trade.setup}</p>
                        {accountScopeFilters.account === 'All' ? (
                          <p className="mt-1 font-inter text-[11px] font-bold text-slate-500">{fundingAccountById.get(trade.fundingAccountId ?? '')?.accountName ?? 'Unlinked account'}</p>
                        ) : null}
                        <p className={cn('mt-2 font-inter text-[14px] font-extrabold', closedTradeProfit(trade) >= 0 ? 'text-emerald-600' : 'text-red-500')}>{trade.status === 'Closed' ? signedMoney(tradeProfit(trade)) : 'Open trade'}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-slate-50 px-3 py-4 font-kanit text-[13px] text-slate-500">No trades for the selected day.</div>
                )}
              </Card>

              <Card hover={false}>
                <h4 className="font-inter text-[14px] font-extrabold text-slate-950">Selected Trade Detail</h4>
                {selectedDayTrade ? (
                  <div className="mt-3 space-y-4">
                    <div className="grid gap-2 md:grid-cols-3">
                      {[
                        ['Account', selectedTradeAccount.accountName],
                        ['Broker/Firm', selectedTradeAccount.provider],
                        ['Account Type', selectedTradeAccount.accountType],
                        ['Asset Type', assetTypeForSymbol(selectedDayTrade.symbol)],
                        ['Symbol', selectedDayTrade.symbol],
                        ['Direction', selectedDayTrade.direction],
                        ['Session', selectedDayTrade.session],
                        ['Entry - Exit', `${selectedDayTrade.entryTime ?? '-'} → ${selectedDayTrade.exitTime ?? '-'}`],
                        ['Duration', selectedTradeDuration],
                        ['Outcome', resultName(selectedDayTrade)],
                        ['Entry Price', `${selectedDayTrade.entryPrice}`],
                        ['Exit Price', selectedDayTrade.exitPrice ? `${selectedDayTrade.exitPrice}` : '-'],
                        ['Stop Loss', `${selectedDayTrade.stopLoss}`],
                        ['Take Profit', `${selectedDayTrade.takeProfit}`],
                        ['Commission', money(selectedDayTrade.commission ?? 0)],
                        ['Risk Amount', money(selectedDayTrade.riskAmount)],
                        ['Risk % Account', `${selectedTradeRiskPct.toFixed(2)}%`],
                        ['Planned RRR', `${selectedDayTrade.rrTarget ?? 0}R`],
                        ['Actual RRR', `${(Math.abs((selectedDayTrade.exitPrice ?? selectedDayTrade.entryPrice) - selectedDayTrade.entryPrice) / Math.max(0.0001, Math.abs(selectedDayTrade.entryPrice - selectedDayTrade.stopLoss))).toFixed(2)}R`],
                        ['Realized R', `${selectedDayTrade.resultR}R`],
                        ['MAE/MFE', `${selectedDayTrade.maeR ?? 0}R / ${selectedDayTrade.mfeR ?? 0}R`],
                        ['Net PnL', selectedDayTrade.status === 'Closed' ? signedMoney(tradeProfit(selectedDayTrade)) : 'Open trade'],
                        ['Emotion', selectedDayTrade.emotion],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-border bg-slate-50 px-3 py-2">
                          <p className="font-inter text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">{label}</p>
                          <p className="mt-1 font-inter text-[12px] font-bold text-slate-800">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedDayTrade.preTradeImageUrl ? <img src={selectedDayTrade.preTradeImageUrl} alt="Before entry" className="h-[190px] w-full rounded-xl object-cover" /> : <div className="grid h-[190px] place-items-center rounded-xl border border-dashed border-border bg-slate-50 font-kanit text-[12px] text-slate-500">No before screenshot</div>}
                      {selectedDayTrade.postTradeImageUrl ? <img src={selectedDayTrade.postTradeImageUrl} alt="After exit" className="h-[190px] w-full rounded-xl object-cover" /> : <div className="grid h-[190px] place-items-center rounded-xl border border-dashed border-border bg-slate-50 font-kanit text-[12px] text-slate-500">No after screenshot</div>}
                    </div>
                    <div className="rounded-xl border border-border bg-white p-3">
                      <p className="font-inter text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Notes & Lesson Learned</p>
                      <p className="mt-1 font-kanit text-[13px] leading-6 text-slate-700">{selectedDayTrade.notes || 'No notes yet.'}</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-border bg-slate-50 p-3">
                        <p className="font-inter text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Psychology</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {[
                            ['Confidence', `${selectedDayTrade.confidenceScore ?? 0}%`],
                            ['Emotion', selectedDayTrade.emotion],
                            ['Discipline', selectedDayTrade.ruleFollowed ? 'Rule followed' : 'Rule broken'],
                            ['Mistakes', (selectedDayTrade.mistakeTags ?? ['None']).join(', ')],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-lg border border-border bg-white px-3 py-2">
                              <p className="font-inter text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">{label}</p>
                              <p className="mt-1 font-inter text-[12px] font-bold text-slate-800">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border bg-slate-50 p-3">
                        <p className="font-inter text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Checklist</p>
                        {selectedDayTrade.checklistItems?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedDayTrade.checklistItems.map((item) => (
                              <span key={item} className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 font-kanit text-[11px] text-emerald-700">{item}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 font-kanit text-[12px] leading-5 text-slate-500">No checklist data for this trade.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => openEditTradeModal(selectedDayTrade)}>Edit Trade</Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Eye size={14} />}
                        onClick={() => {
                          updateTrade(selectedDayTrade.id, { ...selectedDayTrade, checklistPassed: true });
                          addToast({ title: 'Marked as reviewed', description: 'Checklist state and linked review data were updated.' });
                        }}
                      >
                        Mark as Reviewed
                      </Button>
                      <Button size="sm" variant="secondary" icon={<Upload size={14} />} onClick={() => openEditTradeModal(selectedDayTrade)}>Upload Screenshot</Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-border bg-slate-50 px-3 py-4 font-kanit text-[13px] text-slate-500">Select a trade card to view details.</div>
                )}
              </Card>
            </div>

            <div className="space-y-4">
              <Card hover={false}>
                <h4 className="font-inter text-[14px] font-extrabold text-slate-950">Risk & Discipline Alerts</h4>
                <div className="mt-3 space-y-2">
                  {warningCards.length ? warningCards.map((warning) => (
                    <div key={warning.title} className={cn('rounded-xl border px-3 py-2', warning.tone === 'red' ? 'border-red-200 bg-red-50 text-red-700' : warning.tone === 'orange' ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-amber-200 bg-amber-50 text-amber-700')}>
                      <p className="font-inter text-[12px] font-extrabold">{warning.title}</p>
                      <p className="font-kanit text-[12px] leading-5">{warning.detail}</p>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 font-kanit text-[12px] text-emerald-700">No active critical alerts. Risk profile is currently stable.</div>
                  )}
                </div>
              </Card>

              <Card hover={false}>
                <h4 className="font-inter text-[14px] font-extrabold text-slate-950">Trader Psychology</h4>
                <div className="mt-3 space-y-3">
                  {[
                    ['Confidence', avgConfidence],
                    ['Patience', Math.max(0, 100 - emotionRiskCount * 10)],
                    ['Fear / Revenge Risk', Math.min(100, emotionRiskCount * 20)],
                    ['Checklist Score', checklistRate],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="font-inter text-[12px] font-bold text-slate-700">{label}</p>
                        <span className="font-inter text-[11px] font-bold text-slate-500">{Number(value).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={cn('h-full rounded-full', label === 'Fear / Revenge Risk' ? 'bg-red-500' : 'bg-blue-500')} style={{ width: `${Math.max(0, Math.min(100, Number(value)))}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card hover={false}>
                <h4 className="font-inter text-[14px] font-extrabold text-slate-950">Daily Trading Checklist</h4>
                <p className="mt-1 font-kanit text-[12px] leading-5 text-slate-500">Checklist pass rate: {checklistDone}/{accountFilteredClosedTrades.length || 0}</p>
                <div className="mt-3 space-y-2">
                  {[
                    ['Checked economic calendar', checklistRate >= 60],
                    ['Reviewed market bias', checklistRate >= 50],
                    ['Defined setup criteria', checklistRate >= 55],
                    ['Max risk confirmed', dailyRiskUsedPct < 90],
                    ['Daily loss limit confirmed', drawdownUsedPct < 90],
                    ['Session plan established', accountFilteredClosedTrades.length > 0],
                  ].map(([item, passed]) => (
                    <div key={String(item)} className={cn('flex items-center justify-between rounded-xl border px-3 py-2', passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50')}>
                      <span className="font-kanit text-[12px] text-slate-700">{item}</span>
                      <Badge tone={passed ? 'green' : 'orange'}>{passed ? 'Done' : 'Pending'}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card hover={false}>
                <h4 className="font-inter text-[14px] font-extrabold text-slate-950">Fund / Account Timeline</h4>
                <div className="mt-3 space-y-2">
                  {[
                    ['Purchase Date', account.purchaseDate],
                    ['Challenge Deadline', account.deadlineDate],
                    ['Days Remaining', metrics.daysRemaining < 0 ? 'Expired' : `${metrics.daysRemaining} days`],
                    ['Trading Days Completed', `${account.completedTradingDays}/${account.minimumTradingDays}`],
                    ['Current Status', account.status],
                    ['Minimum Days Remaining', `${metrics.remainingTradingDays} days`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border bg-slate-50 px-3 py-2">
                      <p className="font-inter text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">{label}</p>
                      <p className="mt-1 font-inter text-[12px] font-bold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card hover={false}>
                <h4 className="font-inter text-[14px] font-extrabold text-slate-950">Account Notes</h4>
                <p className="mt-2 font-kanit text-[13px] leading-6 text-slate-700">{account.notes || 'No notes.'}</p>
              </Card>
            </div>
          </motion.div>
        );
      })() : null}

      {false && (
      <TerminalPanel
        title="Account Trade Calendar"
        action={
          <Select
            aria-label="Calendar account filter"
            options={calendarAccountOptions}
            value={calendarAccountFilter}
            onChange={(event) => setCalendarAccountFilter(event.target.value)}
            className="h-9 w-[210px] rounded-[8px] text-[12px]"
          />
        }
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          {accountCalendar.length ? accountCalendar.map((day) => (
            <div
              key={day.date}
              className={cn(
                'rounded-[10px] border p-3 transition hover:-translate-y-0.5',
                day.pnl >= 0
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/12 dark:text-emerald-100'
                  : 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-500/12 dark:text-red-100',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-inter text-[11px] font-extrabold">{day.weekday}</span>
                <span className="font-inter text-[10px] font-bold opacity-70">{day.date.slice(5)}</span>
              </div>
              <p className="mt-3 font-inter text-[20px] font-extrabold">{signedMoney(day.pnl)}</p>
              <p className="mt-1 font-kanit text-[12px] leading-5 opacity-80">{day.trades} trades · {day.r.toFixed(2)}R</p>
              <div className="mt-2 flex gap-2 font-inter text-[10px] font-bold opacity-80">
                <span>W {day.winners}</span>
                <span>L {day.losses}</span>
              </div>
            </div>
          )) : (
            <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 font-kanit text-[13px] text-slate-500 dark:border-[#17314e] dark:bg-[#061426] dark:text-slate-400">
              No closed trades for this account filter yet.
            </div>
          )}
        </div>
      </TerminalPanel>
      )}

      <section className="rounded-[10px] border border-slate-300 bg-slate-100 p-1 shadow-card dark:border-[#102942] dark:bg-[#04111f]">
        <div className="grid gap-1.5 xl:grid-cols-12">
          <TerminalPanel
            title="Equity Curve vs Benchmark"
            className="xl:col-span-7"
            action={
              <div className="flex rounded-[6px] border border-slate-200 bg-white p-0.5 font-inter text-[10px] font-bold text-slate-500 dark:border-[#17314e] dark:bg-[#061426] dark:text-slate-400">
                {['MTD', 'YTD', '1Y', 'All'].map((item, index) => (
                  <span key={item} className={cn('rounded-[5px] px-2 py-1', index === 0 && 'bg-blue-500/15 text-blue-500')}>{item}</span>
                ))}
              </div>
            }
          >
            <div className="h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={benchmarkCurve} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#17314e" strokeDasharray="3 3" opacity={0.55} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <YAxis tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}K`} tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <AnalyticsTooltip />
                  <Line type="monotone" dataKey="equity" name="Your Equity" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="#94A3B8" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="buyHold" name="Buy & Hold" stroke="#64748B" strokeWidth={1.2} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Performance Scorecard" className="xl:col-span-5">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr]">
              <div className="space-y-2">
                {[
                  ['Avg Win', signedMoney(avgWin), `${scopedWinners.length} wins`, 'text-emerald-400'],
                  ['Avg Loss', signedMoney(avgLoss), `${scopedLosers.length} losses`, 'text-red-400'],
                  ['Best Trade', signedMoney(bestTrade), `${bestTrade >= 0 ? '+' : ''}${bestTrade.toFixed(0)}`, 'text-emerald-400'],
                  ['Worst Trade', signedMoney(worstTrade), `${worstTrade.toFixed(0)}`, 'text-red-400'],
                ].map(([label, value, helper, tone]) => (
                  <div key={label} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#17314e] dark:bg-[#061426]">
                    <span className="font-inter text-[11px] font-semibold text-slate-600 dark:text-slate-300">{label}</span>
                    <span className={cn('font-inter text-[11px] font-extrabold', tone)}>{value}</span>
                    <span className="font-inter text-[10px] text-slate-500 dark:text-slate-400">{helper}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <ScoreRing label="Consistency Score" value={Math.round(safePercent(scopedWinners.length, scopedClosedTrades.length))} />
                <div className="rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-2 font-inter text-[11px] font-semibold text-slate-600 dark:border-[#17314e] dark:bg-[#061426] dark:text-slate-300">
                  <div className="flex items-center justify-between"><span>Avg Hold Time</span><span>3h 42m</span></div>
                </div>
                <ScoreRing label="Discipline Score" value={scopedDisciplineScore} />
              </div>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Performance Summary" className="xl:col-span-4">
            <div className="grid gap-3 md:grid-cols-[150px_1fr]">
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={scopedWinLossBreakEven} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={4} animationDuration={700}>
                      {scopedWinLossBreakEven.map((item) => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                    <AnalyticsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <div className="rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="font-inter text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">Total Closed Trades</p>
                  <p className="mt-1 font-inter text-[24px] font-extrabold text-slate-950">{scopedClosedTrades.length}</p>
                </div>
                {scopedWinLossBreakEven.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-[6px] border border-slate-200 bg-white px-3 py-2 font-inter text-[11px] font-bold text-slate-700">
                    <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                    <span>{item.value} ({safePercent(item.value, scopedClosedTrades.length)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Monthly PnL" className="xl:col-span-4">
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPnl} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#17314e" strokeDasharray="3 3" opacity={0.45} vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <YAxis tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}K`} tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <AnalyticsTooltip />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {monthlyPnl.map((item) => <Cell key={item.month} fill={item.pnl >= 0 ? '#22C55E' : '#EF4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TerminalPanel>

          <TerminalPanel title="R Distribution" className="xl:col-span-4">
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rDistribution} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#17314e" strokeDasharray="3 3" opacity={0.45} vertical={false} />
                  <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 9, fontFamily: 'Inter' }} />
                  <YAxis tickFormatter={(value) => `${value}`} tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <AnalyticsTooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Win / Loss Streak" className="xl:col-span-4">
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={streakData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#17314e" strokeDasharray="3 3" opacity={0.45} vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <AnalyticsTooltip />
                  <Line type="monotone" dataKey="win" stroke="#22C55E" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="loss" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Setup Performance" className="xl:col-span-4">
            <div className="overflow-hidden rounded-[6px] border border-slate-200 dark:border-[#17314e]">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-[#061426]">
                  <tr className="text-left font-inter text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {['Setup', 'Trades', 'Win Rate', 'Avg R', 'Net PnL'].map((item) => <th key={item} className="px-2 py-2">{item}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {groupedSetupStats.slice(0, 4).map((item) => (
                    <tr key={item.setup} className="border-t border-slate-200 font-inter text-[11px] text-slate-700 dark:border-[#17314e] dark:text-slate-300">
                      <td className="px-2 py-2 font-bold">{item.setup}</td>
                      <td className="px-2 py-2">{item.trades}</td>
                      <td className="px-2 py-2">{item.winRate}%</td>
                      <td className="px-2 py-2">{item.avgR}R</td>
                      <td className={cn('px-2 py-2 font-extrabold', item.netPnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>{signedMoney(item.netPnl)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Session Performance" className="xl:col-span-4">
            <div className="overflow-hidden rounded-[6px] border border-slate-200 dark:border-[#17314e]">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-[#061426]">
                  <tr className="text-left font-inter text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {['Session', 'Trades', 'Win Rate', 'Avg R', 'Net PnL'].map((item) => <th key={item} className="px-2 py-2">{item}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {groupedSessionStats.map((item) => (
                    <tr key={item.session} className="border-t border-slate-200 font-inter text-[11px] text-slate-700 dark:border-[#17314e] dark:text-slate-300">
                      <td className="px-2 py-2 font-bold">{item.session}</td>
                      <td className="px-2 py-2">{item.trades}</td>
                      <td className="px-2 py-2">{item.winRate}%</td>
                      <td className="px-2 py-2">{item.avgR}R</td>
                      <td className={cn('px-2 py-2 font-extrabold', item.netPnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>{signedMoney(item.netPnl)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Asset Performance" className="xl:col-span-4">
            <div className="overflow-hidden rounded-[6px] border border-slate-200 dark:border-[#17314e]">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-[#061426]">
                  <tr className="text-left font-inter text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {['Asset', 'Trades', 'Net PnL', 'Share'].map((item) => <th key={item} className="px-2 py-2">{item}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {groupedAssetPerformance.slice(0, 5).map((item) => (
                    <tr key={item.name} className="border-t border-slate-200 font-inter text-[11px] text-slate-700 dark:border-[#17314e] dark:text-slate-300">
                      <td className="px-2 py-2 font-bold">{item.name}</td>
                      <td className="px-2 py-2">{item.value}</td>
                      <td className={cn('px-2 py-2 font-extrabold', item.netPnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>{signedMoney(item.netPnl)}</td>
                      <td className="px-2 py-2">{Math.round((item.value / Math.max(1, scopedClosedTrades.length)) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TerminalPanel>

          <TerminalPanel
            title="Trading Calendar Heatmap"
            className="xl:col-span-8"
            action={<Select aria-label="Heatmap month" options={monthOptions} value={heatmapMonth} onChange={(event) => setHeatmapMonth(event.target.value)} className="h-8 w-[130px] rounded-[8px] text-[11px]" />}
          >
            <div className="overflow-x-auto pb-1">
              <div className="min-w-[980px]">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-kanit text-[12px] leading-5 text-slate-500 dark:text-slate-400">
                    มุมมองแบบ Habit Heatmap สำหรับการเทรด: สีเขียวคือกำไร สีแดงคือขาดทุน สีเทาคือไม่มีผลลัพธ์ชัดเจน
                  </p>
                  <Badge tone="blue">{monthLabel(tradingHeatmap.month)}</Badge>
                </div>
                <div className="grid grid-cols-[130px_repeat(31,minmax(20px,1fr))] gap-1">
                  <div />
                  {Array.from({ length: 31 }, (_, index) => (
                    <div key={index} className="text-center font-inter text-[10px] font-bold leading-4 text-slate-500 dark:text-slate-400">
                      {index + 1}
                    </div>
                  ))}

                  {tradingHeatmap.rows.map((row, rowIndex) => (
                    <div key={row.id} className="contents">
                      <div className="flex items-center truncate py-1 pr-2 font-inter text-[12px] font-bold leading-5 text-slate-800 dark:text-slate-200">{row.label}</div>
                      {row.cells.map((cell, cellIndex) => (
                        <motion.div
                          key={`${row.id}-${cell.day}`}
                          title={`${row.label} ${cell.date}: ${cell.trades.length} trades, ${signedMoney(cell.pnl)}, ${cell.r.toFixed(2)}R`}
                          className={cn(
                            'h-6 min-w-[20px] rounded-md border transition hover:ring-2 hover:ring-primary-soft',
                            cell.disabled ? 'border-slate-100 bg-slate-50 opacity-40 dark:border-[#17314e] dark:bg-[#061426]' : heatmapTone(cell.pnl, cell.trades.length),
                          )}
                          initial={{ opacity: 0, scale: 0.72 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ delay: (rowIndex * 31 + cellIndex) * 0.002, duration: 0.16 }}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-3 font-inter text-[11px] font-semibold leading-4 text-slate-500 dark:text-slate-400">
                  {[
                    ['No Trade', 'border-slate-200 bg-white'],
                    ['Loss', 'border-red-200 bg-red-100'],
                    ['Flat / BE', 'border-slate-200 bg-slate-100'],
                    ['Win', 'border-emerald-200 bg-emerald-100'],
                    ['Strong Win', 'border-emerald-700 bg-emerald-600'],
                  ].map(([label, tone]) => (
                    <span key={label} className="inline-flex items-center gap-1.5">
                      <i className={cn('h-3 w-3 rounded border', tone)} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </TerminalPanel>

          <TerminalPanel title="MAE vs MFE" className="xl:col-span-4">
            <div className="h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#17314e" strokeDasharray="3 3" opacity={0.45} />
                  <XAxis type="number" dataKey="mae" tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <YAxis type="number" dataKey="mfe" tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <ReferenceLine x={0} stroke="#8AA4BF" strokeDasharray="4 4" />
                  <ReferenceLine y={0} stroke="#8AA4BF" strokeDasharray="4 4" />
                  <AnalyticsTooltip />
                  <Scatter data={scopedMaeMfeData}>
                    {scopedMaeMfeData.map((item, index) => <Cell key={`${item.symbol}-${index}`} fill={item.result === 'Win' ? '#22C55E' : item.result === 'Loss' ? '#EF4444' : '#94A3B8'} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Drawdown & Recovery" className="xl:col-span-4">
            <div className="h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scopedDrawdownCurve} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ddFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#17314e" strokeDasharray="3 3" opacity={0.45} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <AnalyticsTooltip />
                  <Area type="monotone" dataKey="drawdownPct" stroke="#EF4444" fill="url(#ddFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Planned vs Actual RRR" className="xl:col-span-4">
            <div className="h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#17314e" strokeDasharray="3 3" opacity={0.45} />
                  <XAxis type="number" dataKey="planned" name="Planned RRR" tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <YAxis type="number" dataKey="actual" name="Actual RRR" tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <ReferenceLine x={1} stroke="#8AA4BF" strokeDasharray="4 4" />
                  <ReferenceLine y={1} stroke="#8AA4BF" strokeDasharray="4 4" />
                  <AnalyticsTooltip />
                  <Scatter data={scopedRrrData}>
                    {scopedRrrData.map((item, index) => <Cell key={`${item.symbol}-${index}`} fill={item.realized > 0 ? '#22C55E' : item.realized < 0 ? '#EF4444' : '#94A3B8'} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Emotion vs Result" className="xl:col-span-4">
            <div className="overflow-hidden rounded-[6px] border border-slate-200 dark:border-[#17314e]">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-[#061426]">
                  <tr className="text-left font-inter text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {['Emotion', 'Trades', 'Win Rate', 'Avg R', 'Mistakes'].map((item) => <th key={item} className="px-2 py-2">{item}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {scopedEmotionStats.length ? scopedEmotionStats.map((item) => (
                    <tr key={item.emotion} className="border-t border-slate-200 font-inter text-[11px] text-slate-700 dark:border-[#17314e] dark:text-slate-300">
                      <td className="px-2 py-2 font-bold">{item.emotion}</td>
                      <td className="px-2 py-2">{item.trades}</td>
                      <td className="px-2 py-2">{item.winRate}%</td>
                      <td className={cn('px-2 py-2 font-extrabold', item.avgR >= 0 ? 'text-emerald-400' : 'text-red-400')}>{item.avgR}R</td>
                      <td className="px-2 py-2">{item.mistakes}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-3 py-4 font-kanit text-[12px] text-slate-500">No psychology data recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Commission Impact" className="xl:col-span-4">
            <div className="h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commissionImpactData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#17314e" strokeDasharray="3 3" opacity={0.45} vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <YAxis tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}K`} tickLine={false} axisLine={false} tick={{ fill: '#8AA4BF', fontSize: 10, fontFamily: 'Inter' }} />
                  <AnalyticsTooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {commissionImpactData.map((item) => <Cell key={item.label} fill={item.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 font-kanit text-[11px] leading-5 text-slate-500">Commission is {scopedGrossWin ? Math.round((scopedCommissionTotal / Math.max(1, scopedGrossWin)) * 100) : 0}% of gross winning PnL in the current filter.</p>
          </TerminalPanel>

          {false && [
            ['Best Conditions', 'border-emerald-500/50 bg-emerald-500/10', bestConditions.map((item) => `${item.session}: ${item.winRate}% WR, ${item.avgR}R avg`)],
            ['Worst Conditions', 'border-red-500/50 bg-red-500/10', (worstConditions.length ? worstConditions : groupedSessionStats.slice(-3)).map((item) => `${item.session}: ${item.winRate}% WR, ${item.avgR}R avg`)],
            ['AI Insights', 'border-blue-500/50 bg-blue-500/10', [`Breakout and London remain the strongest context.`, `Discipline score is ${scopedDisciplineScore}/100.`, `Net result is ${scopedTotalR.toFixed(2)}R from ${scopedClosedTrades.length} closed trades.`]],
            ['Suggested Improvements', 'border-amber-500/50 bg-amber-500/10', ['Reduce trades after two losses.', 'Review low CF entries before scaling.', 'Keep screenshots before and after every trade.']],
          ].map(([title, tone, items]) => (
            <div key={title as string} className={cn('rounded-[8px] border p-3', tone as string)}>
              <h3 className="font-inter text-[12px] font-extrabold text-slate-900 dark:text-slate-100">{title as string}</h3>
              <ul className="mt-2 space-y-1.5 font-kanit text-[11px] leading-5 text-slate-600 dark:text-slate-300">
                {(items as string[]).map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4">
        <div className="min-w-0 space-y-4">
          {false && (
          <div className="hidden">
            {trading.fundingAccounts.map((account, index) => {
              const net = account.currentBalance - account.startingBalance - account.purchaseFee - account.resetFees - account.monthlyFee;
              const tones = ['from-orange-400 to-rose-500', 'from-blue-500 to-indigo-500', 'from-cyan-400 to-teal-500', 'from-emerald-400 to-green-500'];
              return (
                <div key={account.id} className={cn('rounded-2xl bg-gradient-to-br p-5 text-white shadow-card transition hover:-translate-y-1 hover:shadow-lift', tones[index % tones.length])}>
                  <div className="flex items-start justify-between">
                    <div className="rounded-2xl bg-white/20 px-3 py-2 font-inter text-[14px] font-extrabold">{account.iconLabel}</div>
                    <Badge tone={account.status === 'Failed' ? 'red' : 'green'}>{account.status}</Badge>
                  </div>
                  <p className="mt-5 font-inter text-[17px] font-extrabold leading-6">{account.accountName}</p>
                  <p className="mt-1 font-kanit text-[12px] text-white/80">{account.provider} · {account.platform}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-inter text-[11px] text-white/70">Balance</p>
                      <p className="font-inter text-[18px] font-extrabold">{money(account.currentBalance)}</p>
                    </div>
                    <div>
                      <p className="font-inter text-[11px] text-white/70">Net</p>
                      <p className="font-inter text-[18px] font-extrabold">{signedMoney(net)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {false && (
          <div className="hidden">
            <ChartPanel title="Equity Curve" subtitle="Account equity from closed trade journal records." className="xl:col-span-4">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trading.equityCurve} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="equityFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.34} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} />
                    <YAxis tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}K`} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} />
                    <AnalyticsTooltip />
                    <Area type="monotone" dataKey="equity" stroke="#38BDF8" strokeWidth={3} fill="url(#equityFill)" animationDuration={700} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            <ChartPanel title="Win / Loss / BE" subtitle="Result mix from closed trades." className="xl:col-span-2">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={trading.winLossBreakEven} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={4} animationDuration={700}>
                      {trading.winLossBreakEven.map((item) => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                    <AnalyticsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid gap-2">
                {trading.winLossBreakEven.map((item) => (
                  <div key={item.name} className="flex items-center justify-between border-b border-border pb-2 font-inter text-[12px] font-bold text-slate-600">
                    <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </ChartPanel>

            <ChartPanel title="PnL by Period" subtitle="Weekly realized profit and loss." className="xl:col-span-2">
              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trading.pnlByPeriod} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} />
                    <AnalyticsTooltip />
                    <Bar dataKey="pnl" radius={[10, 10, 0, 0]} animationDuration={700}>
                      {trading.pnlByPeriod.map((item) => <Cell key={item.period} fill={item.pnl >= 0 ? '#22C55E' : '#EF4444'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            <ChartPanel title="Setup Performance" subtitle="Win rate and net PnL by setup." className="xl:col-span-4">
              <div className="space-y-3">
                {trading.setupStats.slice(0, 5).map((item) => (
                  <div key={item.setup} className="rounded-2xl border border-border bg-slate-50/70 p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="font-inter text-[12px] font-extrabold text-slate-800">{item.setup}</span>
                      <span className={cn('font-inter text-[12px] font-extrabold', item.netPnl >= 0 ? 'text-emerald-600' : 'text-red-500')}>{signedMoney(item.netPnl)}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
                      <div className="h-2 overflow-hidden rounded-full bg-white">
                        <div className={cn('h-full rounded-full', item.netPnl >= 0 ? 'bg-emerald-500' : 'bg-red-500')} style={{ width: `${Math.min(100, Math.abs(item.netPnl) / 220)}%` }} />
                      </div>
                      <span className="font-inter text-[11px] font-bold text-slate-500">{item.trades} trades</span>
                      <span className="font-inter text-[11px] font-bold text-slate-500">{item.winRate}% WR</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartPanel>
          </div>
          )}

          <Card hover={false} className="min-w-0">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-section-title">Trade Journal</h2>
                <p className="text-page-subtitle">New trades update KPIs, funding balances, heatmap, and journal rows immediately.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<RefreshCw size={14} />}
                  onClick={() =>
                    setAccountScopeFilters({
                      account: 'All',
                      provider: 'All',
                      accountType: 'All',
                      accountStatus: 'All',
                      symbol: 'All',
                      direction: 'All',
                      outcome: 'All',
                      setup: 'All',
                      session: 'All',
                      emotion: 'All',
                      hasScreenshot: 'All',
                      assetType: 'All',
                      mistakeTag: 'All',
                      checklistStatus: 'All',
                      reviewed: 'All',
                      riskLevel: 'All',
                      sort: 'date-desc',
                      dateRange: 'All',
                    })
                  }
                >
                  Reset filters
                </Button>
                <Badge tone="blue">{filteredTrades.length}/{trading.trades.length} records</Badge>
              </div>
            </div>

            <div className="mb-4 grid gap-2 rounded-2xl border border-border bg-slate-50/80 p-3 md:grid-cols-3 xl:grid-cols-7">
              <Select label="Account" options={accountOptions} value={accountScopeFilters.account} onChange={(event) => setAccountScopeFilters((current) => ({ ...current, account: event.target.value }))} />
              <Select label="Symbol" options={['All', ...symbols]} value={accountScopeFilters.symbol} onChange={(event) => setAccountScopeFilters((current) => ({ ...current, symbol: event.target.value }))} />
              <Select label="Asset Type" options={['All', 'CFD', 'Futures']} value={accountScopeFilters.assetType} onChange={(event) => setAccountScopeFilters((current) => ({ ...current, assetType: event.target.value }))} />
              <Select label="Setup" options={['All', ...setups]} value={accountScopeFilters.setup} onChange={(event) => setAccountScopeFilters((current) => ({ ...current, setup: event.target.value }))} />
              <Select label="Direction" options={['All', 'Long', 'Short']} value={accountScopeFilters.direction} onChange={(event) => setAccountScopeFilters((current) => ({ ...current, direction: event.target.value }))} />
              <Select label="Result" options={['All', 'Win', 'Loss', 'BE', 'Open']} value={accountScopeFilters.outcome} onChange={(event) => setAccountScopeFilters((current) => ({ ...current, outcome: event.target.value }))} />
              <Select
                label="Sort"
                options={accountScopeSortOptions}
                value={accountScopeFilters.sort}
                onChange={(event) => setAccountScopeFilters((current) => ({ ...current, sort: event.target.value }))}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] table-fixed border-separate border-spacing-0">
                <thead>
                  <tr className="text-left">
                    {['Date', 'Time', 'Symbol', 'Direction', 'Session', 'Setup', 'Risk', 'Result', 'MFE', 'MAE', 'CF', 'Status', 'Emotion', 'Review', 'Mistakes'].map((header) => (
                      <th key={header} className="border-b border-border px-2 py-2 font-inter text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => (
                    <tr
                      key={trade.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTrade(trade)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') setSelectedTrade(trade);
                      }}
                      className="cursor-pointer transition duration-180 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
                    >
                      <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-medium text-slate-700">{trade.date}</td>
                      <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-medium text-slate-700">{trade.entryTime ?? '-'}</td>
                      <td className="border-b border-border px-2 py-2"><span className={cn('rounded-full border px-2 py-0.5 font-inter text-[11px] font-extrabold', chipClass('blue'))}>{trade.symbol}</span></td>
                      <td className="border-b border-border px-2 py-2"><span className={cn('rounded-full border px-2 py-0.5 font-inter text-[11px] font-bold', chipClass(trade.direction === 'Long' ? 'green' : 'red'))}>{trade.direction}</span></td>
                      <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-semibold text-slate-700">{trade.session}</td>
                      <td className="border-b border-border px-2 py-2"><span className={cn('line-clamp-1 rounded-full border px-2 py-0.5 font-inter text-[11px] font-bold', chipClass('purple'))}>{trade.setup}</span></td>
                      <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-semibold text-slate-700">{money(trade.riskAmount)}</td>
                      <td className="border-b border-border px-2 py-2"><Badge tone={resultTone(trade.resultR)}>{trade.resultR}R</Badge></td>
                      <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.mfeR ?? '-'}R</td>
                      <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.maeR ?? '-'}R</td>
                      <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.confidenceScore ?? '-'}%</td>
                      <td className="border-b border-border px-2 py-2"><Badge tone={trade.status === 'Closed' ? 'green' : trade.status === 'Open' ? 'blue' : 'orange'}>{trade.status}</Badge></td>
                      <td className="border-b border-border px-2 py-2"><span className={cn('rounded-full border px-2 py-0.5 font-inter text-[11px] font-bold', chipClass(['Fearful', 'Greedy', 'Revenge'].includes(trade.emotion) ? 'red' : 'green'))}>{trade.emotion}</span></td>
                      <td className="border-b border-border px-2 py-2">
                        <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedTrade(trade); }} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 font-inter text-[11px] font-extrabold text-blue-700 transition hover:scale-[1.04] hover:bg-blue-100">
                          <Eye size={13} /> View
                        </button>
                      </td>
                      <td className="border-b border-border px-2 py-2">
                        <div className="flex flex-wrap gap-1">
                          {(trade.mistakeTags ?? ['None']).slice(0, 2).map((tag) => <span key={tag} className={cn('rounded-full border px-2 py-0.5 font-inter text-[10px] font-bold', chipClass(tag === 'None' ? 'slate' : 'orange'))}>{tag}</span>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {false && (
        <div className="hidden">
          <Card>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-section-title">Trading Heatmap</h2>
                <p className="text-page-subtitle">Synced with closed trades.</p>
              </div>
              <Select aria-label="Heatmap month" options={monthOptions} value={heatmapMonth} onChange={(event) => setHeatmapMonth(event.target.value)} className="w-[130px]" />
            </div>
            <div className="grid grid-cols-6 gap-1">
              {tradingHeatmap.rows.flatMap((row) => row.cells.map((cell) => ({ ...cell, label: row.label }))).map((cell) => (
                <div
                  key={`${cell.label}-${cell.day}`}
                  title={`${cell.label} ${cell.date}: ${cell.trades.length} trades ${signedMoney(cell.pnl)}`}
                  className={cn(
                    'h-12 rounded-xl border p-1 text-[10px] transition hover:scale-[1.04]',
                    heatmapTone(cell.pnl, cell.trades.length),
                  )}
                >
                  <p className="font-bold">{cell.label}</p>
                  <p>{cell.day}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-section-title">Drawdown</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ['Max DD', `${trading.drawdown.maxDrawdownPct}%`],
                ['Max R', `${trading.drawdown.maxDrawdownR}R`],
                ['Longest', `${trading.drawdown.longestDrawdown} trades`],
                ['Recovery', `${trading.drawdown.recoveryFactor}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-border bg-slate-50 p-4">
                  <p className="font-inter text-[11px] font-bold text-slate-500">{label}</p>
                  <p className="mt-2 font-inter text-[24px] font-extrabold text-red-500">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-section-title">Session Performance</h2>
            <div className="mt-4 space-y-3">
              {trading.sessionStats.map((item) => (
                <div key={item.session}>
                  <div className="mb-1 flex items-center justify-between font-inter text-[12px] font-bold text-slate-700">
                    <span>{item.session}</span>
                    <span>{signedMoney(item.netPnl)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn('h-full rounded-full', item.netPnl >= 0 ? 'bg-emerald-500' : 'bg-red-500')} style={{ width: `${Math.min(100, Math.abs(item.netR) * 18)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        )}
      </div>

      <Modal
        open={accountDetailOpen && !!activeAccount}
        onClose={() => setAccountDetailOpen(false)}
        title={activeAccount ? `${activeAccount.accountName} · Account Analytics` : 'Account Analytics'}
        subtitle={activeAccount ? `${activeAccount.provider} · ${activeAccount.accountType} · ${activeAccount.platform}` : undefined}
        size="full"
      >
        {activeAccount ? (() => {
          const account = activeAccount;
          const accountAllTrades = filteredTrades
            .filter((trade) => trade.fundingAccountId === account.id)
            .sort((a, b) => (`${a.date}-${a.entryTime ?? '00:00'}`).localeCompare(`${b.date}-${b.entryTime ?? '00:00'}`));
          const closed = scopedClosedTrades
            .filter((trade) => trade.fundingAccountId === account.id)
            .sort((a, b) => (`${a.date}-${a.entryTime ?? '00:00'}`).localeCompare(`${b.date}-${b.entryTime ?? '00:00'}`));
          const wins = closed.filter((trade) => trade.resultR > 0);
          const losses = closed.filter((trade) => trade.resultR < 0);
          const beTrades = closed.filter((trade) => trade.resultR === 0);
          const equity = closed.reduce((rows, trade) => {
            const prev = rows[rows.length - 1]?.equity ?? account.startingBalance;
            rows.push({ day: trade.date.slice(5), equity: prev + tradeProfit(trade), pnl: tradeProfit(trade), r: trade.resultR });
            return rows;
          }, [] as { day: string; equity: number; pnl: number; r: number }[]);
          const weekly = Array.from(
            closed.reduce((map, trade) => {
              const week = `W${Math.ceil(Number(trade.date.slice(8)) / 7)}`;
              const current = map.get(week) ?? { week, pnl: 0, trades: 0 };
              map.set(week, { week, pnl: current.pnl + tradeProfit(trade), trades: current.trades + 1 });
              return map;
            }, new Map<string, { week: string; pnl: number; trades: number }>()),
            ([, value]) => value,
          );
          const monthly = Array.from(
            closed.reduce((map, trade) => {
              const month = trade.date.slice(0, 7);
              map.set(month, (map.get(month) ?? 0) + tradeProfit(trade));
              return map;
            }, new Map<string, number>()),
            ([month, pnl]) => ({ month, pnl }),
          );
          const setupSummary = Array.from(
            closed.reduce((map, trade) => {
              const current = map.get(trade.setup) ?? { key: trade.setup, pnl: 0, trades: 0 };
              map.set(trade.setup, { key: trade.setup, pnl: current.pnl + tradeProfit(trade), trades: current.trades + 1 });
              return map;
            }, new Map<string, { key: string; pnl: number; trades: number }>()),
            ([, value]) => value,
          ).sort((a, b) => b.pnl - a.pnl);
          const sessionSummary = Array.from(
            closed.reduce((map, trade) => {
              const current = map.get(trade.session) ?? { key: trade.session, pnl: 0, trades: 0 };
              map.set(trade.session, { key: trade.session, pnl: current.pnl + tradeProfit(trade), trades: current.trades + 1 });
              return map;
            }, new Map<string, { key: string; pnl: number; trades: number }>()),
            ([, value]) => value,
          ).sort((a, b) => b.pnl - a.pnl);
          const symbolSummary = Array.from(
            closed.reduce((map, trade) => {
              const current = map.get(trade.symbol) ?? { key: trade.symbol, pnl: 0, trades: 0 };
              map.set(trade.symbol, { key: trade.symbol, pnl: current.pnl + tradeProfit(trade), trades: current.trades + 1 });
              return map;
            }, new Map<string, { key: string; pnl: number; trades: number }>()),
            ([, value]) => value,
          ).sort((a, b) => b.pnl - a.pnl);
          const resultBreakdown = [
            { name: 'Win', value: wins.length, color: '#22C55E' },
            { name: 'Loss', value: losses.length, color: '#EF4444' },
            { name: 'BE', value: beTrades.length, color: '#94A3B8' },
          ];

          return (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                {[
                  ['Total Trades', `${closed.length}`],
                  ['Win Rate', `${closed.length ? ((wins.length / closed.length) * 100).toFixed(2) : '0.00'}%`],
                  ['Net PnL', signedMoney(closed.reduce((sum, trade) => sum + tradeProfit(trade), 0))],
                  ['Total R', `${closed.reduce((sum, trade) => sum + trade.resultR, 0).toFixed(2)}R`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-border bg-slate-50 p-3">
                    <p className="font-inter text-[11px] font-bold text-slate-500">{label}</p>
                    <p className="mt-1 font-inter text-[22px] font-extrabold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <Card hover={false}>
                  <h4 className="font-inter text-[14px] font-extrabold text-slate-950">Equity Curve</h4>
                  <div className="mt-3 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={equity} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} />
                        <YAxis tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}K`} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} />
                        <AnalyticsTooltip />
                        <Line type="monotone" dataKey="equity" stroke="#3B82F6" strokeWidth={2.4} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card hover={false}>
                  <h4 className="font-inter text-[14px] font-extrabold text-slate-950">Performance Summary</h4>
                  <div className="mt-3 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={resultBreakdown} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="80%">
                          {resultBreakdown.map((item) => <Cell key={item.name} fill={item.color} />)}
                        </Pie>
                        <AnalyticsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {resultBreakdown.map((item) => (
                      <div key={item.name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                        <span className="inline-flex items-center gap-2 font-inter text-[12px] font-bold text-slate-700"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{item.name}</span>
                        <span className="font-inter text-[12px] font-extrabold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <Card hover={false}>
                  <h4 className="font-inter text-[13px] font-extrabold text-slate-950">Weekly Performance</h4>
                  <div className="mt-3 h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekly}>
                        <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} />
                        <AnalyticsTooltip />
                        <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                          {weekly.map((item) => <Cell key={item.week} fill={item.pnl >= 0 ? '#22C55E' : '#EF4444'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card hover={false}>
                  <h4 className="font-inter text-[13px] font-extrabold text-slate-950">Monthly Performance</h4>
                  <div className="mt-3 h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthly}>
                        <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} />
                        <AnalyticsTooltip />
                        <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                          {monthly.map((item) => <Cell key={item.month} fill={item.pnl >= 0 ? '#22C55E' : '#EF4444'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card hover={false}>
                  <h4 className="font-inter text-[13px] font-extrabold text-slate-950">Setup / Session / Symbol</h4>
                  <div className="mt-3 space-y-2">
                    {[
                      { label: 'Setup', rows: setupSummary },
                      { label: 'Session', rows: sessionSummary },
                      { label: 'Symbol', rows: symbolSummary },
                    ].map(({ label, rows }) => (
                      <div key={label} className="rounded-lg border border-border bg-slate-50 p-2">
                        <p className="font-inter text-[11px] font-bold text-slate-500">{label}</p>
                        {rows.slice(0, 3).map((item) => (
                          <div key={`${label}-${item.key}`} className="mt-1 flex items-center justify-between font-inter text-[12px]">
                            <span className="font-semibold text-slate-700">{item.key}</span>
                            <span className={cn('font-extrabold', item.pnl >= 0 ? 'text-emerald-600' : 'text-red-500')}>{signedMoney(item.pnl)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card hover={false}>
                <h4 className="font-inter text-[14px] font-extrabold text-slate-950">Trade History per Account</h4>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[1450px]">
                    <thead>
                      <tr>
                        {['Date', 'Symbol', 'Direction', 'Setup', 'Session', 'Entry', 'Exit', 'SL', 'TP', 'PnL', 'R', 'Outcome', 'Mistakes', 'Emotion', 'Notes', 'Before', 'After'].map((item) => (
                          <th key={item} className="border-b border-border px-2 py-2 text-left font-inter text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">{item}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {accountAllTrades.map((trade) => (
                        <tr key={trade.id} className="hover:bg-slate-50">
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.date}</td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] font-extrabold text-slate-900">{trade.symbol}</td>
                          <td className="border-b border-border px-2 py-2"><Badge tone={trade.direction === 'Long' ? 'blue' : 'red'}>{trade.direction}</Badge></td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.setup}</td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.session}</td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.entryPrice}</td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.exitPrice ?? '-'}</td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.stopLoss}</td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.takeProfit}</td>
                          <td className={cn('border-b border-border px-2 py-2 font-inter text-[12px] font-bold', tradeProfit(trade) >= 0 ? 'text-emerald-600' : 'text-red-500')}>{signedMoney(tradeProfit(trade))}</td>
                          <td className="border-b border-border px-2 py-2"><Badge tone={resultTone(trade.resultR)}>{trade.resultR}R</Badge></td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{resultName(trade)}</td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{(trade.mistakeTags ?? ['None']).join(', ')}</td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.emotion}</td>
                          <td className="border-b border-border px-2 py-2 font-kanit text-[12px] text-slate-700">{trade.notes || '-'}</td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.preTradeImageUrl ? 'Yes' : 'No'}</td>
                          <td className="border-b border-border px-2 py-2 font-inter text-[12px] text-slate-700">{trade.postTradeImageUrl ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          );
        })() : null}
      </Modal>

      <Modal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        title={editingAccountId ? 'Edit Account' : 'Add Account'}
        subtitle={editingAccountId ? 'Update prop firm rules, fees, balance, deadline, and linked account data.' : 'Create a funding account that links with Add Trade, account filters, and Funding Account Monitor.'}
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAccountModalOpen(false)}>Cancel</Button>
            <Button icon={<Plus size={16} />} onClick={saveAccount}>{editingAccountId ? 'Update Account' : 'Save Account'}</Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Provider" value={accountForm.provider} onChange={(event) => setAccountForm({ ...accountForm, provider: event.target.value })} />
          <Input label="Account Name" value={accountForm.accountName} onChange={(event) => setAccountForm({ ...accountForm, accountName: event.target.value })} />
          <Input label="Account Type" value={accountForm.accountType} onChange={(event) => setAccountForm({ ...accountForm, accountType: event.target.value })} />
          <Input label="Icon Label" value={accountForm.iconLabel} onChange={(event) => setAccountForm({ ...accountForm, iconLabel: event.target.value })} />
          <Select label="Status" options={['Challenge', 'Active', 'Funded', 'Passed', 'Failed', 'Paused']} value={accountForm.status} onChange={(event) => setAccountForm({ ...accountForm, status: event.target.value as FundingAccountStatus })} />
          <Input label="Platform" value={accountForm.platform} onChange={(event) => setAccountForm({ ...accountForm, platform: event.target.value })} />
          <Input label="Purchase Date" type="date" value={accountForm.purchaseDate} onChange={(event) => setAccountForm({ ...accountForm, purchaseDate: event.target.value })} />
          <Input label="Deadline Date" type="date" value={accountForm.deadlineDate} onChange={(event) => setAccountForm({ ...accountForm, deadlineDate: event.target.value })} />
          <Input label="Account Number" value={accountForm.accountNumber} onChange={(event) => setAccountForm({ ...accountForm, accountNumber: event.target.value })} />
          <Input label="Account Size" value={accountForm.accountSize} onChange={(event) => setAccountForm({ ...accountForm, accountSize: event.target.value })} />
          <Input label="Starting Balance" value={accountForm.startingBalance} onChange={(event) => setAccountForm({ ...accountForm, startingBalance: event.target.value })} />
          <Input label="Current Balance" value={accountForm.currentBalance} onChange={(event) => setAccountForm({ ...accountForm, currentBalance: event.target.value })} />
          <Input label="Purchase Fee" value={accountForm.purchaseFee} onChange={(event) => setAccountForm({ ...accountForm, purchaseFee: event.target.value })} />
          <Input label="Reset Fees" value={accountForm.resetFees} onChange={(event) => setAccountForm({ ...accountForm, resetFees: event.target.value })} />
          <Input label="Monthly Fee" value={accountForm.monthlyFee} onChange={(event) => setAccountForm({ ...accountForm, monthlyFee: event.target.value })} />
          <Input label="Profit Target" value={accountForm.profitTarget} onChange={(event) => setAccountForm({ ...accountForm, profitTarget: event.target.value })} />
          <Input label="Max Drawdown" value={accountForm.maxDrawdownLimit} onChange={(event) => setAccountForm({ ...accountForm, maxDrawdownLimit: event.target.value })} />
          <Input label="Daily Drawdown" value={accountForm.dailyDrawdownLimit} onChange={(event) => setAccountForm({ ...accountForm, dailyDrawdownLimit: event.target.value })} />
          <Input label="Minimum Trading Days" value={accountForm.minimumTradingDays} onChange={(event) => setAccountForm({ ...accountForm, minimumTradingDays: event.target.value })} />
          <Input label="Completed Trading Days" value={accountForm.completedTradingDays} onChange={(event) => setAccountForm({ ...accountForm, completedTradingDays: event.target.value })} />
          <Input label="Current Drawdown %" value={accountForm.currentDrawdownPct} onChange={(event) => setAccountForm({ ...accountForm, currentDrawdownPct: event.target.value })} />
          <div className="md:col-span-3">
            <Textarea label="Notes" value={accountForm.notes} onChange={(event) => setAccountForm({ ...accountForm, notes: event.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal
        open={tradeModalOpen}
        onClose={() => {
          setTradeModalOpen(false);
          setEditingTradeId(null);
          setTradeForm(initialTradeForm);
        }}
        title={editingTradeId ? 'Edit Trade' : 'Add Trade'}
        subtitle="Save execution data, screenshots, and the CF checklist before entering or after closing the trade."
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setTradeModalOpen(false);
                setEditingTradeId(null);
                setTradeForm(initialTradeForm);
              }}
            >
              Cancel
            </Button>
            <Button icon={<Plus size={16} />} onClick={saveTrade}>{editingTradeId ? 'Update Trade' : 'Save Trade'}</Button>
          </div>
        }
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Date" type="date" value={tradeForm.date} onChange={(event) => setTradeForm({ ...tradeForm, date: event.target.value })} />
              <Select label="Account" options={[{ label: 'No account', value: '' }, ...allAccounts.map((account) => ({ label: account.accountName, value: account.id }))]} value={tradeForm.fundingAccountId} onChange={(event) => setTradeForm({ ...tradeForm, fundingAccountId: event.target.value })} />
              <Select label="Status" options={statuses} value={tradeForm.status} onChange={(event) => setTradeForm({ ...tradeForm, status: event.target.value as TradeStatus })} />
              <Input label="Entry Time" type="time" value={tradeForm.entryTime} onChange={(event) => setTradeForm({ ...tradeForm, entryTime: event.target.value })} />
              <Input label="Exit Time" type="time" value={tradeForm.exitTime} onChange={(event) => setTradeForm({ ...tradeForm, exitTime: event.target.value })} />
              <Select label="Symbol" options={symbols} value={tradeForm.symbol} onChange={(event) => setTradeForm({ ...tradeForm, symbol: event.target.value })} />
              <Select label="Direction" options={['Long', 'Short']} value={tradeForm.direction} onChange={(event) => setTradeForm({ ...tradeForm, direction: event.target.value as TradeDirection })} />
              <Select label="Session" options={sessions} value={tradeForm.session} onChange={(event) => setTradeForm({ ...tradeForm, session: event.target.value as TradingSession })} />
              <Input label="Timeframe" value={tradeForm.timeframe} onChange={(event) => setTradeForm({ ...tradeForm, timeframe: event.target.value })} />
              <Select label="Setup" options={setups} value={tradeForm.setup} onChange={(event) => setTradeForm({ ...tradeForm, setup: event.target.value })} />
              <Input label="Risk Amount" value={tradeForm.riskAmount} onChange={(event) => setTradeForm({ ...tradeForm, riskAmount: event.target.value })} />
              <Input label="Commission" value={tradeForm.commission} onChange={(event) => setTradeForm({ ...tradeForm, commission: event.target.value })} />
              <Input label="Entry Price" value={tradeForm.entryPrice} onChange={(event) => setTradeForm({ ...tradeForm, entryPrice: event.target.value })} />
              <Input label="Stop Loss" value={tradeForm.stopLoss} onChange={(event) => setTradeForm({ ...tradeForm, stopLoss: event.target.value })} />
              <Input label="Take Profit" value={tradeForm.takeProfit} onChange={(event) => setTradeForm({ ...tradeForm, takeProfit: event.target.value })} />
              <Input label="Exit Price" value={tradeForm.exitPrice} onChange={(event) => setTradeForm({ ...tradeForm, exitPrice: event.target.value })} />
              <Input label="Result R" value={tradeForm.resultR} onChange={(event) => setTradeForm({ ...tradeForm, resultR: event.target.value })} />
              <Input label="CF Score" value={tradeForm.confidenceScore} onChange={(event) => setTradeForm({ ...tradeForm, confidenceScore: event.target.value })} />
              <Input label="MFE R" value={tradeForm.mfeR} onChange={(event) => setTradeForm({ ...tradeForm, mfeR: event.target.value })} />
              <Input label="MAE R" value={tradeForm.maeR} onChange={(event) => setTradeForm({ ...tradeForm, maeR: event.target.value })} />
              <Select label="Emotion" options={emotions} value={tradeForm.emotion} onChange={(event) => setTradeForm({ ...tradeForm, emotion: event.target.value as TradingEmotion })} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ImageDropZone label="Before Trade Image" value={tradeForm.preTradeImageUrl} onPaste={(event) => handlePasteImage('preTradeImageUrl', event)} onFile={(file) => setTradeImageFromFile('preTradeImageUrl', file)} />
              <ImageDropZone label="After Trade Image" value={tradeForm.postTradeImageUrl} onPaste={(event) => handlePasteImage('postTradeImageUrl', event)} onFile={(file) => setTradeImageFromFile('postTradeImageUrl', file)} />
            </div>

            <Textarea label="Exit Reason" value={tradeForm.exitReason} onChange={(event) => setTradeForm({ ...tradeForm, exitReason: event.target.value })} />
            <Textarea label="Review Notes" value={tradeForm.notes} onChange={(event) => setTradeForm({ ...tradeForm, notes: event.target.value })} />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-slate-50/80 p-4">
              <h3 className="font-inter text-[15px] font-extrabold text-slate-950">CF Checklist</h3>
              <p className="mt-1 font-kanit text-[12px] leading-5 text-slate-500">Select what you checked before entering the trade.</p>
              <div className="mt-4 space-y-3">
                {checklistOptions.map((item) => <Checkbox key={item} checked={tradeForm.checklistItems.includes(item)} onChange={() => toggleChecklist(item)} label={item} />)}
              </div>
              <div className="mt-4 flex gap-2">
                <Input aria-label="Custom checklist" placeholder="Add custom checklist" value={customChecklist} onChange={(event) => setCustomChecklist(event.target.value)} />
                <Button type="button" onClick={addChecklist}>Add</Button>
              </div>
              <div className="mt-4">
                <Checkbox checked={tradeForm.checklistPassed} onChange={(checked) => setTradeForm({ ...tradeForm, checklistPassed: checked })} label="Checklist passed before entry" />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-4">
              <h3 className="font-inter text-[15px] font-extrabold text-slate-950">Mistake Tags</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {mistakeTags.map((tag) => {
                  const active = tradeForm.mistakeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setTradeForm((current) => ({
                          ...current,
                          mistakeTags: active ? current.mistakeTags.filter((value) => value !== tag) : [...current.mistakeTags.filter((value) => value !== 'None'), tag],
                        }));
                      }}
                      className={cn('rounded-full border px-3 py-1.5 font-inter text-[12px] font-bold transition', active ? chipClass(tag === 'None' ? 'slate' : 'orange') : 'border-border bg-white text-slate-500 hover:bg-slate-50')}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        title={selectedTrade ? `${selectedTrade.symbol} ${selectedTrade.direction} Review` : 'Trade Review'}
        subtitle={selectedTrade ? `${selectedTrade.date} · ${selectedTrade.setup} · ${selectedTrade.resultR}R` : undefined}
        size="xl"
      >
        {selectedTrade ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="space-y-5"
          >
            {(() => {
              const linkedAccount = allAccounts.find((account) => account.id === selectedTrade.fundingAccountId);
              const pnl = tradeProfit(selectedTrade);
              const targetR = selectedTrade.rrTarget ?? 0;
              const riskDistance = Math.abs(selectedTrade.entryPrice - selectedTrade.stopLoss);
              const realizedDistance = selectedTrade.exitPrice ? Math.abs(selectedTrade.exitPrice - selectedTrade.entryPrice) : 0;
              const rrActual = riskDistance ? Number((realizedDistance / riskDistance).toFixed(2)) : 0;
              const checklistItems = selectedTrade.checklistItems ?? [];
              const mistakeItems = selectedTrade.mistakeTags?.length ? selectedTrade.mistakeTags : ['None'];
              const qualityNotes = [
                selectedTrade.ruleFollowed ? 'Rule followed' : 'Rule broken',
                selectedTrade.checklistPassed ? 'Checklist passed' : 'Checklist needs review',
                selectedTrade.resultR < 0 ? 'Loss needs post-trade review' : selectedTrade.resultR > 0 ? 'Winning execution' : 'Breakeven execution',
              ];

              return (
                <>
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ['PnL', signedMoney(tradeProfit(selectedTrade))],
                ['MFE / MAE', `${selectedTrade.mfeR ?? 0} / ${selectedTrade.maeR ?? 0}`],
                ['CF', `${selectedTrade.confidenceScore ?? '-'}%`],
                ['Checklist', selectedTrade.checklistPassed ? 'Passed' : 'Review'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-border bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="font-inter text-[11px] font-bold uppercase text-slate-500">{label}</p>
                  <p className="mt-2 font-inter text-[22px] font-extrabold text-slate-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-2xl border border-border bg-white p-4 dark:bg-slate-950">
                <h3 className="font-inter text-[15px] font-extrabold text-slate-950 dark:text-white">Execution Details</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[
                    ['Account', linkedAccount?.accountName ?? 'Unlinked'],
                    ['Status', selectedTrade.status],
                    ['Session', selectedTrade.session],
                    ['Timeframe', selectedTrade.timeframe],
                    ['Entry Time', selectedTrade.entryTime ?? '-'],
                    ['Exit Time', selectedTrade.exitTime ?? '-'],
                    ['Entry Price', String(selectedTrade.entryPrice)],
                    ['Stop Loss', String(selectedTrade.stopLoss)],
                    ['Take Profit', String(selectedTrade.takeProfit)],
                    ['Exit Price', selectedTrade.exitPrice ? String(selectedTrade.exitPrice) : '-'],
                    ['Risk Amount', money(selectedTrade.riskAmount)],
                    ['Commission', money(selectedTrade.commission ?? 0)],
                    ['Target R', `${targetR}R`],
                    ['Actual RR Distance', `${rrActual}R`],
                    ['Result Type', resultName(selectedTrade)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border bg-slate-50 px-3 py-2 dark:bg-slate-900">
                      <p className="font-inter text-[10px] font-bold uppercase tracking-[0.05em] text-slate-400">{label}</p>
                      <p className="mt-1 font-inter text-[13px] font-extrabold text-slate-850 dark:text-slate-100">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-white p-4 dark:bg-slate-950">
                  <h3 className="font-inter text-[15px] font-extrabold text-slate-950 dark:text-white">Trade Quality</h3>
                  <div className="mt-3 space-y-2">
                    {qualityNotes.map((item) => (
                      <div key={item} className="rounded-xl border border-border bg-slate-50 px-3 py-2 font-kanit text-[13px] font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{item}</div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-white p-4 dark:bg-slate-950">
                  <h3 className="font-inter text-[15px] font-extrabold text-slate-950 dark:text-white">Tags & Emotion</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={cn('rounded-full border px-3 py-1 font-inter text-[12px] font-bold', chipClass(['Fearful', 'Greedy', 'Revenge'].includes(selectedTrade.emotion) ? 'red' : 'green'))}>{selectedTrade.emotion}</span>
                    {mistakeItems.map((tag) => (
                      <span key={tag} className={cn('rounded-full border px-3 py-1 font-inter text-[12px] font-bold', chipClass(tag === 'None' ? 'slate' : 'orange'))}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {selectedTrade.preTradeImageUrl ? <img src={selectedTrade.preTradeImageUrl} alt="Before trade" className="h-[320px] w-full rounded-2xl object-cover" /> : <div className="rounded-2xl border border-border bg-slate-50 p-8 text-center text-slate-500">No before image</div>}
              {selectedTrade.postTradeImageUrl ? <img src={selectedTrade.postTradeImageUrl} alt="After trade" className="h-[320px] w-full rounded-2xl object-cover" /> : <div className="rounded-2xl border border-border bg-slate-50 p-8 text-center text-slate-500">No after image</div>}
            </div>
            <div className="rounded-2xl border border-border bg-white p-4 dark:bg-slate-950">
              <h3 className="font-inter text-[15px] font-extrabold text-slate-950 dark:text-white">Review Notes</h3>
              <p className="mt-2 font-kanit text-[14px] leading-7 text-slate-600">{selectedTrade.notes}</p>
              {selectedTrade.exitReason ? (
                <div className="mt-4 rounded-xl border border-border bg-slate-50 p-3 dark:bg-slate-900">
                  <p className="font-inter text-[11px] font-bold uppercase text-slate-400">Exit Reason</p>
                  <p className="mt-1 font-kanit text-[13px] leading-6 text-slate-600 dark:text-slate-300">{selectedTrade.exitReason}</p>
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {checklistItems.length ? checklistItems.map((item) => <span key={item} className={cn('rounded-full border px-3 py-1 font-inter text-[12px] font-bold', chipClass('green'))}>{item}</span>) : <span className="font-kanit text-[13px] text-slate-500">No checklist items saved.</span>}
              </div>
            </div>
                </>
              );
            })()}
          </motion.div>
        ) : null}
      </Modal>
    </div>
  );
}
