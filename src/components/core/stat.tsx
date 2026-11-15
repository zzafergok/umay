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
        'bg-surface flex flex-col justify-between gap-2 rounded-md border border-border p-4 md:p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-muted text-caption">{label}</span>
        {icon ? (
          <span className="text-text-muted" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-heading text-metric tabular-nums',
            VALUE_TONE_CLASSES[tone],
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className="text-text-muted text-caption">{unit}</span>
        ) : null}
      </div>
      {hint ? (
        <span className="text-text-muted text-caption">{hint}</span>
      ) : null}
    </div>
  );
}
