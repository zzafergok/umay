'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardTitle } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { LifecycleProgressBar } from '@/components/core/progress';
import { StatusPill, type StatusTone } from '@/components/core/status-pill';
import type { Item, Part } from '@/features/inventory/types';
import { computePartHealth } from '@/lib/lifecycle';

interface PartCardProps {
  part: Part;
  parentItem?: Item;
  spareItem?: Item;
  onReplaceClick: (part: Part) => void;
}

export function PartCard({
  part,
  parentItem,
  spareItem,
  onReplaceClick,
}: PartCardProps) {
  const health = computePartHealth(part);
  const pill: { tone: StatusTone; label: string } | null =
    health.status === 'overdue'
      ? { tone: 'overdue', label: 'Gecikti' }
      : health.status === 'due_soon'
        ? {
            tone: 'due_soon',
            label:
              health.daysRemaining !== null
                ? `${health.daysRemaining} gün kaldı`
                : 'Yaklaşıyor',
          }
        : null;

  const metaLabel = part.lifespan.usageLimit
    ? `${part.usageCurrent ?? 0} / ${part.lifespan.usageLimit} ${
        part.lifespan.usageUnit ?? 'birim'
      }`
    : part.lifespan.days
      ? `${part.lifespan.days} gün döngü`
      : undefined;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">{part.name}</CardTitle>
          {pill ? <StatusPill tone={pill.tone} label={pill.label} /> : null}
        </div>

        <LifecycleProgressBar
          remainingPercent={health.remainingPercent}
          daysRemaining={health.daysRemaining}
          status={health.status}
          metaLabel={metaLabel}
        />

        <div className="text-text-muted flex items-center gap-2 truncate text-caption">
          <span
            className="bg-cat-7 h-2 w-2 shrink-0 rounded-full"
            aria-hidden="true"
          />
          <span className="truncate">
            {parentItem?.name ?? 'Bağımsız parça'} ·{' '}
            {spareItem
              ? `Yedek stok: ${spareItem.quantity} ${spareItem.unit}`
              : 'Yedek bağlı değil'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onReplaceClick(part)}
            className="min-h-[44px] md:min-h-0"
          >
            <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Değiştirildi
          </Button>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="min-h-[44px] md:min-h-0"
          >
            <Link href={`/parts/${part.id}`}>Geçmiş</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
