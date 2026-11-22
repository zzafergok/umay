'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  buildSelectItemSearchCorpus,
  matchesSelectSearch,
  useSelectSearchContext,
} from './select-search-utils';
import type { SelectItemProps } from './types';

export const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn(
      'flex cursor-default items-center justify-center py-1 text-text-muted',
      className,
    )}
    {...props}
  >
    <ChevronUp className="size-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

export const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    data-slot="select-scroll-down-button"
    className={cn(
      'flex cursor-default items-center justify-center py-1 text-text-muted',
      className,
    )}
    {...props}
  >
    <ChevronDown className="size-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn(
      'py-1.5 pl-8 pr-2 text-caption font-semibold text-text-muted',
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, endAdornment, searchValue, ...props }, ref) => {
  const { hasActiveQuery, query } = useSelectSearchContext();

  const isMatched = React.useMemo(() => {
    if (!hasActiveQuery) return true;
    const corpus = buildSelectItemSearchCorpus({
      children,
      endAdornment,
      searchValue,
      textValue: props.textValue,
      value: props.value,
    });
    return matchesSelectSearch(corpus, query);
  }, [
    hasActiveQuery,
    query,
    children,
    endAdornment,
    searchValue,
    props.textValue,
    props.value,
  ]);

  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      data-search-hidden={!isMatched ? 'true' : undefined}
      aria-hidden={!isMatched ? 'true' : undefined}
      className={cn(
        'relative flex min-h-[36px] w-full max-w-full cursor-pointer select-none items-center overflow-hidden rounded-sm py-1.5 pl-7 pr-2 text-body-sm text-text outline-none transition-colors duration-150',
        'focus:bg-accent-subtle focus:text-text data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        !isMatched && 'hidden',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator data-slot="select-item-indicator">
          <Check className="size-4 text-accent" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <span className="min-w-0 flex-1 truncate leading-snug">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </span>
      {endAdornment && (
        <span
          aria-hidden="true"
          className="ml-auto flex shrink-0 items-center pl-2"
        >
          {endAdornment}
        </span>
      )}
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = 'SelectItem';

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const { hasActiveQuery } = useSelectSearchContext();
  return (
    <SelectPrimitive.Separator
      ref={ref}
      data-slot="select-separator"
      className={cn(
        '-mx-1 my-1 h-px bg-border',
        hasActiveQuery && 'hidden',
        className,
      )}
      {...props}
    />
  );
});
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
