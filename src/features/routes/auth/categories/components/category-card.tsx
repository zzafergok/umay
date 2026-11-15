'use client';

import { Copy, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { CategoryIcon } from '@/features/inventory/components';
import { ITEM_TYPE_OPTIONS } from '@/features/inventory/constants';
import type { Category } from '@/features/inventory/types';
import {
  formatCustomFieldBadge,
  resolveCategoryColorHex,
} from '@/features/inventory/utils';

interface CategoryCardProps {
  category: Category;
  itemCount: number;
  onEdit: (category: Category) => void;
  onDuplicate: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({
  category,
  itemCount,
  onEdit,
  onDuplicate,
  onDelete,
}: CategoryCardProps) {
  const color = resolveCategoryColorHex(category.colorToken);
  const defaults = category.itemDefaults;
  const defaultTypeLabel = defaults?.defaultType
    ? ITEM_TYPE_OPTIONS.find((opt) => opt.value === defaults.defaultType)?.label
    : null;

  const trackingFlags = [
    defaults?.trackSerialNumber ? 'Seri No' : null,
    defaults?.trackWarranty ? 'Garanti' : null,
    defaults?.trackExpiry ? 'SKT' : null,
    defaults?.trackPurchase ? 'Fiyat' : null,
  ].filter(Boolean) as string[];

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <div
            className="bg-surface-sunken flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border"
            style={{ color }}
          >
            <CategoryIcon name={category.icon} className="h-4 w-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <CardTitle className="flex items-center gap-2 text-base">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="truncate">{category.name}</span>
            </CardTitle>
            {category.description ? (
              <p className="text-text-muted line-clamp-2 text-xs">
                {category.description}
              </p>
            ) : null}
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 tabular-nums">
          {itemCount} ürün
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        {defaultTypeLabel ||
        defaults?.defaultUnit ||
        trackingFlags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {defaultTypeLabel ? (
              <Badge variant="outline" className="text-[11px]">
                {defaultTypeLabel}
              </Badge>
            ) : null}
            {defaults?.defaultUnit ? (
              <Badge variant="outline" className="text-[11px]">
                Birim: {defaults.defaultUnit}
              </Badge>
            ) : null}
            {trackingFlags.map((flag) => (
              <Badge
                key={flag}
                variant="outline"
                className="text-text-muted text-[11px]"
              >
                {flag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {category.customFields.length === 0 ? (
            <span className="text-xs text-muted-foreground">Özel alan yok</span>
          ) : (
            category.customFields.map((field) => (
              <Badge
                key={field.key}
                variant="secondary"
                className="gap-1 text-xs"
              >
                <span>
                  {field.label}
                  {field.required ? ' *' : ''}
                </span>
                <span className="text-text-muted text-[10px]">
                  ({formatCustomFieldBadge(field)})
                </span>
              </Badge>
            ))
          )}
        </div>

        <div className="flex items-center justify-end gap-1 border-t border-border pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            aria-label={`${category.name} kategorisini düzenle`}
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Düzenle
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDuplicate(category)}
            aria-label={`${category.name} kategorisini çoğalt`}
          >
            <Copy className="text-text-muted h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${category.name} kategorisini sil`}
            onClick={() => onDelete(category.id)}
          >
            <Trash2 className="text-text-muted hover:text-danger h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
