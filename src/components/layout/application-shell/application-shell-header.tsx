'use client';

import * as React from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/core/breadcrumb';
import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';
import { cn } from '@/lib/utils';
import type { BreadcrumbTrailItem } from './page-header-context';
import {
  SHELL_TOPBAR_HEIGHT_CLASS,
  type ApplicationShellNavItem,
} from './types';

interface ApplicationShellHeaderProps {
  active?: ApplicationShellNavItem;
  pathname: string;
  trail?: BreadcrumbTrailItem[];
  collapsed: boolean;
  headerActions?: React.ReactNode;
  onOpenMobile: () => void;
  onToggleCollapsed: () => void;
}

export function ApplicationShellHeader({
  active,
  pathname,
  trail,
  collapsed,
  headerActions,
  onOpenMobile,
  onToggleCollapsed,
}: ApplicationShellHeaderProps) {
  const items: BreadcrumbTrailItem[] = React.useMemo(() => {
    if (trail && trail.length > 0) return trail;
    if (!active) return [];
    const isNested =
      !active.exact &&
      pathname !== active.href &&
      pathname.startsWith(`${active.href}/`);
    if (isNested) {
      return [{ label: active.label, href: active.href }, { label: 'Detay' }];
    }
    return [{ label: active.label }];
  }, [trail, active, pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex shrink-0 items-center justify-between gap-2 border-b border-border bg-surface/85 px-3 backdrop-blur-xl dark:bg-surface/80 sm:px-6 lg:px-8',
        SHELL_TOPBAR_HEIGHT_CLASS,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Button
          onClick={onOpenMobile}
          variant="secondary"
          size="icon-sm"
          aria-label="Menüyü aç"
          className="shrink-0 md:hidden"
        >
          <Menu className="h-4 w-4" />
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

        {items.length > 0 ? (
          <Breadcrumb className="min-w-0 flex-1">
            <BreadcrumbList className="flex-nowrap gap-1 text-xs sm:gap-1.5 sm:text-sm">
              {items.map((item, idx) => {
                const isLast = idx === items.length - 1;
                return (
                  <React.Fragment key={`${item.label}-${idx}`}>
                    {idx > 0 ? (
                      <BreadcrumbSeparator className="shrink-0" />
                    ) : null}
                    <BreadcrumbItem className="min-w-0">
                      {!isLast && item.href ? (
                        <BreadcrumbLink
                          asChild
                          className="truncate text-text-muted hover:text-text"
                        >
                          <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="truncate font-heading font-semibold text-text">
                          {item.label}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
      </div>

      {headerActions && (
        <div className="flex shrink-0 items-center gap-2 text-body-sm">
          {headerActions}
        </div>
      )}
    </header>
  );
}
