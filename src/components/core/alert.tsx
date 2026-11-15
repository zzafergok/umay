'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const alertVariants = cva(
  'relative w-full rounded-md border px-4 py-3 text-body-sm transition-colors [&>svg]:size-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3.5 [&>svg]:text-current [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-2px] has-[[data-slot=alert-action]]:pr-28 rtl:[&>svg]:left-auto rtl:[&>svg]:right-4 rtl:[&>svg~*]:pl-0 rtl:[&>svg~*]:pr-7 rtl:has-[[data-slot=alert-action]]:pr-4 rtl:has-[[data-slot=alert-action]]:pl-28',
  {
    variants: {
      variant: {
        default: 'bg-surface text-text border-border [&>svg]:text-accent',
        destructive:
          'bg-danger-subtle border-danger/30 text-danger [&>svg]:text-danger *:[[data-slot=alert-description]]:text-danger/90',
        warning:
          'bg-warning-subtle border-warning/30 text-warning [&>svg]:text-warning *:[[data-slot=alert-description]]:text-warning/90',
        info: 'bg-accent-subtle border-accent/30 text-accent [&>svg]:text-accent *:[[data-slot=alert-description]]:text-accent/90',
        success:
          'bg-success-subtle border-success/30 text-success [&>svg]:text-success *:[[data-slot=alert-description]]:text-success/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  ),
);
Alert.displayName = 'Alert';

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      data-slot="alert-title"
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = 'AlertTitle';

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-description"
    className={cn('text-sm text-ash [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export interface AlertActionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertAction = React.forwardRef<HTMLDivElement, AlertActionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-action"
      className={cn(
        'absolute right-3 top-3 sm:right-4 sm:top-3.5 rtl:left-3 rtl:right-auto sm:rtl:left-4',
        className,
      )}
      {...props}
    />
  ),
);
AlertAction.displayName = 'AlertAction';
