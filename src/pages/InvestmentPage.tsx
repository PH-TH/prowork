import { Building2, Coins, Plus, RefreshCcw, Shield, TrendingUp, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { BarChart } from '../charts/BarChart';
import { DonutChart } from '../charts/DonutChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { LineChart } from '../charts/LineChart';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { useInvestment } from '../hooks/useInvestment';
import { useAppStore } from '../stores/appStore';
import { useInvestmentStore } from '../stores/investmentStore';
import type { Asset, InvestmentTabKey } from '../types/investment';

const tabConfig: Array<{ id: InvestmentTabKey; label: string; add: string; title: string; subtitle: string }> = [
  { id: 'overview', label: 'Overview', add: '+ Add Investment', title: 'Investment Portfolio Planner', subtitle: 'วางแผนลงทุนระยะยาวแบบมีวินัย เน้นความสม่ำเสมอและกระจายความเสี่ยง' },
  { id: 'allocation', label: 'Asset Allocation', add: '+ Rebalance Plan', title: 'Asset Allocation', subtitle: 'เทียบสัดส่วนจริงกับเป้าหมายเพื่อควบคุมความเสี่ยงของพอร์ต' },
  { id: 'dca', label: 'DCA Planner', add: '+ Add DCA Plan', title: 'DCA Planner', subtitle: 'จัดแผนซื้อรายเดือนให้ต่อเนื่องและสอดคล้องกับเป้าหมายพอร์ต' },
  { id: 'dividend', label: 'Dividend Income', add: '+ Add Dividend', title: 'Dividend Income', subtitle: 'ติดตามกระแสเงินสดจากเงินปันผลและความคืบหน้าเป้าหมายรายปี' },
  { id: 'gold', label: 'Gold & Hedge', add: '+ Add Gold Purchase', title: 'Gold & Hedge', subtitle: 'ติดตามทองคำและสินทรัพย์ป้องกันความเสี่ยงเพื่อเสถียรภาพพอร์ต' },
  { id: 'review', label: 'Portfolio Review', add: '+ Add Review Note', title: 'Portfolio Review', subtitle: 'สรุปผลรายเดือนและวางแผนปรับพอร์ตสำหรับรอบถัดไป' },
];

type ModalType = 'holding' | 'transaction' | 'dca' | 'dividend' | 'gold' | 'review' | null;

const money = (n: number, c: 'THB' | 'USD' = 'THB') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 2 }).format(n);

