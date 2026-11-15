import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StatProps {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const VALUE_TONE_CLASSES: Record<NonNullable<StatProps['tone']>, string> = {
  default: 'text-foreground',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-700 dark:text-amber-300',
  danger: 'text-red-700 dark:text-red-400',
};

/**
 * Compact metric display with small muted label and prominent tabular-nums value.
 */
export function Stat({
  label,
  value,
  unit,
  hint,
  icon,
  tone = 'default',
  className,
}: StatProps) {
  return (
    <div
      data-slot="stat"
      className={cn(
        'flex flex-col justify-between gap-1.5 rounded-sm border border-border bg-card p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        {icon ? (
          <span className="text-muted-foreground" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'text-2xl font-bold tracking-tight tabular-nums',
            VALUE_TONE_CLASSES[tone],
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className="text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </div>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}
