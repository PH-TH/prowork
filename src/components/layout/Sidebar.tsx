import { BarChart3, BookOpen, BriefcaseBusiness, Gauge, HeartPulse, LockKeyhole, PenLine, PieChart, Settings } from 'lucide-react';
import { NAV_ITEMS } from '../../lib/constants';
import { useAppStore } from '../../stores/appStore';
import type { PageKey } from '../../types/dashboard';
import { cn } from '../../lib/utils';

const icons: Record<PageKey, typeof Gauge> = {
  dashboard: Gauge,
  work: BriefcaseBusiness,
  habit: HeartPulse,
  learning: BookOpen,
  finance: LockKeyhole,
  journals: PenLine,
  trading: BarChart3,
  backtest: BookOpen,
  investment: PieChart,
  settings: Settings,
};

export function Sidebar() {
  const { activePage, setActivePage, lockFinance } = useAppStore();

  const handleNav = (id: PageKey) => {
    if (id === 'finance') lockFinance();
    setActivePage(id);
  };

  const nav = (
    <>
      {NAV_ITEMS.map((item) => {
        const Icon = icons[item.id] ?? BarChart3;
        const active = activePage === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            title={item.label}
            onClick={() => handleNav(item.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-control px-3 py-2.5 font-inter text-[14px] font-semibold leading-5 transition',
              active ? 'bg-primary-pale text-primary' : 'text-slateText hover:bg-slate-100 hover:text-ink',
            )}
          >
            <Icon size={18} />
            <span className="hidden md:inline">{item.label}</span>
          </button>
        );
      })}
    </>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-border bg-white p-4 md:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary font-inter text-[18px] font-bold text-white">P</div>
          <div>
            <p className="font-inter text-[20px] font-bold leading-6 tracking-[-0.02em] text-ink">ProWork</p>
            <p className="text-caption-ui">Personal OS</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">{nav}</nav>
        <div className="rounded-card border border-border bg-app p-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-soft text-center font-inter text-[14px] font-bold leading-10 text-primary">AK</div>
            <div>
              <p className="text-card-title">Alex Kim</p>
              <p className="text-caption-ui">Project Manager</p>
            </div>
          </div>
        </div>
      </aside>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 grid gap-1 overflow-x-auto border-t border-border bg-white p-2 md:hidden"
        style={{ gridTemplateColumns: `repeat(${NAV_ITEMS.length}, minmax(64px, 1fr))` }}
      >
        {nav}
      </nav>
    </>
  );
}
