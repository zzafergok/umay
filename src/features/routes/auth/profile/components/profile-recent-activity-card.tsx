'use client';

import { Activity, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import { Link } from '@/components/core/link';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import type { AuthProfileCopy, ProfileRecentMovement } from '../types';

interface ProfileRecentActivityCardProps {
  movements: ProfileRecentMovement[];
  copy: AuthProfileCopy['recentActivity'];
}

function formatActivityDate(iso: string, locale: string): string {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return iso;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(parsed));
}

export function ProfileRecentActivityCard({
  movements,
  copy,
}: ProfileRecentActivityCardProps) {
  const locale = useCurrentLocale();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" aria-hidden="true" />
            <CardTitle>{copy.title}</CardTitle>
          </div>
          <CardDescription>{copy.description}</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link href="/activity">
            <span>{copy.viewAllLabel}</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <Empty className="border-border py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Activity className="h-4 w-4" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
              <EmptyDescription>{copy.emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="divide-y divide-border rounded-md border border-border">
            {movements.map((movement) => {
              const deltaText =
                movement.delta > 0
                  ? `+${movement.delta}`
                  : String(movement.delta);
              const badgeVariant =
                movement.delta > 0
                  ? 'success'
                  : movement.delta < 0
                    ? 'warning'
                    : 'secondary';

              return (
                <div
                  key={movement.id}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-body-sm font-medium text-text">
                      {movement.itemName || copy.fallbackItemName}
                    </p>
                    <p className="truncate text-caption text-text-muted">
                      {copy.movementTypes[movement.type]}
                      {movement.reason ? ` · ${movement.reason}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <Badge variant={badgeVariant} className="tabular-nums">
                      {deltaText}
                    </Badge>
                    <span className="text-caption tabular-nums text-text-subtle">
                      {formatActivityDate(movement.at, locale)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
