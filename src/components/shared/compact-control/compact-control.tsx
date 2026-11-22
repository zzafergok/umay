'use client';

import * as React from 'react';

import { Button } from '@/components/core/button';
import { cn } from '@/lib/utils';

import type { CompactControlProps } from './types';

/**
 * A compact, bordered action control for toolbars and header utilities.
 * It keeps the full Button API for icons, labels, pending states, menus, and
 * future interaction patterns without requiring layout-specific wrappers.
 */
export const CompactControl = React.forwardRef<
  HTMLButtonElement,
  CompactControlProps
>(({ className, variant = 'ghost', ...props }, ref) => (
  <Button
    ref={ref}
    variant={variant}
    size="icon-sm"
    className={cn(
      'relative inline-flex h-10 min-w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-surface px-2.5 text-text-muted transition-colors hover:border-border-strong hover:bg-surface-sunken hover:text-text md:h-9 md:min-w-9',
      className,
    )}
    data-slot="compact-control"
    {...props}
  />
));

CompactControl.displayName = 'CompactControl';
