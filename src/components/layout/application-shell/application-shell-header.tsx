'use client';

import * as React from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Badge } from '@/components/core/badge';
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
import { SHELL_TOPBAR_HEIGHT_CLASS } from './types';

interface ApplicationShellHeaderProps {
  trail: BreadcrumbTrailItem[];
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  collapsed: boolean;
  headerActions?: React.ReactNode;
  pageHeaderActions?: React.ReactNode;
  onOpenMobile: () => void;
  onToggleCollapsed: () => void;
}

export function ApplicationShellHeader({
  trail,
  subtitle,
  badge,
  collapsed,
  headerActions,
  pageHeaderActions,
  onOpenMobile,
  onToggleCollapsed,
}: ApplicationShellHeaderProps) {
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

        {trail.length > 0 || subtitle ? (
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            {trail.length > 0 ? (
              <div className="flex min-w-0 items-center gap-2">
                <Breadcrumb className="min-w-0">
                  <BreadcrumbList className="flex-nowrap gap-1 text-xs sm:gap-1.5 sm:text-sm">
                    {trail.map((item, idx) => {
                      const isLast = idx === trail.length - 1;
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
                {badge ? (
                  typeof badge === 'string' ? (
                    <Badge
                      variant="outline"
                      className="hidden shrink-0 text-[11px] font-normal sm:inline-flex"
                    >
                      {badge}
                    </Badge>
                  ) : (
                    <div className="hidden shrink-0 sm:inline-flex">
                      {badge}
                    </div>
                  )
                ) : null}
              </div>
            ) : null}
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-text-muted">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {(pageHeaderActions || headerActions) && (
        <div className="flex shrink-0 items-center gap-2 text-body-sm">
          {pageHeaderActions}
          {headerActions}
        </div>
      )}
    </header>
  );
}