export function InvestmentPage() {
  const [tab, setTab] = useState<InvestmentTabKey>('overview');
  const [baseCurrency, setBaseCurrency] = useState<'THB' | 'USD'>('THB');
  const [month, setMonth] = useState('May 2025');
  const [risk, setRisk] = useState('Moderate');
  const [monthlyBudget, setMonthlyBudget] = useState('10000');
  const [dividendGoal, setDividendGoal] = useState('12000');
  const [goldTarget, setGoldTarget] = useState('10');
  const [reviewType, setReviewType] = useState('Monthly Review');
  const [open, setOpen] = useState<ModalType>(null);
  const [thbPerUsd, setThbPerUsd] = useState(36);
  const data = useInvestment();
  const head = tabConfig.find((x) => x.id === tab)!;

  useEffect(() => {
    let mounted = true;
    const urls = [
      'https://api.frankfurter.app/latest?from=USD&to=THB',
      'https://api.frankfurter.dev/v1/latest?base=USD&symbols=THB',
    ];
    const load = async () => {
      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json = await res.json();
          const rate = Number(json?.rates?.THB);
          if (mounted && Number.isFinite(rate) && rate > 0) {
            setThbPerUsd(rate);
            break;
          }
        } catch {}
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const toBase = (amount: number, from: 'THB' | 'USD') => {
    if (from === baseCurrency) return amount;
    if (from === 'USD' && baseCurrency === 'THB') return amount * thbPerUsd;
    if (from === 'THB' && baseCurrency === 'USD') return amount / thbPerUsd;
    return amount;
  };

  const openAdd = () => {
    const map: Record<InvestmentTabKey, ModalType> = {
      overview: 'holding',
      allocation: 'transaction',
      dca: 'dca',
      dividend: 'dividend',
      gold: 'gold',
      review: 'review',
    };
    setOpen(map[tab]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-page-title">{head.title}</h1>
        <p className="mt-1 text-page-subtitle-th">{head.subtitle}</p>
      </div>

      <div className="rounded-card border border-border bg-white p-4 shadow-card">
        <Tabs active={tab} onChange={(id) => setTab(id as InvestmentTabKey)} items={tabConfig.map((t) => ({ id: t.id, label: t.label }))} />

        <div className="mt-5 grid gap-3 md:grid-cols-6">
          <Select label="Base Currency" value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value as 'THB' | 'USD')} options={['THB', 'USD']} />
          <Select label="Month / Year" value={month} onChange={(e) => setMonth(e.target.value)} options={['May 2025', 'Jun 2025']} />
          {tab === 'dca' ? <Input label="Monthly Budget" type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} /> : null}
          {tab === 'dividend' ? <Input label="Dividend Goal" type="number" value={dividendGoal} onChange={(e) => setDividendGoal(e.target.value)} /> : null}
          {tab === 'gold' ? <Input label="Gold Target (%)" type="number" value={goldTarget} onChange={(e) => setGoldTarget(e.target.value)} /> : null}
          {tab === 'review' ? <Select label="Review Type" value={reviewType} onChange={(e) => setReviewType(e.target.value)} options={['Monthly Review', 'Quarterly Review']} /> : null}
          {(tab === 'overview' || tab === 'allocation') ? <Select label="Risk Profile" value={risk} onChange={(e) => setRisk(e.target.value)} options={['Moderate', 'Conservative', 'Aggressive']} /> : null}
          <div className="flex items-end">
            <Button variant="secondary" className="w-full" icon={<RefreshCcw size={15} />} onClick={() => { setBaseCurrency('THB'); setMonth('May 2025'); setRisk('Moderate'); setMonthlyBudget('10000'); setDividendGoal('12000'); setGoldTarget('10'); setReviewType('Monthly Review'); }}>
              Reset
            </Button>
          </div>
          <div className="md:col-span-2 flex items-end">
            <Button className="w-full" icon={<Plus size={16} />} onClick={openAdd}>{head.add}</Button>
          </div>
        </div>

        {tab === 'overview' ? <OverviewTab baseCurrency={baseCurrency} toBase={toBase} /> : null}
        {tab === 'allocation' ? <AllocationTab /> : null}
        {tab === 'dca' ? <DcaTab baseCurrency={baseCurrency} toBase={toBase} /> : null}
        {tab === 'dividend' ? <DividendTab baseCurrency={baseCurrency} toBase={toBase} /> : null}
        {tab === 'gold' ? <GoldTab baseCurrency={baseCurrency} toBase={toBase} /> : null}
        {tab === 'review' ? <ReviewTab /> : null}
      </div>

      <AddHoldingModal open={open === 'holding'} onClose={() => setOpen(null)} assets={data.assets} />
      <AddTransactionModal open={open === 'transaction'} onClose={() => setOpen(null)} assets={data.assets} />
      <AddDcaModal open={open === 'dca'} onClose={() => setOpen(null)} assets={data.assets} />
      <AddDividendModal open={open === 'dividend'} onClose={() => setOpen(null)} assets={data.assets} />
      <AddGoldModal open={open === 'gold'} onClose={() => setOpen(null)} />
      <AddReviewModal open={open === 'review'} onClose={() => setOpen(null)} />
    </div>
  );
}

function OverviewTab({ baseCurrency, toBase }: { baseCurrency: 'THB' | 'USD'; toBase: (amount: number, from: 'THB' | 'USD') => number }) {
  const d = useInvestment();
  return (
    <div className="space-y-4 pt-4">
      <KpiRow items={[[ 'Portfolio Value', money(toBase(d.portfolioValue, 'THB'), baseCurrency) ], [ 'Total Invested', money(toBase(d.totalInvested, 'THB'), baseCurrency) ], [ 'Unrealized Gain', `${money(toBase(d.unrealized.gain, 'THB'), baseCurrency)} (${d.unrealized.percent.toFixed(2)}%)` ], [ 'Dividend YTD', money(toBase(d.dividendYtd, 'USD'), baseCurrency) ], [ 'DCA Completion', `${Math.round(d.dca.percent)}%` ], [ 'Risk Level', d.riskLevel ]]} />
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-6"><h3 className="text-card-title">Portfolio Growth</h3><LineChart data={d.portfolioSnapshots.map((s) => ({ day: s.date.slice(5, 7), portfolio: s.total_value, invested: s.total_invested }))} lines={[{ key: 'portfolio', color: '#16A34A', name: 'Portfolio' }, { key: 'invested', color: '#94A3B8', name: 'Invested' }]} /></Card>
        <Card className="xl:col-span-3"><h3 className="text-card-title">Asset Allocation</h3><DonutChart data={Object.entries(d.currentAllocation).map(([name, value], i) => ({ name, value, color: d.assets[i % d.assets.length]?.color ?? '#16A34A' }))} /></Card>
        <Card className="xl:col-span-3"><h3 className="text-card-title">Rebalance Alert</h3><p className="mt-2 text-body-th text-slateText">เป้าหมายใกล้เคียง {d.targetMatch.toFixed(1)}%</p><p className="mt-2 text-body-th text-slateText">ดูหมวดที่เบี่ยงเบนเกิน 3% ก่อน</p></Card>
      </div>
    </div>
  );
}

