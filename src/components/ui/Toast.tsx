import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';

export function ToastViewport() {
  const { toasts, removeToast } = useAppStore();

  useEffect(() => {
    const timers = toasts.map((toast) => window.setTimeout(() => removeToast(toast.id), 2000));
    return () => timers.forEach(window.clearTimeout);
  }, [removeToast, toasts]);

  return (
    <div className="fixed right-4 top-4 z-[80] flex w-[min(380px,calc(100vw-32px))] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toast.type === 'warning' ? TriangleAlert : toast.type === 'info' ? Info : CheckCircle2;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="rounded-control border border-primary-soft bg-white p-4 shadow-lift"
            >
              <div className="flex gap-3">
                <Icon className="mt-0.5 text-primary" size={20} />
                <div>
                  <p className="text-card-title">{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-caption-ui">{toast.description}</p> : null}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
