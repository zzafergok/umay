'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SelectItemProps } from './types';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-slot="select-trigger"
    className={cn(
      'bg-surface-sunken text-body-sm text-text flex h-10 min-h-[40px] w-full min-w-0 items-center justify-between gap-2 rounded-md border border-border px-3 py-1.5 outline-none transition-colors duration-150 md:h-9 md:min-h-[36px]',
      'placeholder:text-text-subtle focus-visible:ring-offset-bg focus:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger',
      '[&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left [&>span]:leading-snug',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="text-text-muted size-4 shrink-0" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn(
      'text-text-muted flex cursor-default items-center justify-center py-1',
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
      'text-text-muted flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronDown className="size-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

function getFocusableOutsideTarget(
  target: EventTarget | null,
): HTMLElement | null {
  if (!(target instanceof Element)) return null;

  const focusableTarget = target.closest(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
  );

  return focusableTarget instanceof HTMLElement ? focusableTarget : null;
}

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(
  (
    {
      className,
      children,
      position = 'popper',
      onCloseAutoFocus,
      onPointerDownOutside,
      ...props
    },
    ref,
  ) => {
    const outsidePointerTargetRef = React.useRef<HTMLElement | null>(null);

    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          data-slot="select-content"
          className={cn(
            'dark:border-border-strong bg-surface-raised text-text shadow-float relative z-[10000] max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border p-1 outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            position === 'popper' &&
              'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            className,
          )}
          position={position}
          onPointerDownOutside={(event) => {
            onPointerDownOutside?.(event);
            if (event.defaultPrevented) return;

            outsidePointerTargetRef.current = getFocusableOutsideTarget(
              event.detail.originalEvent.target,
            );
          }}
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event);
            if (event.defaultPrevented) return;

            const outsidePointerTarget = outsidePointerTargetRef.current;
            outsidePointerTargetRef.current = null;
            if (!outsidePointerTarget) return;

            event.preventDefault();
            window.requestAnimationFrame(() => {
              if (outsidePointerTarget.isConnected) {
                outsidePointerTarget.focus({ preventScroll: true });
              }
            });
          }}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            data-slot="select-viewport"
            className={cn(
              'max-w-full overflow-x-hidden p-1',
              position === 'popper' &&
                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  },
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn(
      'text-text-muted py-1.5 pl-8 pr-2 text-caption font-semibold',
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, endAdornment, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(
      'text-body-sm text-text relative flex min-h-[36px] w-full max-w-full cursor-pointer select-none items-center overflow-hidden rounded-sm py-1.5 pl-7 pr-2 outline-none transition-colors duration-150',
      'focus:bg-accent-subtle focus:text-text data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
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
      <span aria-hidden="true" className="ml-auto flex shrink-0 items-center pl-2">
        {endAdornment}
      </span>
    )}
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
