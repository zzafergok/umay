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
  default: 'text-text',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

/**
 * Compact metric display with caption label and Manrope tabular-nums metric readout.
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
        'flex flex-col justify-between gap-2 rounded-md border border-border bg-surface p-4 md:p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-text-muted">{label}</span>
        {icon ? (
          <span className="text-text-muted" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span
          className={cn(
            'truncate font-heading text-xl tabular-nums sm:text-metric',
            VALUE_TONE_CLASSES[tone],
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className="shrink-0 text-caption text-text-muted">{unit}</span>
        ) : null}
      </div>
      {hint ? (
        <span className="text-caption text-text-muted">{hint}</span>
      ) : null}
    </div>
  );
}
