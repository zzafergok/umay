'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/core/select';
import { cn } from '@/lib/utils';
import type { CompactFilterOption } from './types';

interface CompactFilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  allLabel: string;
  ariaLabel: string;
  options: CompactFilterOption[];
  activeClassName: string;
  inactiveClassName: string;
  maxWidthClass?: string;
}

/** Compact borderless select trigger styled for the unified filter toolbar. */
export function CompactFilterSelect({
  value,
  onValueChange,
  allLabel,
  ariaLabel,
  options,
  activeClassName,
  inactiveClassName,
  maxWidthClass = 'sm:max-w-[165px]',
}: CompactFilterSelectProps) {
  const isActive = value !== 'all';

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          'w-auto min-w-[120px] flex-1 justify-between gap-1.5 border-0 bg-transparent py-0 shadow-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0 sm:flex-none [&>span]:truncate',
          maxWidthClass,
          isActive ? activeClassName : inactiveClassName,
        )}
      >
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
