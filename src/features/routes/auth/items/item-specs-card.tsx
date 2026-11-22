'use client';

import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Link } from '@/components/core/link';
import { ITEM_TYPE_OPTIONS } from '@/features/inventory/constants';
import type { Category, Item } from '@/features/inventory/types';
import { formatCustomFieldValue } from '@/features/inventory/utils';
import { useUserPreferences } from '@/hooks/use-user-preferences';

interface ItemSpecsCardProps {
  item: Item;
  category?: Category;
}

export function ItemSpecsCard({ item, category }: ItemSpecsCardProps) {
  const { formatDate, formatPrice } = useUserPreferences();
  const fields = category?.customFields ?? [];
  const populatedFields = fields.filter(
    (field) =>
      item.customFieldValues[field.key] !== undefined &&
      item.customFieldValues[field.key] !== '',
  );

  const typeLabel =
    ITEM_TYPE_OPTIONS.find((opt) => opt.value === item.type)?.label ??
    item.type;

  const hasProductDetails = Boolean(
    item.model ||
    item.serialNumber ||
    item.store ||
    item.purchaseDate ||
    item.purchasePrice !== undefined ||
    item.warrantyEndsAt ||
    item.tags.length > 0,
  );

  if (populatedFields.length === 0 && !hasProductDetails) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Teknik &amp; Kategori Özellikleri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-text-muted">Tür</p>
            <p className="font-medium">{typeLabel}</p>
          </div>
          {item.model ? (
            <div>
              <p className="text-xs text-text-muted">Model</p>
              <p className="font-medium">{item.model}</p>
            </div>
          ) : null}
          {item.serialNumber ? (
            <div>
              <p className="text-xs text-text-muted">Seri No</p>
              <p className="font-mono text-xs">{item.serialNumber}</p>
            </div>
          ) : null}
          {item.purchasePrice !== undefined ? (
            <div>
              <p className="text-xs text-text-muted">Satın Alma Fiyatı</p>
              <p className="font-medium tabular-nums">
                {formatPrice(item.purchasePrice, item.currency)}
              </p>
            </div>
          ) : null}
          {item.store ? (
            <div>
              <p className="text-xs text-text-muted">Mağaza</p>
              <p className="font-medium">{item.store}</p>
            </div>
          ) : null}
          {item.purchaseDate ? (
            <div>
              <p className="text-xs text-text-muted">Satın Alma Tarihi</p>
              <p className="font-medium">{formatDate(item.purchaseDate)}</p>
            </div>
          ) : null}
          {item.warrantyEndsAt ? (
            <div>
              <p className="text-xs text-text-muted">Garanti Bitiş</p>
              <p className="font-medium">{formatDate(item.warrantyEndsAt)}</p>
            </div>
          ) : null}
        </div>

        {populatedFields.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 border-t border-border pt-3 sm:grid-cols-2">
            {populatedFields.map((field) => {
              const raw = item.customFieldValues[field.key];
              const formatted = formatCustomFieldValue(field, raw);
              return (
                <div
                  key={field.key}
                  className="rounded-sm border border-border bg-surface-sunken/40 px-3 py-2"
                >
                  <p className="text-[11px] font-medium text-text-muted">
                    {field.label}
                  </p>
                  {field.type === 'url' &&
                  typeof raw === 'string' &&
                  raw.startsWith('http') ? (
                    <Link
                      href={raw}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      <span className="break-all">{raw}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-text">{formatted}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {item.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
