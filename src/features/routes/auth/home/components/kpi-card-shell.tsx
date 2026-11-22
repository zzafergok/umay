'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/core/card';
import { Link } from '@/components/core/link';
import { Progress } from '@/components/core/progress';
import { cn } from '@/lib/utils';

export interface KpiCardMetric {
  label: string;
  value: string | number;
  toneClass?: string;
}

export interface KpiCardShellProps {
  title: string;
  icon: React.ReactNode;
  badgeText: string;
  badgeVariant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
  primaryValue: string | number;
  primaryUnit?: string;
  subtitle: string;
  progressValue: number;
  progressIndicatorClass?: string;
  metrics: KpiCardMetric[];
  href: string;
  hrefLabel: string;
}

export function KpiCardShell({
  title,
  icon,
  badgeText,
  badgeVariant,
  primaryValue,
  primaryUnit,
  subtitle,
  progressValue,
  progressIndicatorClass,
  metrics,
  href,
  hrefLabel,
}: KpiCardShellProps) {
  return (
    <Card size="sm" className="justify-between">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-caption font-medium text-text-muted">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-sunken text-text"
              aria-hidden="true"
            >
              {icon}
            </span>
            {title}
          </span>
          <Badge variant={badgeVariant} size="sm">
            {badgeText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-metric tabular-nums text-text">
              {primaryValue}
            </span>
            {primaryUnit ? (
              <span className="text-caption text-text-muted">
                {primaryUnit}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-caption text-text-muted">
            {subtitle}
          </p>
        </div>

        <Progress
          value={Math.max(0, Math.min(100, progressValue))}
          indicatorClassName={progressIndicatorClass}
          className="h-1.5"
        />

        <div className="grid grid-cols-3 gap-2 border-t border-border/70 pt-2.5">
          {metrics.map((m) => (
            <div key={m.label} className="min-w-0">
              <p className="truncate text-[11px] text-text-subtle">{m.label}</p>
              <p
                className={cn(
                  'truncate font-mono text-caption font-semibold tabular-nums text-text',
                  m.toneClass,
                )}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/60 pb-3 pt-2.5">
        <Link
          href={href}
          className="inline-flex w-full items-center justify-between text-caption font-medium text-text-muted transition-colors hover:text-accent"
        >
          <span>{hrefLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
