'use client';

import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> {
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, indicatorClassName, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    data-slot="progress"
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-surface-sunken',
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(
        'size-full flex-1 bg-accent transition-transform duration-200 ease-out',
        indicatorClassName,
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export interface LifecycleProgressBarProps {
  remainingPercent: number;
  daysRemaining?: number | null;
  status?: 'ok' | 'due_soon' | 'overdue';
  metaLabel?: string;
  className?: string;
}

/**
 * Part lifecycle progress bar paired with explicit numeric text readout.
 */
function LifecycleProgressBar({
  remainingPercent,
  daysRemaining,
  status = 'ok',
  metaLabel,
  className,
}: LifecycleProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(remainingPercent)));
  const isDanger = status === 'overdue' || clamped <= 0;
  const isWarning = !isDanger && (status === 'due_soon' || clamped <= 20);
  const indicatorClass = isDanger
    ? 'bg-danger'
    : isWarning
      ? 'bg-warning'
      : 'bg-accent';

  const summaryText =
    daysRemaining !== null && daysRemaining !== undefined
      ? daysRemaining < 0
        ? `${Math.abs(daysRemaining)} gün geçti · %${clamped}`
        : `${daysRemaining} gün · %${clamped}`
      : `%${clamped}`;

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2 tabular-nums">
        <span className="text-body-sm font-medium text-text">
          {summaryText}
        </span>
        {metaLabel ? (
          <span className="text-caption text-text-muted">{metaLabel}</span>
        ) : null}
      </div>
      <Progress value={clamped} indicatorClassName={indicatorClass} />
    </div>
  );
}

export { LifecycleProgressBar, Progress };
