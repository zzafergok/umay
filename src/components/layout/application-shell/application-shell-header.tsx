'use client';

import { type ReactNode } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/core/button';
import { cn } from '@/lib/utils';
import {
  SHELL_TOPBAR_HEIGHT_CLASS,
  type ApplicationShellNavItem,
} from './types';

interface ApplicationShellHeaderProps {
  active?: ApplicationShellNavItem;
  collapsed: boolean;
  headerActions?: ReactNode;
  onOpenMobile: () => void;
  onToggleCollapsed: () => void;
}

export function ApplicationShellHeader({
  active,
  collapsed,
  headerActions,
  onOpenMobile,
  onToggleCollapsed,
}: ApplicationShellHeaderProps) {
  return (
    <header
      className={cn(
        'bg-surface sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-6 lg:px-8',
        SHELL_TOPBAR_HEIGHT_CLASS,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          onClick={onOpenMobile}
          variant="secondary"
          size="icon"
          aria-label="Menüyü aç"
          className="shrink-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          onClick={onToggleCollapsed}
          variant="secondary"
          size="icon-sm"
          aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          className="hidden shrink-0 md:inline-flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-heading text-body-sm text-text truncate font-semibold">
            {active?.label}
          </span>
        </div>
      </div>
      {headerActions && (
        <div className="text-body-sm flex shrink-0 items-center gap-2">
          {headerActions}
        </div>
      )}
    </header>
  );
}