function AllocationTab() { const d = useInvestment(); return <div className="space-y-4 pt-4"><KpiRow items={[[ 'Target Match', `${d.targetMatch}%` ], ['Current Drift', `${d.driftRows.reduce((s, x) => s + Math.abs(x.drift), 0).toFixed(1)}%`], ['Equity Exposure', `${((d.currentAllocation['Equity Global'] ?? 0) + (d.currentAllocation['Equity Thai'] ?? 0)).toFixed(1)}%`], ['Defensive Assets', `${((d.currentAllocation.Bonds ?? 0) + (d.currentAllocation.Cash ?? 0)).toFixed(1)}%`], ['Gold Weight', `${(d.currentAllocation.Gold ?? 0).toFixed(2)}%`], ['Rebalance Status', d.targetMatch >= 90 ? 'On Track' : 'Needs Action']]} /><div className="grid gap-4 xl:grid-cols-12"><Card className="xl:col-span-3"><h3 className="text-card-title">Current vs Target</h3><DonutChart data={d.driftRows.map((r, i) => ({ name: r.assetClass, value: r.current, color: d.assets[i % d.assets.length]?.color ?? '#16A34A' }))} /></Card><Card className="xl:col-span-4"><h3 className="text-card-title">Target vs Current</h3><HorizontalBarChart data={d.driftRows.map((r) => ({ label: r.assetClass, value: r.current }))} yKey="label" barKey="value" color="#16A34A" /></Card><Card className="xl:col-span-2"><h3 className="text-card-title">Country</h3><Pairs rows={Object.entries(d.countryExposure)} /></Card><Card className="xl:col-span-3"><h3 className="text-card-title">Currency</h3><Pairs rows={Object.entries(d.currencyExposure)} /></Card></div></div>; }
function DcaTab({ baseCurrency, toBase }: { baseCurrency: 'THB' | 'USD'; toBase: (amount: number, from: 'THB' | 'USD') => number }) { const d = useInvestment(); return <div className="space-y-4 pt-4"><KpiRow items={[[ 'Monthly Budget', money(toBase(d.dcaPlan.monthlyBudget, 'THB'), baseCurrency) ], ['DCA Completion', `${Math.round(d.dca.percent)}%`], ['Missed Months', `${d.dca.missedMonths}`], ['Auto Allocation', 'On'], ['Next Buy Date', d.dcaPlan.nextBuyDate || '-'], ['Portfolio Alignment', `${d.targetMatch.toFixed(0)}%`]]} /><div className="grid gap-4 xl:grid-cols-12"><Card className="xl:col-span-4"><h3 className="text-card-title">Monthly DCA Plan</h3><DonutChart data={d.dcaPlans.map((p, i) => ({ name: d.assets.find((a) => a.asset_id === p.asset_id)?.ticker ?? p.asset_class, value: p.monthly_amount, color: d.assets[i % d.assets.length]?.color ?? '#16A34A' }))} /></Card><Card className="xl:col-span-4"><h3 className="text-card-title">DCA Calendar</h3><Pairs rows={d.dcaPlans.map((p) => [assetLabel(d.assets.find((a) => a.asset_id === p.asset_id)), `Day ${p.day_of_month}`])} /></Card><Card className="xl:col-span-4"><h3 className="text-card-title">Suggested Buy</h3><Pairs rows={d.suggestedBuy.map((x) => [x.assetClass, money(toBase(x.amount, 'THB'), baseCurrency)])} /></Card></div></div>; }
function DividendTab({ baseCurrency, toBase }: { baseCurrency: 'THB' | 'USD'; toBase: (amount: number, from: 'THB' | 'USD') => number }) { const d = useInvestment(); return <div className="space-y-4 pt-4"><KpiRow items={[[ 'Dividend YTD', money(toBase(d.dividendYtd, 'USD'), baseCurrency) ], ['Forward Yield', `${d.forwardYield.toFixed(2)}%`], ['Yield on Cost', `${d.yieldOnCost.toFixed(2)}%`], ['Next Payout', d.dividendPayments.find((x) => x.status === 'Upcoming')?.payment_date ?? '-'], ['Annual Goal Progress', `${d.dividendGoalProgress.toFixed(1)}%`], ['Dividend Growth', '+14.2%']]} /><div className="grid gap-4 xl:grid-cols-12"><Card className="xl:col-span-4"><h3 className="text-card-title">Dividend Trend</h3><BarChart data={d.dividendTrend.map((x) => ({ month: x.month.slice(5), value: x.value }))} xKey="month" barKey="value" /></Card><Card className="xl:col-span-4"><h3 className="text-card-title">Dividend Calendar</h3><Pairs rows={d.dividendPayments.slice(0, 6).map((p) => [assetLabel(d.assets.find((a) => a.asset_id === p.asset_id)), `${p.payment_date} (${p.status})`])} /></Card><Card className="xl:col-span-2"><h3 className="text-card-title">By Asset</h3><DonutChart data={d.dividendByAsset.map((x, i) => ({ name: x.name, value: x.value, color: d.assets[i % d.assets.length]?.color ?? '#16A34A' }))} /></Card><Card className="xl:col-span-2"><h3 className="text-card-title">Passive Goal</h3><p className="text-money">{money(toBase(12000, 'USD'), baseCurrency)}</p><ProgressBar value={d.dividendGoalProgress} /></Card></div></div>; }
function GoldTab({ baseCurrency, toBase }: { baseCurrency: 'THB' | 'USD'; toBase: (amount: number, from: 'THB' | 'USD') => number }) { const d = useInvestment(); return <div className="space-y-4 pt-4"><KpiRow items={[[ 'Gold Value', money(toBase(d.goldHoldings.reduce((s, g) => s + g.market_value, 0), 'THB'), baseCurrency) ], ['Gold Weight', `${(d.currentAllocation.Gold ?? 0).toFixed(2)}%`], ['Gold Gain', `${money(toBase(d.goldGain.gain, 'THB'), baseCurrency)} (${d.goldGain.gainPercent.toFixed(2)}%)`], ['Hedge Score', `${d.hedgeScore}/100`], ['Gold DCA YTD', money(toBase(90000, 'THB'), baseCurrency)], ['Inflation Protection', 'High']]} /><div className="grid gap-4 xl:grid-cols-12"><Card className="xl:col-span-4"><h3 className="text-card-title">Gold Allocation Trend</h3><LineChart data={d.goldTrend.map((x) => ({ day: x.month.slice(5), value: x.weight }))} lines={[{ key: 'value', color: '#16A34A', name: 'Gold Weight' }]} /></Card><Card className="xl:col-span-4"><h3 className="text-card-title">Gold vs Drawdown</h3><LineChart data={d.goldVsDrawdown.map((x) => ({ day: x.month.slice(5), portfolio: x.portfolio, gold: x.gold }))} lines={[{ key: 'portfolio', color: '#EF4444', name: 'Portfolio' }, { key: 'gold', color: '#16A34A', name: 'Gold' }]} /></Card><Card className="xl:col-span-2"><h3 className="text-card-title">Hedge Mix</h3><DonutChart data={[{ name: 'Gold', value: d.currentAllocation.Gold ?? 0, color: '#EAB308' }, { name: 'Cash', value: d.currentAllocation.Cash ?? 0, color: '#94A3B8' }, { name: 'Bonds', value: d.currentAllocation.Bonds ?? 0, color: '#3B82F6' }]} /></Card><Card className="xl:col-span-2"><h3 className="text-card-title">Insights</h3><SimpleInsights tab="gold" /></Card></div></div>; }
function ReviewTab() { const d = useInvestment(); return <div className="space-y-4 pt-4"><KpiRow items={[[ 'Review Score', `${d.reviewScore}/100` ], ['Rebalance Status', d.latestReview?.rebalance_status ?? '-'], ['DCA Completion', `${d.latestReview?.dca_completion ?? 0}%`], ['Dividend Goal', `${d.latestReview?.dividend_goal_progress ?? 0}%`], ['Risk Alignment', d.latestReview?.risk_alignment ?? '-'], ['Next Review', d.latestReview?.next_review_date ?? '-']]} /><div className="grid gap-4 xl:grid-cols-12"><Card className="xl:col-span-4"><h3 className="text-card-title">Checklist</h3><p className="mt-2 text-body-th text-slateText">{d.latestReview?.checklist_items.filter((x) => x.done).length} / {d.latestReview?.checklist_items.length} done</p></Card><Card className="xl:col-span-4"><h3 className="text-card-title">Portfolio Drift Summary</h3><DriftTable /></Card><Card className="xl:col-span-4"><h3 className="text-card-title">Performance vs Goal</h3><LineChart data={d.portfolioSnapshots.slice(-6).map((s, i) => ({ day: s.date.slice(5, 7), portfolio: i * 3 + 2, goal: i * 2.5 + 1.5 }))} lines={[{ key: 'portfolio', color: '#16A34A', name: 'Portfolio' }, { key: 'goal', color: '#94A3B8', name: 'Goal' }]} /></Card></div></div>; }

