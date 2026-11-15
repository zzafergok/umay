'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/core/button';
import { cn } from '@/lib/utils';
import { MONTHS, QUICK_DATES } from './constants';
import type { QuickDateItem } from './constants';

interface MonthYearGridProps {
  currentYear: number;
  value?: string;
  minDate?: string;
  maxDate?: string;
  displayValue: string;
  onNavigateYear: (direction: 'prev' | 'next') => void;
  onMonthSelect: (monthIndex: number) => void;
  onClose: () => void;
}

export function MonthYearGrid({
  currentYear,
  value,
  minDate,
  maxDate,
  displayValue,
  onNavigateYear,
  onMonthSelect,
  onClose,
}: MonthYearGridProps) {
  const isMonthDisabled = (monthIndex: number) => {
    const monthValue = `${currentYear}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    return Boolean(
      (minDate && monthValue < minDate) || (maxDate && monthValue > maxDate),
    );
  };

  return (
    <div className="min-w-[280px] p-3">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigateYear('prev')}
          className="h-8 w-8 p-0 hover:bg-gunmetal/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-[80px] text-center text-lg font-semibold text-titanium">
          {currentYear}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigateYear('next')}
          className="h-8 w-8 p-0 hover:bg-gunmetal/20"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MONTHS.map((month, index) => {
          const monthValue = `${currentYear}-${(index + 1).toString().padStart(2, '0')}`;
          const selected = monthValue === value;
          const current =
            new Date().getFullYear() === currentYear &&
            new Date().getMonth() === index;
          const disabled = isMonthDisabled(index);

          return (
            <Button
              key={month}
              variant="ghost"
              size="sm"
              className={cn(
                'relative flex h-10 items-center justify-center px-3 text-body-sm font-normal',
                'text-text hover:bg-surface-sunken',
                selected &&
                  'bg-accent text-on-accent hover:bg-accent-hover hover:text-on-accent',
                current &&
                  !selected &&
                  'border border-accent/25 bg-accent-subtle text-accent',
                disabled && 'cursor-not-allowed opacity-50',
              )}
              onClick={() => !disabled && onMonthSelect(index)}
              disabled={disabled}
            >
              {month}
              {current && !selected && (
                <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-accent" />
              )}
            </Button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="text-caption text-text-muted">
          {value ? displayValue : 'Ay/Yıl seçilmedi'}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 px-3 text-caption"
        >
          Tamam
        </Button>
      </div>
    </div>
  );
}

interface MonthYearSidebarProps {
  onQuickDateSelect: (quickDate: QuickDateItem) => void;
}

export function MonthYearSidebar({ onQuickDateSelect }: MonthYearSidebarProps) {
  return (
    <div className="min-w-[120px] border-r border-border p-3">
      <div className="mb-2 text-caption font-semibold text-text-muted">
        Hızlı Seçim
      </div>
      <div className="space-y-1">
        {QUICK_DATES.map((quickDate) => (
          <Button
            key={quickDate.label}
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start px-2 text-caption font-normal hover:bg-accent-subtle"
            onClick={() => onQuickDateSelect(quickDate)}
          >
            {quickDate.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
