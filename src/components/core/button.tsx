'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-body-sm font-medium transition-colors duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&>[data-icon=inline-start]]:-ml-0.5 [&>[data-icon=inline-start]]:mr-1.5 [&>[data-icon=inline-end]]:-mr-0.5 [&>[data-icon=inline-end]]:ml-1.5',
  {
    variants: {
      variant: {
        default: 'bg-accent text-on-accent hover:bg-accent-hover',
        primary: 'bg-accent text-on-accent hover:bg-accent-hover',
        destructive:
          'bg-danger text-on-accent hover:bg-danger/90 focus-visible:ring-danger',
        danger:
          'bg-danger text-on-accent hover:bg-danger/90 focus-visible:ring-danger',
        outline:
          'border border-border bg-surface text-text hover:bg-surface-sunken hover:border-border-strong',
        secondary:
          'border border-border bg-surface text-text hover:bg-surface-sunken hover:border-border-strong',
        ghost: 'text-text hover:bg-surface-sunken',
        link: 'text-accent underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-11 min-h-[44px] px-4 py-2 text-body-sm',
        xs: 'h-8 rounded-sm px-2.5 text-caption [&_svg]:size-3.5',
        sm: 'h-9 rounded-md px-3 text-body-sm [&_svg]:size-4',
        lg: 'h-11 min-h-[44px] rounded-md px-6 text-body [&_svg]:size-5',
        icon: 'size-11 min-h-[44px] min-w-[44px] [&_svg]:size-5',
        'icon-xs': 'size-8 [&_svg]:size-4',
        'icon-sm': 'size-9 [&_svg]:size-4',
        'icon-lg': 'size-11 min-h-[44px] min-w-[44px] [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