function KpiRow({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {items.map(([k, v]) => (
        <Card key={k} className="p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.02em] text-slate-500">{k}</p>
          <p className={`mt-2 text-[22px] font-extrabold leading-8 tracking-[-0.01em] ${toneByValue(v)}`}>{v}</p>
        </Card>
      ))}
    </div>
  );
}

function Pairs({ rows }: { rows: Array<[ReactNode, ReactNode]> }) {
  return <div className="mt-2 space-y-2">{rows.map(([k, v], i) => <div key={`pair-${i}`} className="flex items-center justify-between border-b border-border/60 pb-1 text-[13px] leading-5 text-slate-700"><span>{k}</span><strong className={`font-semibold ${toneByValue(String(v))}`}>{v}</strong></div>)}</div>;
}

function DriftTable() {
  const d = useInvestment();
  return <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[420px]"><thead className="text-table-header"><tr><th className="py-2 text-left">Asset</th><th className="text-right">Target</th><th className="text-right">Current</th><th className="text-right">Drift</th></tr></thead><tbody>{d.driftRows.map((r) => <tr key={r.assetClass} className="border-t border-border text-table-cell"><td className="py-2">{r.assetClass}</td><td className="text-right">{r.target}%</td><td className="text-right">{r.current}%</td><td className="text-right">{r.drift > 0 ? '+' : ''}{r.drift}%</td></tr>)}</tbody></table></div>;
}

