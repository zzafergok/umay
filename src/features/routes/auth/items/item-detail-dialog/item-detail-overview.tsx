'use client';

import { ExternalLink, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Card, CardContent } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { QuantityStepper } from '@/components/core/quantity-stepper';
import { InfoTooltip } from '@/components/shared/info-tooltip';
import { MIN_QUANTITY_TOOLTIP } from '@/features/inventory/constants';
import type { Category, Item } from '@/features/inventory/types';
import { ItemSpecsCard } from '@/features/routes/auth/items/item-specs-card';

interface ItemDetailOverviewProps {
  item: Item;
  category?: Category;
  isAdjusting: boolean;
  onAdjustStock: (delta: number) => void;
}

/** Displays stock stepper, general metadata, notes, photos, and technical specs inside the item detail modal. */
export function ItemDetailOverview({
  item,
  category,
  isAdjusting,
  onAdjustStock,
}: ItemDetailOverviewProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <QuantityStepper
              value={item.quantity}
              unit={item.unit}
              isLoading={isAdjusting}
              onDecrement={() => onAdjustStock(-1)}
              onIncrement={() => onAdjustStock(1)}
            />
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {item.minQuantity > 0 ? (
                <Badge variant="secondary" className="gap-1">
                  <span>
                    Eşik: {item.minQuantity} {item.unit}
                  </span>
                  <InfoTooltip
                    content={MIN_QUANTITY_TOOLTIP}
                    ariaLabel="Minimum stok eşiği hakkında bilgi"
                  />
                </Badge>
              ) : null}
              {item.brand ? (
                <Badge variant="outline">{item.brand}</Badge>
              ) : null}
              {item.barcode ? (
                <Badge variant="outline">Barkod: {item.barcode}</Badge>
              ) : null}
              {item.expiresAt ? (
                <Badge variant="outline">
                  SKT: {new Date(item.expiresAt).toLocaleDateString('tr-TR')}
                </Badge>
              ) : null}
            </div>
          </div>

          {item.notes ? (
            <p className="border-t border-border pt-3 text-sm text-muted-foreground">
              {item.notes}
            </p>
          ) : null}

          {item.photos.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-t border-border pt-3">
              {item.photos.map((url, idx) => (
                <Link
                  key={`${url}-${idx}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-sunken/50 inline-flex min-h-[36px] items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:border-accent"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Fotoğraf #{idx + 1}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ItemSpecsCard item={item} category={category} />
    </div>
  );
}
