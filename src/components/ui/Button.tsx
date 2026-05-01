import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'vlm-btn-primary',
      secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all',
      outline: 'border border-emerald-500/30 bg-transparent text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all',
      ghost: 'bg-transparent hover:bg-white/5 text-white/50 hover:text-white',
      danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all',
    };

    const sizes = {
      sm: 'h-8 px-4 text-[10px] uppercase tracking-widest font-bold',
      md: 'h-11 px-6 py-2 text-[11px] uppercase tracking-[0.2em] font-black',
      lg: 'h-14 px-10 text-[12px] uppercase tracking-[0.2em] font-black',
      icon: 'h-10 w-10 p-2 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-sans transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95 rounded-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-12 w-full border-b border-white/20 bg-transparent py-4 text-white focus-visible:outline-none focus:border-emerald-500 transition-colors font-sans placeholder:text-white/10',
          className
        )}
        {...props}
      />
    );
  }
);