function SimpleInsights({ tab }: { tab: InvestmentTabKey }) {
  const d = useInvestment();
  return <ul className="mt-2 space-y-2 text-body-th text-slateText">{d.investmentInsights.filter((x) => x.tab === tab).slice(0, 4).map((x) => <li key={x.insight_id}>• {x.description_thai}</li>)}</ul>;
}

function toneByValue(v: string) {
  if (v.includes('+')) return 'text-green-600';
  if (v.includes('-')) return 'text-red-600';
  return 'text-ink';
}

function assetLabel(asset: Asset | undefined) {
  if (!asset) return <span>Unknown</span>;
  const cls = asset.asset_class;
  const icon = cls.includes('Equity') || cls === 'Dividend' ? <TrendingUp size={14} className="text-green-600" /> :
    cls === 'Gold' ? <Coins size={14} className="text-amber-500" /> :
    cls === 'Bonds' ? <Shield size={14} className="text-blue-600" /> :
    cls === 'Cash' ? <Wallet size={14} className="text-slate-600" /> :
    <Building2 size={14} className="text-violet-600" />;
  return <span className="inline-flex items-center gap-1.5">{icon}<span>{asset.ticker}</span></span>;
}

function AddHoldingModal({ open, onClose, assets }: { open: boolean; onClose: () => void; assets: Asset[] }) {
  const addAsset = useInvestmentStore((s) => s.addAsset);
  const addHolding = useInvestmentStore((s) => s.addHolding);
  const toast = useAppStore((s) => s.addToast);
  const [f, setF] = useState({ asset_id: assets[0]?.asset_id ?? '', quantity: 1, average_cost: 0, current_price: 0, currency: 'THB' as 'THB' | 'USD' });
  const [showNewAsset, setShowNewAsset] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    ticker: '',
    asset_class: 'Equity Global' as Asset['asset_class'],
    country: 'United States',
    currency: 'USD' as 'THB' | 'USD',
    asset_type: 'Stock',
    dividend_eligible: true,
    hedge_asset: false,
    color: '#16A34A',
    icon: '📈',
  });
  const valid = !!f.asset_id && f.quantity > 0 && f.average_cost > 0 && f.current_price > 0;
  return <Modal open={open} onClose={onClose} title="Add Investment / Holding" subtitle="เพิ่มถือครองเพื่ออัปเดตพอร์ต" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!valid} onClick={() => { if (!valid) return; addHolding({ ...f, notes: '' }); toast({ title: 'Saved successfully', description: 'เพิ่ม Holding แล้ว' }); onClose(); }}>Save</Button></div>}><div className="space-y-3"><div className="grid gap-3 md:grid-cols-2"><div><Select label="Asset" value={f.asset_id} onChange={(e) => setF({ ...f, asset_id: e.target.value })} options={assets.map((a) => ({ label: `${a.icon ? `${a.icon} ` : ''}${a.ticker} - ${a.name}`, value: a.asset_id }))} /><div className="mt-2"><Button type="button" variant="secondary" size="sm" onClick={() => setShowNewAsset((v) => !v)}>{showNewAsset ? 'Hide Add Asset' : '+ Add Asset'}</Button></div></div><Input label="Quantity" type="number" value={f.quantity} onChange={(e) => setF({ ...f, quantity: Number(e.target.value) })} /><Input label="Average cost" type="number" value={f.average_cost} onChange={(e) => setF({ ...f, average_cost: Number(e.target.value) })} /><Input label="Current price" type="number" value={f.current_price} onChange={(e) => setF({ ...f, current_price: Number(e.target.value) })} /><Select label="Currency" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value as 'THB' | 'USD' })} options={['THB', 'USD']} /></div>{showNewAsset ? <div className="rounded-control border border-border bg-slate-50 p-3"><p className="text-card-title">Create New Asset</p><p className="mt-1 text-body-th text-slateText">เพิ่มสินทรัพย์เองแบบ Notion พร้อมกำหนด icon</p><div className="mt-3 grid gap-3 md:grid-cols-2"><Input label="Icon (emoji)" value={newAsset.icon} onChange={(e) => setNewAsset({ ...newAsset, icon: e.target.value })} /><Input label="Name" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} /><Input label="Ticker" value={newAsset.ticker} onChange={(e) => setNewAsset({ ...newAsset, ticker: e.target.value.toUpperCase() })} /><Select label="Asset class" value={newAsset.asset_class} onChange={(e) => setNewAsset({ ...newAsset, asset_class: e.target.value as Asset['asset_class'] })} options={['Equity Global', 'Equity Thai', 'Dividend', 'Bonds', 'Cash', 'Gold', 'REITs', 'Alternatives']} /><Input label="Country" value={newAsset.country} onChange={(e) => setNewAsset({ ...newAsset, country: e.target.value })} /><Select label="Currency" value={newAsset.currency} onChange={(e) => setNewAsset({ ...newAsset, currency: e.target.value as 'THB' | 'USD' })} options={['THB', 'USD']} /><Input label="Asset type" value={newAsset.asset_type} onChange={(e) => setNewAsset({ ...newAsset, asset_type: e.target.value })} /><Input label="Color" type="color" value={newAsset.color} onChange={(e) => setNewAsset({ ...newAsset, color: e.target.value })} className="h-11 p-1" /></div><div className="mt-3 flex justify-end"><Button type="button" size="sm" onClick={() => { if (!newAsset.name || !newAsset.ticker) { toast({ title: 'Please complete fields', description: 'กรุณากรอก Name และ Ticker', type: 'warning' }); return; } const created = addAsset({ ...newAsset }); setF((prev) => ({ ...prev, asset_id: created.asset_id, currency: created.currency })); setNewAsset({ name: '', ticker: '', asset_class: 'Equity Global', country: 'United States', currency: 'USD', asset_type: 'Stock', dividend_eligible: true, hedge_asset: false, color: '#16A34A', icon: '📈' }); setShowNewAsset(false); toast({ title: 'Asset added', description: 'เพิ่ม Asset ใหม่และเลือกให้แล้ว' }); }}>Save Asset</Button></div></div> : null}</div></Modal>;
}

