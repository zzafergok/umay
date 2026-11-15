'use client';

import * as React from 'react';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { StatusPill, type StatusTone } from '@/components/core/status-pill';
import type { Category, Item, Location } from '@/features/inventory/types';
import { resolveCategoryCssVar } from '@/lib/design/tokens';

function getItemExceptionPill(
  item: Item,
  nowMs: number,
): { tone: StatusTone; label: string } | null {
  if (item.quantity <= 0) {
    return { tone: 'out_of_stock', label: 'Tükendi' };
  }
  if (item.minQuantity > 0 && item.quantity <= item.minQuantity) {
    return { tone: 'low_stock', label: 'Düşük stok' };
  }
  if (item.status === 'in_repair') {
    return { tone: 'in_repair', label: 'Tamirde' };
  }
  if (item.status === 'lent') {
    return { tone: 'lent', label: 'Ödünç' };
  }
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const expMs = item.expiresAt ? Date.parse(item.expiresAt) : NaN;
  if (!Number.isNaN(expMs)) {
    if (expMs < nowMs) {
      return { tone: 'overdue', label: 'SKT geçti' };
    }
    if (expMs - nowMs <= thirtyDaysMs) {
      return { tone: 'due_soon', label: 'SKT yaklaşıyor' };
    }
  }
  return null;
}

interface ItemCardProps {
  item: Item;
  category?: Category;
  location?: Location;
  onConsume: (item: Item) => void;
  isBusy?: boolean;
}

export function ItemCard({
  item,
  category,
  location,
  onConsume,
  isBusy = false,
}: ItemCardProps) {
  const [nowMs] = React.useState(() => Date.now());
  const pill = getItemExceptionPill(item, nowMs);
  const locationText = location ? location.path.join(' > ') : 'Konum yok';
  const dotColor = resolveCategoryCssVar(category?.name);

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-title text-text line-clamp-1">
            {item.name}
          </h3>
          {pill ? <StatusPill tone={pill.tone} label={pill.label} /> : null}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="font-heading text-metric text-text tabular-nums">
            {item.quantity}{' '}
            <span className="text-body-sm text-text-muted font-sans font-normal">
              {item.unit}
            </span>
          </span>
          {item.minQuantity > 0 ? (
            <span className="text-text-muted text-caption tabular-nums">
              Eşik: {item.minQuantity} {item.unit}
            </span>
          ) : null}
        </div>

        <div className="text-text-muted flex items-center gap-2 truncate text-caption">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
          <span className="truncate">
            {locationText} · {category?.name ?? 'Genel'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            size="sm"
            variant="secondary"
            disabled={isBusy || item.quantity <= 0}
            onClick={() => onConsume(item)}
            className="min-h-[44px] md:min-h-0"
          >
            Tüket (-1)
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/items/${item.id}`}>Detay</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
