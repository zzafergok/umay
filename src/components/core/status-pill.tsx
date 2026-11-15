import * as React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock,
  Info,
  PackageX,
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
    container:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  active: {
    container:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  due_soon: {
    container:
      'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    Icon: Clock,
  },
  low_stock: {
    container:
      'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    Icon: AlertTriangle,
  },
  overdue: {
    container: 'border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-400',
    Icon: AlertCircle,
  },
  out_of_stock: {
    container: 'border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-400',
    Icon: PackageX,
  },
  in_repair: {
    container:
      'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    Icon: Wrench,
  },
  lent: {
    container:
      'border-tulpar-blue/35 bg-tulpar-blue/10 text-tulpar-blue',
    Icon: Info,
  },
  discarded: {
    container: 'border-border bg-muted text-muted-foreground',
    Icon: Archive,
  },
  info: {
    container:
      'border-tulpar-blue/35 bg-tulpar-blue/10 text-tulpar-blue',
    Icon: Info,
  },
};

/**
 * Color-blind-safe status badge combining color, icon, and explicit text.
 */
export function StatusPill({ tone, label, className }: StatusPillProps) {
  const { container, Icon } = TONE_STYLES[tone];

  return (
    <span
      data-slot="status-pill"
      data-tone={tone}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium leading-tight',
        container,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