function AddTransactionModal({ open, onClose, assets }: { open: boolean; onClose: () => void; assets: Asset[] }) {
  const add = useInvestmentStore((s) => s.addTransaction);
  const toast = useAppStore((s) => s.addToast);
  const [f, setF] = useState({ date: '2025-06-10', asset_id: assets[0]?.asset_id ?? '', type: 'buy' as 'buy' | 'sell' | 'dca', quantity: 1, price: 0, fee: 0, currency: 'THB' as 'THB' | 'USD', notes: '' });
  const valid = !!f.date && !!f.asset_id && f.quantity > 0 && f.price > 0 && f.fee >= 0;
  return <Modal open={open} onClose={onClose} title="Add Transaction" subtitle="ซื้อ ขาย หรือ DCA" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!valid} onClick={() => { if (!valid) return; add(f); toast({ title: 'Saved successfully', description: 'เพิ่มธุรกรรมแล้ว' }); onClose(); }}>Save</Button></div>}><div className="grid gap-3 md:grid-cols-2"><Input label="Date" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /><Select label="Asset" value={f.asset_id} onChange={(e) => setF({ ...f, asset_id: e.target.value })} options={assets.map((a) => ({ label: `${a.ticker} - ${a.name}`, value: a.asset_id }))} /><Select label="Type" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as 'buy' | 'sell' | 'dca' })} options={['buy', 'sell', 'dca']} /><Input label="Quantity" type="number" value={f.quantity} onChange={(e) => setF({ ...f, quantity: Number(e.target.value) })} /><Input label="Price" type="number" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} /><Input label="Fee" type="number" value={f.fee} onChange={(e) => setF({ ...f, fee: Number(e.target.value) })} /><Select label="Currency" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value as 'THB' | 'USD' })} options={['THB', 'USD']} /></div></Modal>;
}

