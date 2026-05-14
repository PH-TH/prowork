import type { HTMLAttributes } from 'react';
import { cn, toneClasses } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: string;
}

export function Badge({ className, tone = 'gray', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-chip-ui', toneClasses(tone), className)}
      {...props}
    >
      {children}
    </span>
  );
}
