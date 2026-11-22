'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva('bg-surface-sunken', {
  variants: {
    variant: {
      default: 'rounded-md',
      circular: 'rounded-full',
      rectangular: 'rounded-sm',
      text: 'rounded-sm h-4',
    },
    animation: {
      none: '',
      pulse: 'animate-pulse motion-reduce:animate-none',
    },
  },
  defaultVariants: {
    variant: 'default',
    animation: 'none',
  },
});

export interface SkeletonProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: number | string;
  height?: number | string;
  lines?: number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    { className, variant, animation, width, height, lines, style, ...props },
    ref,
  ) => {
    const baseStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    if (variant === 'text' && lines && lines > 1) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              data-slot="skeleton"
              className={cn(skeletonVariants({ variant, animation }))}
              style={{
                ...baseStyle,
                width:
                  index === lines - 1 && lines > 1 ? '75%' : baseStyle.width,
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        data-slot="skeleton"
        className={cn(skeletonVariants({ variant, animation }), className)}
        style={baseStyle}
        {...props}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';

export const SkeletonText = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'variant'> & { lines?: number }
>(({ lines = 1, ...props }, ref) => (
  <Skeleton ref={ref} variant="text" lines={lines} {...props} />
));
SkeletonText.displayName = 'SkeletonText';

export const SkeletonAvatar = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'variant' | 'width' | 'height'> & { size?: number }
>(({ size = 40, className, ...props }, ref) => (
  <Skeleton
    ref={ref}
    variant="circular"
    width={size}
    height={size}
    className={className}
    {...props}
  />
));
SkeletonAvatar.displayName = 'SkeletonAvatar';

export const SkeletonButton = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'variant' | 'width' | 'height'>
>(({ className, ...props }, ref) => (
  <Skeleton
    ref={ref}
    variant="default"
    width={96}
    height={44}
    className={className}
    {...props}
  />
));
SkeletonButton.displayName = 'SkeletonButton';

export const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'variant'>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'space-y-4 rounded-md border border-border bg-surface p-4 md:p-5',
      className,
    )}
    {...props}
  >
    <div className="flex items-center justify-between gap-2">
      <Skeleton variant="text" width="55%" height={20} />
      <Skeleton variant="default" width={68} height={22} />
    </div>
    <Skeleton variant="text" width="38%" height={28} />
    <Skeleton variant="text" width="70%" height={14} />
    {children}
  </div>
));
SkeletonCard.displayName = 'SkeletonCard';
