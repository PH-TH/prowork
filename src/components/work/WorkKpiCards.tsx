import { motion } from 'framer-motion';
import { AlertTriangle, ClipboardList } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { workStats } from '../../lib/calculations';
import { useWorkStore } from '../../stores/workStore';
import { Card } from '../ui/Card';

export function WorkKpiCards() {
  const tasks = useWorkStore((state) => state.tasks);
  const stats = workStats(tasks);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <KpiPanel
        delay={0}
        title="Tasks Progress"
        value={stats.progress}
        suffix="%"
        helper={`${stats.completed} completed tasks`}
        tone="green"
        sparkColor="#16A34A"
        visual={<MiniRing value={stats.progress} color="#16A34A" delay={0.08} />}
      />
      <KpiPanel
        delay={0.08}
        title="Tasks Pending"
        value={stats.pending}
        helper="open work items"
        tone="orange"
        sparkColor="#F59E0B"
        visual={
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.24, ease: 'easeOut', delay: 0.18 }}
          >
            <ClipboardList size={24} />
          </motion.div>
        }
      />
      <KpiPanel
        delay={0.16}
        title="Overdue / Blocked"
        value={stats.overdue}
        helper="needs attention"
        tone="red"
        sparkColor="#EF4444"
        visual={
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.24, ease: 'easeOut', delay: 0.24 }}
          >
            <AlertTriangle size={24} />
          </motion.div>
        }
      />
    </div>
  );
}

function KpiPanel({
  title,
  value,
  suffix = '',
  helper,
  tone,
  sparkColor,
  visual,
  delay,
}: {
  title: string;
  value: number | string;
  suffix?: string;
  helper: string;
  tone: 'green' | 'orange' | 'red';
  sparkColor: string;
  visual: ReactNode;
  delay: number;
}) {
  const helperColor = tone === 'green' ? 'text-primary' : tone === 'orange' ? 'text-orange-500' : 'text-red-500';
  const arrow = tone === 'red' ? '→' : '↑';
  const display = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut', delay }}
    >
      <Card hover={false} className="h-[128px] p-5">
        <div className="flex h-full items-start justify-between gap-4">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="font-data text-[12px] font-bold leading-5 text-ink">{title}</p>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut', delay: delay + 0.08 }}
                className={`mt-4 font-data text-[36px] font-extrabold leading-10 tracking-[-0.03em] ${helperColor}`}
              >
                {display}
                {suffix}
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: delay + 0.14 }}
              className={`flex items-center gap-2 font-data text-[12px] font-medium leading-5 ${helperColor}`}
            >
              <span>{arrow}</span>
              <span>{helper}</span>
              {tone !== 'green' ? <span>↑</span> : null}
            </motion.div>
          </div>
          <div className="flex h-full flex-col items-end justify-between">
            <SparkLine color={sparkColor} delay={delay} />
            {visual}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function useCountUp(value: number | string, duration = 650) {
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
      setDisplay(Math.round(value * eased));
      if (progress === 1) window.clearInterval(timer);
    }, 16);

    return () => window.clearInterval(timer);
  }, [duration, value]);

  return display;
}

function SparkLine({ color, delay }: { color: string; delay: number }) {
  return (
    <svg width="42" height="18" viewBox="0 0 42 18" aria-hidden="true">
      <motion.path
        d="M2 11 C7 11, 8 7, 13 8 S20 13, 25 8 S33 3, 40 4"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.45 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: delay + 0.02 }}
      />
    </svg>
  );
}

function MiniRing({ value, color, delay }: { value: number; color: string; delay: number }) {
  const size = 64;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Progress ${value}%`}
      className="-rotate-90"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.24, ease: 'easeOut', delay }}
    >
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E8F5EC" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.7, ease: 'easeOut', delay }}
      />
    </motion.svg>
  );
}
