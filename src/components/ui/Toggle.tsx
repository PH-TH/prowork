import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  const labelIsThai = label ? /[\u0E00-\u0E7F]/.test(label) : false;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn(
        'focus-ring group flex min-h-11 w-full items-center justify-between gap-4 rounded-xl border border-border bg-white px-3 py-2 text-left transition duration-180 hover:border-primary-soft hover:bg-primary-pale/50',
        labelIsThai ? 'font-kanit text-[14px] font-normal leading-[22px]' : 'font-inter text-[14px] font-semibold leading-[22px]',
        className,
      )}
      onClick={() => onChange(!checked)}
    >
      {label ? <span className="min-w-0 flex-1 truncate text-ink">{label}</span> : <span className="sr-only">Toggle setting</span>}
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition duration-180',
          checked ? 'border-primary bg-primary shadow-sm' : 'border-slate-300 bg-slate-200',
        )}
      >
        <motion.span
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5"
          initial={false}
          animate={{ x: checked ? 20 : 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        />
      </span>
    </button>
  );
}
