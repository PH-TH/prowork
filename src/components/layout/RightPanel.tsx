import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface RightPanelProps {
  children: ReactNode;
  className?: string;
}

export function RightPanel({ children, className }: RightPanelProps) {
  return <aside className={cn('space-y-4 lg:w-[320px] lg:shrink-0', className)}>{children}</aside>;
}
