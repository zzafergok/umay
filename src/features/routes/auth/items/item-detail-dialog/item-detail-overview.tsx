'use client';

import { ExternalLink, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { QuantityStepper } from '@/components/core/quantity-stepper';
import { InfoTooltip } from '@/components/shared/info-tooltip';
import {
  getEffectiveDecrementStep,
  getUnitDefinition,
  MIN_QUANTITY_TOOLTIP,
  roundQuantity,
} from '@/features/inventory/constants';
import type { Category, Item } from '@/features/inventory/types';
import { ItemSpecsCard } from '@/features/routes/auth/items/item-specs-card';
import { useUserPreferences } from '@/hooks/use-user-preferences';

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
  const { formatDate } = useUserPreferences();
  const unitDef = getUnitDefinition(item.unit);
  const incStep = unitDef.defaultStep;
  const decStep = getEffectiveDecrementStep(item.unit, item.quantity);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <QuantityStepper
              value={roundQuantity(item.quantity)}
              unit={item.unit}
              step={incStep}
              isLoading={isAdjusting}
              onDecrement={() => onAdjustStock(-decStep)}
              onIncrement={() => onAdjustStock(incStep)}
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
                  SKT: {formatDate(item.expiresAt)}
                </Badge>
              ) : null}
            </div>
          </div>

          {unitDef.stepPresets.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-3">
              <span className="mr-1 text-caption text-text-muted">
                Hızlı tüketim:
              </span>
              {unitDef.stepPresets.map((preset) => {
                const effectiveDec = getEffectiveDecrementStep(
                  item.unit,
                  item.quantity,
                  preset,
                );
                return (
                  <Button
                    key={`quick-dec-${preset}`}
                    type="button"
                    size="xs"
                    variant="outline"
                    disabled={isAdjusting || item.quantity <= 0}
                    onClick={() => onAdjustStock(-effectiveDec)}
                    className="h-7 min-h-0 font-mono tabular-nums"
                  >
                    -{preset} {unitDef.shortLabel}
                  </Button>
                );
              })}
            </div>
          ) : null}

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
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-sm border border-border bg-surface-sunken/50 px-2.5 py-1 text-xs font-medium transition-colors hover:border-accent"
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