function AddDcaModal({ open, onClose, assets }: { open: boolean; onClose: () => void; assets: Asset[] }) {
  const add = useInvestmentStore((s) => s.addDCAPlan);
  const toast = useAppStore((s) => s.addToast);
  const [f, setF] = useState({ asset_id: assets[0]?.asset_id ?? '', asset_class: assets[0]?.asset_class ?? 'Equity Global', monthly_amount: 1000, day_of_month: 10, priority: 1, enabled: true, auto_allocation: true });
  const valid = !!f.asset_id && f.monthly_amount > 0 && f.day_of_month > 0 && f.day_of_month <= 28;
  return <Modal open={open} onClose={onClose} title="Add DCA Plan" subtitle="เพิ่มแผน DCA รายเดือน" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!valid} onClick={() => { if (!valid) return; add(f); toast({ title: 'Saved successfully', description: 'เพิ่มแผน DCA แล้ว' }); onClose(); }}>Save</Button></div>}><div className="grid gap-3 md:grid-cols-2"><Select label="Asset" value={f.asset_id} onChange={(e) => { const a = assets.find((x) => x.asset_id === e.target.value); setF({ ...f, asset_id: e.target.value, asset_class: a?.asset_class ?? f.asset_class }); }} options={assets.map((a) => ({ label: `${a.ticker} - ${a.name}`, value: a.asset_id }))} /><Input label="Monthly amount" type="number" value={f.monthly_amount} onChange={(e) => setF({ ...f, monthly_amount: Number(e.target.value) })} /><Input label="Day of month" type="number" value={f.day_of_month} onChange={(e) => setF({ ...f, day_of_month: Number(e.target.value) })} /><Input label="Priority" type="number" value={f.priority} onChange={(e) => setF({ ...f, priority: Number(e.target.value) })} /><Select label="Enabled" value={f.enabled ? 'true' : 'false'} onChange={(e) => setF({ ...f, enabled: e.target.value === 'true' })} options={[{ label: 'Enabled', value: 'true' }, { label: 'Disabled', value: 'false' }]} /><Select label="Auto allocation" value={f.auto_allocation ? 'true' : 'false'} onChange={(e) => setF({ ...f, auto_allocation: e.target.value === 'true' })} options={[{ label: 'On', value: 'true' }, { label: 'Off', value: 'false' }]} /></div></Modal>;
}

