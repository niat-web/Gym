import React from 'react';
import { cn } from '../../lib/utils.js';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'lime';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-lime-500 text-charcoal-950 hover:bg-lime-400 hover:shadow-lime-glow focus:ring-lime-400 focus:ring-offset-charcoal-900 font-bold',
      lime:
        'bg-lime-500 text-charcoal-950 hover:bg-lime-400 hover:shadow-lime-glow focus:ring-lime-400 font-bold',
      secondary:
        'bg-charcoal-800 text-slate-100 hover:bg-charcoal-750 border border-charcoal-700 focus:ring-slate-400 focus:ring-offset-charcoal-900',
      outline:
        'bg-transparent text-slate-200 border border-charcoal-600 hover:bg-charcoal-800 hover:border-slate-400 focus:ring-slate-400',
      ghost:
        'bg-transparent text-slate-300 hover:bg-charcoal-800 hover:text-white focus:ring-slate-500',
      danger:
        'bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500 focus:ring-offset-charcoal-900',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2.5 gap-2 h-10',
      lg: 'text-base px-6 py-3.5 gap-2.5 h-12',
      icon: 'p-2.5 h-10 w-10',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
