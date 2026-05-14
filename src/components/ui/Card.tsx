import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { cardHover } from '../../lib/animations';

interface CardProps {
  className?: string;
  children: ReactNode;
  hover?: boolean;
}

export function Card({ className, hover = true, children }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? cardHover : undefined}
      className={cn('rounded-card border border-border bg-white p-5 shadow-card transition duration-180', className)}
    >
      {children}
    </motion.div>
  );
}

interface KpiCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  helper?: string;
  tone?: string;
  icon?: ReactNode;
}

function useCountUp(value: number | string, duration = 850) {
  const [display, setDisplay] = useState(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const frames = Math.max(1, Math.round(duration / 16));
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(1, frame / frames);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Number((value * eased).toFixed(value % 1 ? 1 : 0)));
      if (progress === 1) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
  }, [duration, value]);

  return display;
}

export function KpiCard({ label, value, suffix, prefix, helper, tone = 'green', icon }: KpiCardProps) {
  const display = useCountUp(value);
  const palette: Record<string, string> = {
    green: 'from-emerald-500 via-green-500 to-teal-500 shadow-emerald-500/20',
    blue: 'from-sky-500 via-blue-500 to-indigo-500 shadow-blue-500/20',
    orange: 'from-amber-400 via-orange-500 to-rose-500 shadow-orange-500/20',
    purple: 'from-violet-500 via-purple-500 to-fuchsia-500 shadow-purple-500/20',
    red: 'from-rose-500 via-red-500 to-orange-500 shadow-rose-500/20',
    gold: 'from-yellow-400 via-amber-500 to-orange-500 shadow-amber-500/20',
    gray: 'from-slate-600 via-slate-700 to-slate-900 shadow-slate-500/20',
  };
  const gradient = palette[tone] ?? palette.gray;

  return (
    <motion.div
      whileHover={cardHover}
      className={cn(
        'group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-card border border-white/30 bg-gradient-to-br p-5 text-white shadow-card transition duration-180',
        gradient,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.75),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.24)_0_1px,transparent_1px_12px)]" />
      <div className="flex items-start justify-between gap-3">
        <div className="relative min-w-0">
          <p className="font-inter text-[12px] font-semibold leading-4 text-white/85">{label}</p>
          <p className="mt-3 text-kpi text-white drop-shadow-sm">
            {prefix}
            {display}
            {suffix}
          </p>
        </div>
        {icon ? <div className="relative rounded-2xl border border-white/35 bg-white/20 p-3 text-white shadow-sm backdrop-blur">{icon}</div> : null}
      </div>
      {helper ? <p className="relative mt-5 font-kanit text-[13px] leading-5 text-white/85">{helper}</p> : null}
    </motion.div>
  );
}
