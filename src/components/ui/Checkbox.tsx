import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  const labelIsThai = label ? /[\u0E00-\u0E7F]/.test(label) : false;

  return (
    <button
      type="button"
      className={`flex items-center gap-3 ${labelIsThai ? 'font-kanit text-[14px] font-normal leading-[22px]' : 'font-inter text-[14px] font-medium leading-[22px]'} text-ink`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-md border transition',
          checked ? 'border-primary bg-primary text-white' : 'border-border bg-white text-transparent',
        )}
      >
        {checked ? (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.14 }}>
            <Check size={14} strokeWidth={3} />
          </motion.span>
        ) : null}
      </span>
      {label ? <span>{label}</span> : null}
    </button>
  );
}
