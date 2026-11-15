'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { Progress } from '@/components/core/progress';
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
  const tone: StatusTone = health.status;
  const label =
    health.status === 'overdue'
      ? 'Gecikti'
      : health.status === 'due_soon'
        ? health.daysRemaining !== null
          ? `${health.daysRemaining} gün kaldı`
          : 'Yaklaşıyor'
        : health.daysRemaining !== null
          ? `${health.daysRemaining} gün`
          : 'İyi Durumda';

  const barColor =
    health.status === 'overdue'
      ? 'bg-red-500'
      : health.status === 'due_soon'
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
            {part.name}
          </h3>
          <StatusPill tone={tone} label={label} />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs tabular-nums">
            <span className="font-medium">
              Kalan Ömür: %{health.remainingPercent}
            </span>
            {part.lifespan.usageLimit ? (
              <span className="text-muted-foreground">
                {part.usageCurrent ?? 0} / {part.lifespan.usageLimit}{' '}
                {part.lifespan.usageUnit ?? 'birim'}
              </span>
            ) : part.lifespan.days ? (
              <span className="text-muted-foreground">
                {part.lifespan.days} gün döngü
              </span>
            ) : null}
          </div>
          <Progress
            value={health.remainingPercent}
            indicatorClassName={barColor}
          />
        </div>

        <div className="flex items-center gap-2 truncate text-xs text-muted-foreground">
          <span className="h-2 w-2 shrink-0 rounded-full bg-umay-blue" />
          <span className="truncate">
            {parentItem?.name ?? 'Bağımsız parça'} •{' '}
            {spareItem
              ? `Yedek stok: ${spareItem.quantity} ${spareItem.unit}`
              : 'Yedek bağlı değil'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            size="sm"
            onClick={() => onReplaceClick(part)}
            className="min-h-[44px] md:min-h-0"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Değiştirildi
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/parts/${part.id}`}>Geçmiş</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