function AddDividendModal({ open, onClose, assets }: { open: boolean; onClose: () => void; assets: Asset[] }) {
  const add = useInvestmentStore((s) => s.addDividend);
  const toast = useAppStore((s) => s.addToast);
  const [f, setF] = useState({ asset_id: assets[0]?.asset_id ?? '', payment_date: '2025-06-20', amount: 0, tax: 0, currency: 'USD' as 'THB' | 'USD', payout_frequency: 'Quarterly' as 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual', status: 'Paid' as 'Paid' | 'Upcoming' });
  const valid = !!f.asset_id && !!f.payment_date && f.amount > 0 && f.tax >= 0;
  return <Modal open={open} onClose={onClose} title="Add Dividend" subtitle="เพิ่มข้อมูลปันผล" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!valid} onClick={() => { if (!valid) return; add(f); toast({ title: 'Saved successfully', description: 'เพิ่มเงินปันผลแล้ว' }); onClose(); }}>Save</Button></div>}><div className="grid gap-3 md:grid-cols-2"><div><Select label="Asset" value={f.asset_id} onChange={(e) => setF({ ...f, asset_id: e.target.value })} options={assets.map((a) => ({ label: `${a.ticker} - ${a.name}`, value: a.asset_id }))} /><div className="mt-2"><Button type="button" variant="secondary" size="sm" onClick={() => toast({ title: 'Add Asset (Soon)', description: 'เตรียมปุ่มเพิ่มสินทรัพย์ไว้แล้ว สามารถต่อเป็นฟอร์มเพิ่ม Asset ได้ทันที' })}>+ Add Asset</Button></div></div><Input label="Payment date" type="date" value={f.payment_date} onChange={(e) => setF({ ...f, payment_date: e.target.value })} /><Input label="Amount" type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} /><Input label="Tax" type="number" value={f.tax} onChange={(e) => setF({ ...f, tax: Number(e.target.value) })} /><Select label="Currency" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value as 'THB' | 'USD' })} options={['THB', 'USD']} /><Select label="Frequency" value={f.payout_frequency} onChange={(e) => setF({ ...f, payout_frequency: e.target.value as 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' })} options={['Monthly', 'Quarterly', 'Semi-Annual', 'Annual']} /><Select label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as 'Paid' | 'Upcoming' })} options={['Paid', 'Upcoming']} /></div></Modal>;
}

function AddGoldModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const add = useInvestmentStore((s) => s.addGoldPurchase);
  const toast = useAppStore((s) => s.addToast);
  const [f, setF] = useState({ date: '2025-06-20', product: 'Gold Bar 96.5%', purity: '96.5%', weight: 15, unit: 'gram' as 'gram' | 'baht', purchase_price: 52000, current_price: 53000, notes: 'DCA Plan' });
  const valid = !!f.date && f.weight > 0 && f.purchase_price > 0 && f.current_price > 0;
  return <Modal open={open} onClose={onClose} title="Add Gold Purchase" subtitle="เพิ่มรายการซื้อทองคำ" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!valid} onClick={() => { if (!valid) return; add(f); toast({ title: 'Saved successfully', description: 'เพิ่ม Gold purchase แล้ว' }); onClose(); }}>Save</Button></div>}><div className="grid gap-3 md:grid-cols-2"><Input label="Date" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /><Input label="Product" value={f.product} onChange={(e) => setF({ ...f, product: e.target.value })} /><Input label="Purity" value={f.purity} onChange={(e) => setF({ ...f, purity: e.target.value })} /><Input label="Weight" type="number" value={f.weight} onChange={(e) => setF({ ...f, weight: Number(e.target.value) })} /><Select label="Unit" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value as 'gram' | 'baht' })} options={['gram', 'baht']} /><Input label="Purchase price" type="number" value={f.purchase_price} onChange={(e) => setF({ ...f, purchase_price: Number(e.target.value) })} /><Input label="Current price" type="number" value={f.current_price} onChange={(e) => setF({ ...f, current_price: Number(e.target.value) })} /><Input label="Notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div></Modal>;
}

function AddReviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const add = useInvestmentStore((s) => s.addReviewNote);
  const toast = useAppStore((s) => s.addToast);
  const [f, setF] = useState({ period: 'Jun 2025', summary: '', nextActions: '', concerns: '', rebalanceDecision: 'On Track' });
  const valid = !!f.period && !!f.summary && !!f.nextActions && !!f.concerns;
  return <Modal open={open} onClose={onClose} title="Add Review Note" subtitle="เพิ่มบันทึกรีวิวพอร์ต" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!valid} onClick={() => { if (!valid) return; add(f); toast({ title: 'Saved successfully', description: 'เพิ่ม review note แล้ว' }); onClose(); }}>Save</Button></div>}><div className="grid gap-3 md:grid-cols-2"><Input label="Review period" value={f.period} onChange={(e) => setF({ ...f, period: e.target.value })} /><Select label="Rebalance decision" value={f.rebalanceDecision} onChange={(e) => setF({ ...f, rebalanceDecision: e.target.value })} options={['On Track', 'Needs Action']} /><Input label="Summary" value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} /><Input label="Next actions" value={f.nextActions} onChange={(e) => setF({ ...f, nextActions: e.target.value })} /><Input label="Concerns" value={f.concerns} onChange={(e) => setF({ ...f, concerns: e.target.value })} /></div></Modal>;
}

