'use client';

import * as React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/core/button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: VariantProps<typeof buttonVariants>['variant'];
};

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  locale,
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'w-fit select-none rounded-md border border-border bg-surface p-3 text-text',
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn(defaultClassNames.root, 'relative w-fit'),
        months: cn(
          defaultClassNames.months,
          'relative flex flex-col gap-4 sm:flex-row',
        ),
        month: cn(defaultClassNames.month, 'space-y-3'),
        month_caption: cn(
          defaultClassNames.month_caption,
          'relative flex h-8 items-center justify-center px-8 text-body-sm font-medium text-text',
        ),
        dropdowns: cn(
          defaultClassNames.dropdowns,
          'relative z-20 flex items-center justify-center gap-1.5',
        ),
        dropdown_root: cn(
          defaultClassNames.dropdown_root,
          'relative inline-flex items-center rounded-md border border-border bg-surface-sunken/60 px-2 py-1 text-xs font-medium text-text transition-colors hover:bg-surface-sunken focus-within:ring-1 focus-within:ring-accent',
        ),
        dropdown: cn(
          defaultClassNames.dropdown,
          'absolute inset-0 z-10 cursor-pointer opacity-0',
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          'inline-flex items-center gap-1 text-xs font-medium text-text',
        ),
        nav: cn(
          defaultClassNames.nav,
          'pointer-events-none absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-between',
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'pointer-events-auto size-7 min-h-0 bg-transparent p-0 text-text-muted hover:bg-surface-sunken hover:text-text',
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'pointer-events-auto size-7 min-h-0 bg-transparent p-0 text-text-muted hover:bg-surface-sunken hover:text-text',
        ),
        month_grid: cn(
          defaultClassNames.month_grid,
          'w-full border-collapse space-y-1',
        ),
        weekdays: cn(defaultClassNames.weekdays, 'flex'),
        weekday: cn(
          defaultClassNames.weekday,
          'w-9 rounded-sm text-center text-caption font-normal text-text-muted',
        ),
        week: cn(defaultClassNames.week, 'mt-1.5 flex w-full'),
        day: cn(
          'relative p-0 text-center text-body-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent-subtle [&:has([aria-selected].day-range-end)]:rounded-e-sm [&:has([aria-selected].day-outside)]:bg-transparent',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-e-sm [&:has(>.day-range-start)]:rounded-s-sm first:[&:has([aria-selected])]:rounded-s-sm last:[&:has([aria-selected])]:rounded-e-sm'
            : '[&:has([aria-selected])]:rounded-sm',
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-9 min-h-0 rounded-sm p-0 font-normal text-text transition-colors hover:bg-surface-sunken hover:text-text aria-selected:opacity-100 [.day-outside_&]:text-text-subtle [.day-outside_&]:opacity-40 [.day-outside_&]:hover:opacity-75',
        ),
        range_start:
          'day-range-start rounded-s-sm bg-accent text-on-accent hover:bg-accent-hover hover:text-on-accent',
        range_end:
          'day-range-end rounded-e-sm bg-accent text-on-accent hover:bg-accent-hover hover:text-on-accent',
        today:
          'rounded-sm bg-accent-subtle font-semibold text-accent [&>button]:font-semibold [&>button]:text-accent [&>button:hover]:bg-accent-subtle/80 [&>button:hover]:text-accent',
        selected:
          'rounded-sm bg-accent text-on-accent hover:bg-accent-hover hover:text-on-accent focus:bg-accent focus:text-on-accent [&>button]:bg-accent [&>button]:font-semibold [&>button]:text-on-accent [&>button]:opacity-100 [&>button:hover]:bg-accent-hover [&>button:hover]:text-on-accent',
        outside:
          'day-outside text-text-subtle aria-selected:bg-accent-subtle/50 aria-selected:text-text-muted',
        disabled: 'cursor-not-allowed text-text-subtle opacity-50',
        range_middle:
          'rounded-sm aria-selected:bg-accent-subtle aria-selected:text-accent',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeft
                className="size-4 rtl:rotate-180"
                {...chevronProps}
              />
            );
          }
          if (orientation === 'down') {
            return (
              <ChevronDown
                className="size-3.5 text-text-muted"
                {...chevronProps}
              />
            );
          }
          return (
            <ChevronRight className="size-4 rtl:rotate-180" {...chevronProps} />
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';
