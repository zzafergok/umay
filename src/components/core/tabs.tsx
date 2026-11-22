'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

export const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, orientation = 'horizontal', ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    data-slot="tabs"
    data-orientation={orientation}
    orientation={orientation}
    className={cn(
      'group/tabs flex min-w-0 max-w-full flex-col gap-2 data-[orientation=vertical]:flex-row',
      className,
    )}
    {...props}
  />
));
Tabs.displayName = TabsPrimitive.Root.displayName;

export interface TabsListProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
> {
  variant?: 'default' | 'line';
}

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = 'default', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-slot="tabs-list"
    data-variant={variant}
    className={cn(
      'group/tabs-list inline-flex h-10 w-fit min-w-0 max-w-full items-center justify-center rounded-md border border-border bg-surface-sunken p-1 text-text-muted group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col',
      variant === 'line' &&
        'gap-1 rounded-md border-0 border-b border-border bg-transparent p-0 group-data-[orientation=vertical]/tabs:border-b-0 group-data-[orientation=vertical]/tabs:border-r group-data-[orientation=vertical]/tabs:border-border',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-slot="tabs-trigger"
    className={cn(
      'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1.5 text-body-sm font-medium text-text-muted outline-none transition-all',
      'hover:text-text focus-visible:outline-none',
      'disabled:pointer-events-none disabled:opacity-50',
      '[&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
      'group-data-[variant=default]/tabs-list:data-[state=active]:bg-surface group-data-[variant=default]/tabs-list:data-[state=active]:text-text',
      'group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:rounded-l-sm group-data-[variant=line]/tabs-list:rounded-t-sm group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:border-b-0 group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:border-r-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:px-2.5 group-data-[variant=line]/tabs-list:py-1.5 group-data-[variant=line]/tabs-list:data-[state=active]:border-accent group-data-[variant=line]/tabs-list:data-[state=active]:text-text',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-slot="tabs-content"
    className={cn(
      'flex-1 text-body-sm text-text outline-none focus-visible:outline-none',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
