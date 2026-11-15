'use client';

import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { StatusPill, type StatusTone } from '@/components/core/status-pill';
import type { Category, Item, Location } from '@/features/inventory/types';

function getItemStatusPill(item: Item): { tone: StatusTone; label: string } {
  if (item.quantity <= 0) {
    return { tone: 'out_of_stock', label: 'Tükendi' };
  }
  if (item.minQuantity > 0 && item.quantity <= item.minQuantity) {
    return { tone: 'low_stock', label: 'Düşük Stok' };
  }
  if (item.status === 'in_repair') {
    return { tone: 'in_repair', label: 'Tamirde' };
  }
  if (item.status === 'lent') {
    return { tone: 'lent', label: 'Ödünç' };
  }
  return { tone: 'ok', label: 'Stokta' };
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
  const pill = getItemStatusPill(item);
  const locationText = location ? location.path.join(' > ') : 'Konum yok';

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
            {item.name}
          </h3>
          <StatusPill tone={pill.tone} label={pill.label} />
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {item.quantity}{' '}
            <span className="text-sm font-normal text-muted-foreground">
              {item.unit}
            </span>
          </span>
          {item.minQuantity > 0 ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              Eşik: {item.minQuantity} {item.unit}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 truncate text-xs text-muted-foreground">
          <span className="h-2 w-2 shrink-0 rounded-full bg-tulpar-blue" />
          <span className="truncate">
            {locationText} • {category?.name ?? 'Genel'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            size="sm"
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
