import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function Dropdown({ label, options, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="secondary" onClick={() => setOpen((current) => !current)} icon={<ChevronDown size={16} />}>
        {label}: {value}
      </Button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-control border border-border bg-white p-1 shadow-lift">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left font-inter text-[14px] font-medium leading-5 transition hover:bg-primary-pale',
                option === value && 'bg-primary-pale text-primary',
              )}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
