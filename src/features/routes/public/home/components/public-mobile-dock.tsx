'use client';

import { Home, Layers, LayoutGrid, PlaySquare } from 'lucide-react';
import { Link } from '@/components/core/link';
import {
  getPublicMobileTabHref,
  isPlainTabLinkClick,
} from '@/features/routes/public/home/mobile-tab-routing';
import type {
  PublicHomeCopy,
  PublicMobileTabKey,
} from '@/features/routes/public/home/types';
import { cn } from '@/lib/utils';

export type { PublicMobileTabKey };

interface PublicMobileDockProps {
  activeTab: PublicMobileTabKey;
  mobileShell: PublicHomeCopy['mobileShell'];
  onSelectTab: (tab: PublicMobileTabKey) => void;
}

const TAB_ITEMS: Array<{
  key: PublicMobileTabKey;
  icon: typeof Home;
}> = [
  { key: 'start', icon: Home },
  { key: 'preview', icon: PlaySquare },
  { key: 'features', icon: Layers },
  { key: 'screens', icon: LayoutGrid },
];

export function PublicMobileDock({
  activeTab,
  mobileShell,
  onSelectTab,
}: PublicMobileDockProps) {
  return (
    <div
      data-slot="public-mobile-dock"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <nav
        aria-label={mobileShell.navAriaLabel}
        className="bg-surface/75 dark:bg-surface-raised/75 border-border-strong/70 pointer-events-auto mx-auto max-w-md rounded-[26px] border p-1.5 shadow-[0_10px_32px_-8px_rgb(var(--text)/0.16),inset_0_1px_0_rgb(255_255_255/0.65)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:shadow-[0_12px_32px_-8px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.12)]"
      >
        <div className="grid grid-cols-4 items-stretch gap-1">
          {TAB_ITEMS.map(({ key, icon: Icon }) => {
            const isActive = activeTab === key;
            const label = mobileShell.tabs[key];

            return (
              <Link
                key={key}
                href={getPublicMobileTabHref(key)}
                prefetch={false}
                variant="ghost"
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => {
                  if (!isPlainTabLinkClick(event)) return;
                  event.preventDefault();
                  onSelectTab(key);
                }}
                className={cn(
                  'h-[52px] w-full flex-col gap-0.5 rounded-[20px] px-1.5 py-1 text-[11px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent/14 hover:bg-accent/18 text-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.55)] dark:bg-accent/20 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]'
                    : 'text-text-muted hover:text-text hover:bg-surface-sunken/50',
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                <span className="max-w-[74px] truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
