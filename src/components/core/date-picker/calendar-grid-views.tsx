'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/core/button';
import { cn } from '@/lib/utils';

export type CalendarViewMode = 'days' | 'months' | 'years';

interface CalendarNavHeaderProps {
  view: CalendarViewMode;
  currentMonth: Date;
  bcp47Locale: string;
  yearRangeStart: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectView: (view: CalendarViewMode) => void;
}

export function CalendarNavHeader({
  view,
  currentMonth,
  bcp47Locale,
  yearRangeStart,
  onPrev,
  onNext,
  onSelectView,
}: CalendarNavHeaderProps) {
  const monthLabel = React.useMemo(
    () =>
      new Intl.DateTimeFormat(bcp47Locale, { month: 'long' }).format(
        currentMonth,
      ),
    [bcp47Locale, currentMonth],
  );
  const isTr = bcp47Locale.startsWith('tr');
  const yearLabel = currentMonth.getFullYear();

  return (
    <div className="flex items-center justify-between gap-1 px-3 pt-3">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onPrev}
        aria-label={
          view === 'days'
            ? isTr
              ? 'Önceki ay'
              : 'Previous month'
            : view === 'months'
              ? isTr
                ? 'Önceki yıl'
                : 'Previous year'
              : isTr
                ? 'Önceki yıllar'
                : 'Previous years'
        }
        className="size-7 min-h-0 text-text-muted hover:bg-surface-sunken hover:text-text"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex items-center gap-1">
        {view === 'days' ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onSelectView('months')}
              className="h-7 min-h-0 px-2 text-xs font-semibold text-text hover:bg-surface-sunken"
            >
              {monthLabel}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onSelectView('years')}
              className="h-7 min-h-0 px-2 text-xs font-semibold text-text hover:bg-surface-sunken"
            >
              {yearLabel}
            </Button>
          </>
        ) : view === 'months' ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onSelectView('years')}
            className="h-7 min-h-0 px-2.5 text-xs font-semibold text-text hover:bg-surface-sunken"
          >
            {yearLabel}
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onSelectView('days')}
            className="h-7 min-h-0 px-2.5 text-xs font-semibold tabular-nums text-text hover:bg-surface-sunken"
          >
            {yearRangeStart} – {yearRangeStart + 11}
          </Button>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onNext}
        aria-label={
          view === 'days'
            ? isTr
              ? 'Sonraki ay'
              : 'Next month'
            : view === 'months'
              ? isTr
                ? 'Sonraki yıl'
                : 'Next year'
              : isTr
                ? 'Sonraki yıllar'
                : 'Next years'
        }
        className="size-7 min-h-0 text-text-muted hover:bg-surface-sunken hover:text-text"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

interface CalendarMonthsGridProps {
  currentMonth: Date;
  bcp47Locale: string;
  onSelectMonth: (monthIndex: number) => void;
}

export function CalendarMonthsGrid({
  currentMonth,
  bcp47Locale,
  onSelectMonth,
}: CalendarMonthsGridProps) {
  const formatter = React.useMemo(
    () => new Intl.DateTimeFormat(bcp47Locale, { month: 'short' }),
    [bcp47Locale],
  );
  const selectedMonth = currentMonth.getMonth();
  const year = currentMonth.getFullYear();

  return (
    <div className="grid w-[276px] grid-cols-3 gap-1.5 p-3">
      {Array.from({ length: 12 }, (_, idx) => {
        const label = formatter.format(new Date(year, idx, 1));
        const isSelected = idx === selectedMonth;
        return (
          <Button
            key={idx}
            type="button"
            variant={isSelected ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSelectMonth(idx)}
            className={cn(
              'h-9 min-h-0 text-xs font-medium capitalize',
              !isSelected && 'text-text hover:bg-surface-sunken',
            )}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}

interface CalendarYearsGridProps {
  yearRangeStart: number;
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

export function CalendarYearsGrid({
  yearRangeStart,
  selectedYear,
  onSelectYear,
}: CalendarYearsGridProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="grid w-[276px] grid-cols-3 gap-1.5 p-3">
      {Array.from({ length: 12 }, (_, idx) => {
        const year = yearRangeStart + idx;
        const isSelected = year === selectedYear;
        const isCurrent = year === currentYear;
        return (
          <Button
            key={year}
            type="button"
            variant={isSelected ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSelectYear(year)}
            className={cn(
              'h-9 min-h-0 text-xs font-medium tabular-nums',
              !isSelected && isCurrent && 'bg-accent-subtle text-accent',
              !isSelected && !isCurrent && 'text-text hover:bg-surface-sunken',
            )}
          >
            {year}
          </Button>
        );
      })}
    </div>
  );
}
