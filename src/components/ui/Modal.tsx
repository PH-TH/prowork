import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl' | 'full';
}

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'lg' }: ModalProps) {
  const titleIsThai = /[\u0E00-\u0E7F]/.test(title);
  const subtitleIsThai = subtitle ? /[\u0E00-\u0E7F]/.test(subtitle) : false;
  const sizeClass = {
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-6xl',
  }[size];

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-modal border border-border bg-white shadow-modal sm:rounded-modal',
              sizeClass,
            )}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.23, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border p-6">
              <div>
                <h2 className={titleIsThai ? 'font-kanit text-[22px] font-semibold leading-[30px] text-slate-950' : 'text-section-title'}>{title}</h2>
                {subtitle ? <p className={`mt-1 ${subtitleIsThai ? 'text-page-subtitle-th' : 'text-page-subtitle'}`}>{subtitle}</p> : null}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
                <X size={18} />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
            {footer ? <div className="shrink-0 border-t border-border bg-slate-50/60 px-6 py-4">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
