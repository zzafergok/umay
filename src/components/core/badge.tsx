'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-sm border font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg select-none [&_svg]:pointer-events-none [&_svg]:size-3.5 shrink-0 [&>[data-icon=inline-start]]:-ml-0.5 [&>[data-icon=inline-start]]:mr-1.5 [&>[data-icon=inline-end]]:-mr-0.5 [&>[data-icon=inline-end]]:ml-1.5',
  {
    variants: {
      variant: {
        default: 'border-accent/20 bg-accent-subtle text-accent',
        secondary: 'border-border bg-surface-sunken text-text-muted',
        destructive: 'border-danger/25 bg-danger-subtle text-danger',
        warning: 'border-warning/25 bg-warning-subtle text-warning',
        success: 'border-success/25 bg-success-subtle text-success',
        outline: 'border-border bg-transparent text-text',
        ghost: 'border-transparent bg-transparent text-text hover:bg-surface-sunken',
        link: 'border-transparent text-accent underline-offset-4 hover:underline p-0 h-auto',
        none: 'border-transparent bg-transparent',
      },
      size: {
        default: 'px-2 py-0.5 text-caption',
        sm: 'px-1.5 py-0.5 text-caption',
        lg: 'px-2.5 py-1 text-body-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  textColor?: string;
  borderColor?: string;
  backgroundColor?: string;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      textColor,
      borderColor,
      backgroundColor,
      style,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'span';

    const customStyle: React.CSSProperties = {
      ...(backgroundColor && { backgroundColor }),
      ...(textColor && { color: textColor }),
      ...(borderColor && {
        borderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
      }),
      ...style,
    };

    return (
      <Comp
        ref={ref}
        data-slot="badge"
        className={cn(badgeVariants({ variant, size }), className)}
        style={customStyle}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';
