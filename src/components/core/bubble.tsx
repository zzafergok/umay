'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export type BubbleVariant =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'tinted'
  | 'outline'
  | 'ghost'
  | 'destructive';

export type BubbleAlign = 'start' | 'end';

interface BubbleContextValue {
  variant: BubbleVariant;
  align: BubbleAlign;
}

const BubbleContext = React.createContext<BubbleContextValue>({
  variant: 'default',
  align: 'start',
});

function useBubbleContext() {
  return React.useContext(BubbleContext);
}

export const bubbleContentVariants = cva(
  'relative inline-block break-words leading-relaxed text-body-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
  {
    variants: {
      variant: {
        default: 'bg-accent text-on-accent rounded-md px-3.5 py-2',
        secondary:
          'bg-surface border border-border text-text rounded-md px-3.5 py-2',
        muted:
          'bg-surface-sunken border border-border text-text-muted rounded-md px-3.5 py-2',
        tinted:
          'bg-accent-subtle border border-accent/25 text-accent rounded-md px-3.5 py-2',
        outline:
          'bg-transparent border border-border-strong text-text rounded-md px-3.5 py-2',
        ghost: 'bg-transparent text-text px-0 py-1',
        destructive:
          'bg-danger-subtle border border-danger/30 text-danger rounded-md px-3.5 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BubbleVariant;
  align?: BubbleAlign;
}

export const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(
  (
    { className, variant = 'default', align = 'start', children, ...props },
    ref,
  ) => (
    <BubbleContext.Provider value={{ variant, align }}>
      <div
        ref={ref}
        data-slot="bubble"
        data-variant={variant}
        data-align={align}
        className={cn(
          'relative flex flex-col',
          variant === 'ghost' ? 'w-full' : 'max-w-[80%]',
          align === 'start' ? 'mr-auto items-start' : 'ml-auto items-end',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </BubbleContext.Provider>
  ),
);
Bubble.displayName = 'Bubble';

export interface BubbleContentProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bubbleContentVariants> {
  asChild?: boolean;
}

export const BubbleContent = React.forwardRef<
  HTMLDivElement,
  BubbleContentProps
>(({ className, asChild = false, variant: propVariant, ...props }, ref) => {
  const { variant: contextVariant } = useBubbleContext();
  const variant = propVariant ?? contextVariant;
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      ref={ref}
      data-slot="bubble-content"
      className={cn(bubbleContentVariants({ variant }), className)}
      {...props}
    />
  );
});
BubbleContent.displayName = 'BubbleContent';

export interface BubbleReactionsProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom';
  align?: 'start' | 'end';
}

export const BubbleReactions = React.forwardRef<
  HTMLDivElement,
  BubbleReactionsProps
>(({ className, side = 'bottom', align = 'end', ...props }, ref) => (
  <div
    ref={ref}
    data-slot="bubble-reactions"
    data-side={side}
    data-align={align}
    className={cn(
      'absolute z-10 inline-flex select-none items-center gap-1 rounded-full border border-gunmetal/40 bg-obsidian px-1.5 py-0.5 text-xs text-ash shadow-md',
      side === 'bottom' ? '-bottom-2.5' : '-top-2.5',
      align === 'end'
        ? 'right-2 rtl:left-2 rtl:right-auto'
        : 'left-2 rtl:left-auto rtl:right-2',
      className,
    )}
    {...props}
  />
));
BubbleReactions.displayName = 'BubbleReactions';

export interface BubbleGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const BubbleGroup = React.forwardRef<HTMLDivElement, BubbleGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="bubble-group"
      className={cn('flex w-full flex-col gap-1.5', className)}
      {...props}
    />
  ),
);
BubbleGroup.displayName = 'BubbleGroup';
