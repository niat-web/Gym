import React from 'react';
import { cn } from '../../lib/utils.js';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-charcoal-700/60', className)}
      {...props}
    />
  );
};

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  barClassName,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn('w-full bg-charcoal-750 rounded-full h-2.5 overflow-hidden border border-charcoal-700', className)}
    >
      <div
        className={cn(
          'h-full bg-lime-500 rounded-full transition-all duration-500 ease-out',
          barClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
