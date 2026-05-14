import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<string | { label: string; value: string }> | readonly string[] | readonly { label: string; value: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, options, className, ...props }, ref) {
  const labelIsThai = label ? /[\u0E00-\u0E7F]/.test(label) : false;

  return (
    <label className="block">
      {label ? <span className={`mb-1.5 block ${labelIsThai ? 'font-kanit text-[13px] font-medium leading-[18px] text-slate-700' : 'text-label-ui'}`}>{label}</span> : null}
      <select
        ref={ref}
        className={cn(
          'focus-ring h-11 w-full rounded-control border border-border bg-white px-3 font-inter text-[14px] font-medium leading-5 text-ink outline-none transition focus:border-primary-soft',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </select>
    </label>
  );
});
