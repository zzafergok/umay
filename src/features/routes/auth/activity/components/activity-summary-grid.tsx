'use client';

import * as React from 'react';
import { Activity, ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Card, CardContent, CardHeader } from '@/components/core/card';
import { Progress } from '@/components/core/progress';
import { cn } from '@/lib/utils';
import { formatActivityDelta, formatActivityNumber } from '../activity-utils';
import type { ActivitySummary } from '../types';

interface SummaryItem {
  title: string;
  icon: React.ReactNode;
  badgeText: string;
  badgeVariant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
  value: string | number;
  unit: string;
  subtitle: string;
  progress: number;
  progressClass?: string;
}

export function ActivitySummaryGrid({ summary }: { summary: ActivitySummary }) {
  const totalMovements = Math.max(1, summary.totalCount);
  const inflowRatio = Math.round((summary.inflowCount / totalMovements) * 100);
  const outflowRatio = Math.round(
    (summary.outflowCount / totalMovements) * 100,
  );
  const recentRatio = Math.round((summary.last24hCount / totalMovements) * 100);

  const cards: SummaryItem[] = [
    {
      title: 'Toplam Hareket',
      icon: <Activity className="h-4 w-4" />,
      badgeText: `${summary.uniqueItemsCount} ürün`,
      badgeVariant: 'default',
      value: summary.totalCount,
      unit: 'kayıt',
      subtitle: `Net değişim: ${formatActivityDelta(summary.netUnits)} birim`,
      progress: 100,
      progressClass: 'bg-accent',
    },
    {
      title: 'Stok Girişi',
      icon: <ArrowDownLeft className="h-4 w-4" />,
      badgeText: `%${inflowRatio}`,
      badgeVariant: 'success',
      value: summary.inflowCount,
      unit: 'işlem',
      subtitle: `Toplam +${formatActivityNumber(summary.inflowUnits)} birim eklendi`,
      progress: inflowRatio,
      progressClass: 'bg-success',
    },
    {
      title: 'Çıkış & Tüketim',
      icon: <ArrowUpRight className="h-4 w-4" />,
      badgeText: `%${outflowRatio}`,
      badgeVariant: 'warning',
      value: summary.outflowCount,
      unit: 'işlem',
      subtitle: `Toplam -${formatActivityNumber(summary.outflowUnits)} birim düşüldü`,
      progress: outflowRatio,
      progressClass: 'bg-warning',
    },
    {
      title: 'Son 24 Saat',
      icon: <Clock className="h-4 w-4" />,
      badgeText: `${summary.partReplaceCount} parça`,
      badgeVariant: 'secondary',
      value: summary.last24hCount,
      unit: 'hareket',
      subtitle:
        summary.last24hCount > 0
          ? 'Son 24 saatteki aktif işlemler'
          : 'Son 24 saatte hareket yok',
      progress: recentRatio,
      progressClass: 'bg-accent',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} size="sm" className="justify-between">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-caption font-medium text-text-muted">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-sunken text-text"
                  aria-hidden="true"
                >
                  {card.icon}
                </span>
                {card.title}
              </span>
              <Badge variant={card.badgeVariant} size="sm">
                {card.badgeText}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-2.5">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-metric tabular-nums text-text">
                  {card.value}
                </span>
                <span className="text-caption text-text-muted">
                  {card.unit}
                </span>
              </div>
              <p className="mt-0.5 truncate text-caption text-text-muted">
                {card.subtitle}
              </p>
            </div>

            <Progress
              value={Math.max(0, Math.min(100, card.progress))}
              indicatorClassName={cn(card.progressClass)}
              className="h-1.5"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
