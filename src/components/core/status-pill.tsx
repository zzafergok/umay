import * as React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock,
  Info,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusTone =
  | 'ok'
  | 'due_soon'
  | 'overdue'
  | 'low_stock'
  | 'out_of_stock'
  | 'active'
  | 'in_repair'
  | 'lent'
  | 'discarded'
  | 'info';

export interface StatusPillProps {
  tone: StatusTone;
  label: string;
  className?: string;
}

const TONE_STYLES: Record<
  StatusTone,
  { container: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  ok: {
    container: 'border-success/20 bg-success-subtle text-success',
    Icon: CheckCircle2,
  },
  active: {
    container: 'border-success/20 bg-success-subtle text-success',
    Icon: CheckCircle2,
  },
  due_soon: {
    container: 'border-warning/25 bg-warning-subtle text-warning',
    Icon: Clock,
  },
  low_stock: {
    container: 'border-warning/25 bg-warning-subtle text-warning',
    Icon: AlertCircle,
  },
  overdue: {
    container: 'border-danger/25 bg-danger-subtle text-danger',
    Icon: AlertTriangle,
  },
  out_of_stock: {
    container: 'border-danger/25 bg-danger-subtle text-danger',
    Icon: AlertTriangle,
  },
  in_repair: {
    container: 'border-warning/25 bg-warning-subtle text-warning',
    Icon: Wrench,
  },
  lent: {
    container: 'border-info/25 bg-info-subtle text-info',
    Icon: Info,
  },
  discarded: {
    container: 'border-border bg-surface-sunken text-text-muted',
    Icon: Archive,
  },
  info: {
    container: 'border-info/25 bg-info-subtle text-info',
    Icon: Info,
  },
};

/**
 * Color-blind-safe status badge combining semantic color, 14px icon, and explicit text.
 */
export function StatusPill({ tone, label, className }: StatusPillProps) {
  const { container, Icon } = TONE_STYLES[tone];

  return (
    <span
      data-slot="status-pill"
      data-tone={tone}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2 py-0.5 text-caption font-medium leading-tight',
        container,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
