'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';
import { cn } from '@/lib/utils';

export interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: boolean;
  onClick?: () => void;
  active?: boolean;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  ariaLabel?: string;
  className?: string;
}

/**
 * Mobile-only floating frosted-glass bottom navigation dock with safe-area support.
 */
export function BottomNav({
  items,
  ariaLabel = 'Ana gezinme',
  className,
}: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div
      data-slot="bottom-nav"
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden',
        className,
      )}
    >
      <nav
        aria-label={ariaLabel}
        className="pointer-events-auto mx-auto max-w-md rounded-[26px] border border-border-strong/70 bg-surface/75 p-1.5 shadow-[0_10px_32px_-8px_rgb(var(--text)/0.16),inset_0_1px_0_rgb(255_255_255/0.65)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-surface-raised/75 dark:shadow-[0_12px_32px_-8px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.12)]"
      >
        <ul className="grid grid-cols-5 items-stretch gap-1">
          {items.map((item) => {
            const isActive =
              item.active ??
              (item.matchPrefix
                ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                : pathname === item.href);
            const Icon = item.icon;
            const itemClasses = cn(
              'flex h-auto min-h-[54px] w-full flex-col items-center justify-center gap-1 rounded-[20px] px-1 py-1.5 text-[11px] leading-[1.25] font-medium transition-all duration-200 focus-visible:outline-none',
              isActive
                ? 'bg-accent/14 text-accent dark:bg-accent/20 shadow-[inset_0_1px_0_rgb(255_255_255/0.55)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]'
                : 'text-text-muted hover:text-text',
            );

            return (
              <li key={item.href} className="flex min-w-0">
                {item.onClick ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={item.onClick}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(itemClasses, 'hover:bg-surface-sunken/50')}
                  >
                    <Icon
                      className="h-[18px] w-[18px] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="block w-full truncate text-center leading-[1.3]">
                      {item.label}
                    </span>
                  </Button>
                ) : (
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={itemClasses}
                  >
                    <Icon
                      className="h-[18px] w-[18px] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="block w-full truncate text-center leading-[1.3]">
                      {item.label}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
