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
        default:
          'h-10 min-h-[40px] px-3.5 py-1.5 text-body-sm md:h-9 md:min-h-[36px]',
        xs: 'h-7 rounded-sm px-2 text-caption md:h-6 [&_svg]:size-3.5',
        sm: 'h-9 rounded-md px-3 text-xs md:h-8 [&_svg]:size-3.5',
        lg: 'h-10 min-h-[40px] rounded-md px-5 text-body-sm [&_svg]:size-4',
        icon: 'size-10 min-h-[40px] min-w-[40px] md:size-9 md:min-h-[36px] md:min-w-[36px] [&_svg]:size-4',
        'icon-xs': 'size-7 [&_svg]:size-3.5',
        'icon-sm': 'size-8 [&_svg]:size-4',
        'icon-lg': 'size-10 min-h-[40px] min-w-[40px] [&_svg]:size-4',
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
