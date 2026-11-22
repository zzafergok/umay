'use client';

import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { enUS } from 'date-fns/locale/en-US';
import { tr } from 'date-fns/locale/tr';

import { Button } from '@/components/core/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/core/popover';
import { routing, toBCP47Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import { Calendar } from './calendar';
import {
  CalendarMonthsGrid,
  CalendarNavHeader,
  CalendarYearsGrid,
  type CalendarViewMode,
} from './calendar-grid-views';
import { datePickerCopy } from './constants';
import type { ModernDatePickerProps } from './types';

function getYearRangeStart(year: number): number {
  return Math.floor(year / 12) * 12;
}

export function ModernDatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  clearable = true,
  minDate,
  maxDate,
  className,
  error = false,
  includeTime = false,
  locale = routing.defaultLocale,
}: ModernDatePickerProps) {
  const copy = datePickerCopy[locale];
  const bcp47Locale = toBCP47Locale(locale);
  const dateLocale = locale === 'tr' ? tr : enUS;

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<CalendarViewMode>('days');
  const [currentMonth, setCurrentMonth] = useState<Date>(value ?? new Date());
  const [yearRangeStart, setYearRangeStart] = useState<number>(() =>
    getYearRangeStart((value ?? new Date()).getFullYear()),
  );

  const displayValue = useMemo(() => {
    if (!value) return placeholder ?? copy.selectDate;
    return value.toLocaleDateString(bcp47Locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [bcp47Locale, copy.selectDate, value, placeholder]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const base = value ?? new Date();
      setCurrentMonth(base);
      setYearRangeStart(getYearRangeStart(base.getFullYear()));
      setView('days');
    }
    setIsOpen(nextOpen);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (includeTime) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      onChange(d);
    } else {
      onChange(date);
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleSelectToday = () => {
    const today = new Date();
    if (includeTime) today.setHours(0, 0, 0, 0);
    setCurrentMonth(today);
    setYearRangeStart(getYearRangeStart(today.getFullYear()));
    onChange(today);
    setView('days');
    setIsOpen(false);
  };

  const handlePrev = () => {
    if (view === 'days') {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
      );
    } else if (view === 'months') {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear() - 1, prev.getMonth(), 1),
      );
    } else {
      setYearRangeStart((prev) => prev - 12);
    }
  };

  const handleNext = () => {
    if (view === 'days') {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
      );
    } else if (view === 'months') {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear() + 1, prev.getMonth(), 1),
      );
    } else {
      setYearRangeStart((prev) => prev + 12);
    }
  };

  const handleSelectView = (nextView: CalendarViewMode) => {
    if (nextView === 'years') {
      setYearRangeStart(getYearRangeStart(currentMonth.getFullYear()));
    }
    setView(nextView);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-slot="modern-date-picker-trigger"
          className={cn(
            'h-10 w-full justify-start px-3 py-2 text-left font-normal',
            !value && 'text-ash/70',
            error && 'border-alert-red focus:border-alert-red',
            'transition-colors duration-150 hover:bg-surface-sunken',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-text-muted" />
          <span className="truncate">{displayValue}</span>
          {clearable && value && !disabled && (
            <X
              className="ml-auto h-4 w-4 shrink-0 text-text-muted transition-colors hover:text-text"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        data-slot="modern-date-picker-content"
        className="z-[150] w-auto max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-surface p-0 shadow-float"
        align="start"
        sideOffset={6}
        collisionPadding={12}
      >
        <CalendarNavHeader
          view={view}
          currentMonth={currentMonth}
          bcp47Locale={bcp47Locale}
          yearRangeStart={yearRangeStart}
          onPrev={handlePrev}
          onNext={handleNext}
          onSelectView={handleSelectView}
        />

        {view === 'days' ? (
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={dateLocale}
            weekStartsOn={1}
            hideNavigation
            classNames={{ month_caption: 'hidden' }}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            className="border-0 pt-2 shadow-none"
          />
        ) : view === 'months' ? (
          <CalendarMonthsGrid
            currentMonth={currentMonth}
            bcp47Locale={bcp47Locale}
            onSelectMonth={(monthIndex) => {
              setCurrentMonth(
                (prev) => new Date(prev.getFullYear(), monthIndex, 1),
              );
              setView('days');
            }}
          />
        ) : (
          <CalendarYearsGrid
            yearRangeStart={yearRangeStart}
            selectedYear={currentMonth.getFullYear()}
            onSelectYear={(year) => {
              setCurrentMonth((prev) => new Date(year, prev.getMonth(), 1));
              setView('months');
            }}
          />
        )}

        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleSelectToday}
            className="h-7 min-h-0 px-2 text-xs text-accent hover:bg-accent-subtle hover:text-accent"
          >
            {locale === 'tr' ? 'Bugün' : 'Today'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="h-7 min-h-0 px-3 text-xs"
          >
            {copy.done as string}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
