import React from 'react';
import { cn } from '../../lib/utils.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'lime' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center font-bold uppercase tracking-wider rounded-full';

  const variants = {
    lime: 'bg-lime-500/20 text-lime-400 border border-lime-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    info: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    neutral: 'bg-charcoal-700 text-slate-300 border border-charcoal-600',
    outline: 'bg-transparent text-slate-300 border border-charcoal-600',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
