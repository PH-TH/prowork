import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: ReactNode;
}

export function Button({ className, variant = 'primary', size = 'md', icon, children, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
    secondary: 'bg-white text-ink border border-border hover:border-primary-soft hover:bg-primary-pale',
    ghost: 'bg-transparent text-slateText hover:bg-slate-100 hover:text-ink',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'bg-white text-primary border border-primary-soft hover:bg-primary-pale',
  };
  const sizes = {
    sm: 'h-9 px-3',
    md: 'h-11 px-4',
    lg: 'h-12 px-5',
    icon: 'h-10 w-10 p-0',
  };

  return (
    <button
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-control font-inter text-[14px] font-bold leading-5 transition duration-180 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
