import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, color = '#16A34A', className, showLabel = false }: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      {showLabel ? (
        <div className="mb-2 flex items-center justify-between text-caption-ui">
          <span>Progress</span>
          <span className="font-inter font-semibold text-ink">{Math.round(value)}%</span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
