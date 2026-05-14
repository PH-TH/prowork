import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider({ label, className, value, ...props }, ref) {
  const labelIsThai = label ? /[\u0E00-\u0E7F]/.test(label) : false;

  return (
    <label className="block">
      <span className={`mb-2 flex items-center justify-between ${labelIsThai ? 'font-kanit text-[13px] font-medium leading-[18px] text-slate-700' : 'text-label-ui'}`}>
        <span>{label}</span>
        <span className="font-data text-slateText">{String(value ?? props.defaultValue ?? '')}</span>
      </span>
      <input ref={ref} type="range" value={value} className={cn('w-full accent-primary', className)} {...props} />
    </label>
  );
});
