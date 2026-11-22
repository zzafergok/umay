import React from 'react';
import { Badge } from '@/components/core/badge';
import { cn } from '@/lib/utils';
import type { PageHeaderProps } from './types';

export function PageHeader({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  hideMobileTitle = false,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'border-b border-border/70 bg-surface/45 px-3 py-2.5 sm:px-6 lg:px-8',
        className,
      )}
    >
      {breadcrumbs && (
        <div className="mb-1 text-caption text-text-muted">{breadcrumbs}</div>
      )}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              className={cn(
                'truncate font-heading text-base font-semibold tracking-tight text-text sm:text-lg',
                hideMobileTitle && 'sr-only md:not-sr-only',
              )}
            >
              {title}
            </h1>
            {badge ? (
              typeof badge === 'string' ? (
                <Badge variant="outline" className="text-[11px] font-normal">
                  {badge}
                </Badge>
              ) : (
                badge
              )
            ) : null}
          </div>
          {description ? (
            <p className="mt-0.5 truncate text-xs text-text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
