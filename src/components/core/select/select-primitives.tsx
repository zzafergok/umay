'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
} from './select-items';
import { SelectSearchHeader } from './select-search-header';
import {
  collectSelectItemsSearchCorpora,
  DEFAULT_SELECT_SEARCH_THRESHOLD,
  matchesSelectSearch,
  SelectSearchContext,
} from './select-search-utils';
import type { SelectContentProps } from './types';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;
export {
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
};

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-slot="select-trigger"
    className={cn(
      'flex h-10 min-h-[40px] w-full min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-surface-sunken px-3 py-1.5 text-body-sm text-text outline-none transition-colors duration-150 md:h-9 md:min-h-[36px]',
      'placeholder:text-text-subtle focus:border-accent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-invalid:border-danger',
      '[&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left [&>span]:leading-snug',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 shrink-0 text-text-muted" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

function getFocusableOutsideTarget(
  target: EventTarget | null,
): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const focusable = target.closest(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
  );
  return focusable instanceof HTMLElement ? focusable : null;
}

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(
  (
    {
      className,
      children,
      position = 'popper',
      searchable,
      searchThreshold = DEFAULT_SELECT_SEARCH_THRESHOLD,
      searchPlaceholder,
      emptySearchText = 'Aramanızla eşleşen seçenek bulunamadı.',
      onCloseAutoFocus,
      onPointerDownOutside,
      ...props
    },
    ref,
  ) => {
    const outsideTargetRef = React.useRef<HTMLElement | null>(null);
    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    const [query, setQuery] = React.useState('');

    const itemCorpora = React.useMemo(
      () => collectSelectItemsSearchCorpora(children),
      [children],
    );
    const totalCount = itemCorpora.length;
    const isSearchEnabled = searchable ?? totalCount > searchThreshold;
    const hasActiveQuery = isSearchEnabled && query.trim().length > 0;

    const matchedCount = React.useMemo(() => {
      if (!hasActiveQuery) return totalCount;
      return itemCorpora.filter((corpus) => matchesSelectSearch(corpus, query))
        .length;
    }, [hasActiveQuery, itemCorpora, query, totalCount]);

    const searchContextValue = React.useMemo(
      () => ({ isSearchEnabled, query, hasActiveQuery }),
      [isSearchEnabled, query, hasActiveQuery],
    );

    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          data-slot="select-content"
          className={cn(
            'relative z-[10000] flex max-h-96 min-w-[8rem] flex-col overflow-hidden rounded-md border border-border bg-surface-raised text-text shadow-float outline-none dark:border-border-strong',
            !isSearchEnabled && 'p-1',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            position === 'popper' &&
              'w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)] data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            className,
          )}
          position={position}
          onPointerDownOutside={(event) => {
            onPointerDownOutside?.(event);
            if (!event.defaultPrevented) {
              outsideTargetRef.current = getFocusableOutsideTarget(
                event.detail.originalEvent.target,
              );
            }
          }}
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event);
            if (event.defaultPrevented) return;
            const target = outsideTargetRef.current;
            outsideTargetRef.current = null;
            if (!target) return;
            event.preventDefault();
            window.requestAnimationFrame(() => {
              if (target.isConnected) target.focus({ preventScroll: true });
            });
          }}
          {...props}
        >
          {isSearchEnabled && (
            <SelectSearchHeader
              query={query}
              onQueryChange={setQuery}
              matchedCount={matchedCount}
              totalCount={totalCount}
              placeholder={searchPlaceholder}
              viewportRef={viewportRef}
            />
          )}
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            ref={viewportRef}
            data-slot="select-viewport"
            className={cn(
              'max-w-full overflow-x-hidden p-1',
              position === 'popper' &&
                'w-full min-w-[var(--radix-select-trigger-width)]',
              position === 'popper' &&
                !isSearchEnabled &&
                'h-[var(--radix-select-trigger-height)]',
            )}
          >
            <SelectSearchContext.Provider value={searchContextValue}>
              {children}
              {hasActiveQuery && matchedCount === 0 && (
                <div
                  role="status"
                  data-slot="select-search-empty"
                  className="px-3 py-6 text-center text-xs text-text-muted"
                >
                  {emptySearchText}
                </div>
              )}
            </SelectSearchContext.Provider>
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  },
);
SelectContent.displayName = SelectPrimitive.Content.displayName;
