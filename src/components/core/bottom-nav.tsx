'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/components/core/link';
import { cn } from '@/lib/utils';

export interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: boolean;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  ariaLabel?: string;
  className?: string;
}

/**
 * Mobile-only bottom navigation bar with >= 44px touch targets.
 */
export function BottomNav({
  items,
  ariaLabel = 'Ana gezinme',
  className,
}: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={ariaLabel}
      data-slot="bottom-nav"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85 md:hidden',
        className,
      )}
    >
      <ul className="grid h-16 grid-cols-5 items-center">
        {items.map((item) => {
          const isActive = item.matchPrefix
            ? pathname === item.href || pathname.startsWith(`${item.href}/`)
            : pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex justify-center">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-sm px-2 py-1 text-[11px] font-medium transition-colors duration-150',
                  isActive
                    ? 'text-umay-blue'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="truncate max-w-[60px]">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
