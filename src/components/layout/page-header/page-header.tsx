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
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {breadcrumbs && (
        <div className="text-text-muted text-caption">{breadcrumbs}</div>
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          {badge && (
            <div>
              {typeof badge === 'string' ? (
                <Badge variant="default">{badge}</Badge>
              ) : (
                badge
              )}
            </div>
          )}
          <h1 className="font-heading text-display-sm sm:text-display text-text">
            {title}
          </h1>
          {description && (
            <p className="text-body-sm text-text-muted max-w-prose">
              {description}
            </p>
          )}
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
