import type { ReactNode } from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  return (
    <span
      className={cn('inline-flex', className)}
      onMouseEnter={(event) => setPosition({ x: event.clientX, y: event.clientY })}
      onMouseMove={(event) => setPosition({ x: event.clientX, y: event.clientY })}
      onMouseLeave={() => setPosition(null)}
    >
      {children}
      {position
        ? createPortal(
            <div
              className="pointer-events-none fixed z-[70] max-w-[280px] rounded-control bg-ink px-3 py-2 font-inter text-[12px] font-medium leading-[18px] text-white shadow-modal"
              style={{
                left: Math.min(position.x + 12, window.innerWidth - 292),
                top: Math.max(12, position.y - 76),
              }}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
