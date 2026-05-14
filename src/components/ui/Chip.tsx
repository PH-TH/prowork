import type { ButtonHTMLAttributes } from 'react';
import { cn, toneClasses } from '../../lib/utils';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  tone?: string;
}

export function Chip({ className, active, tone = 'green', children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'focus-ring rounded-full border px-3 py-1.5 text-chip-ui transition duration-180 hover:-translate-y-0.5',
        active ? toneClasses(tone) : 'border-border bg-white text-slateText hover:border-primary-soft hover:bg-primary-pale hover:text-primary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
