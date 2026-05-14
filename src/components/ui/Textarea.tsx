import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, className, ...props }, ref) {
  const labelIsThai = label ? /[\u0E00-\u0E7F]/.test(label) : false;

  return (
    <label className="block">
      {label ? <span className={`mb-1.5 block ${labelIsThai ? 'font-kanit text-[13px] font-medium leading-[18px] text-slate-700' : 'text-label-ui'}`}>{label}</span> : null}
      <textarea
        ref={ref}
        className={cn(
          'focus-ring min-h-28 w-full resize-y rounded-control border border-border bg-white px-3 py-2.5 font-inter text-[14px] font-medium leading-5 text-ink outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary-soft',
          className,
        )}
        {...props}
      />
    </label>
  );
});
