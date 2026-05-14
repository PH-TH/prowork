import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TabItem {
  id: string;
  label: string;
  content?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ items, active, onChange }: TabsProps) {
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto border-b border-border">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn('relative min-w-fit px-3 py-3 font-inter text-[14px] font-semibold leading-5 text-slateText transition hover:text-ink', active === item.id && 'text-primary')}
          >
            {item.label}
            {active === item.id ? (
              <motion.span
                layoutId="active-tab"
                className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                transition={{ duration: 0.18 }}
              />
            ) : null}
          </button>
        ))}
      </div>
      <motion.div key={active} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16 }}>
        {items.find((item) => item.id === active)?.content}
      </motion.div>
    </div>
  );
}
