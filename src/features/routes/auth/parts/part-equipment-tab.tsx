'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Cpu, Pencil, Plus, Trash2, Wrench } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import { toast } from '@/components/core/toast';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { ITEM_STATUS_OPTIONS } from '@/features/inventory/constants';
import type {
  Category,
  EquipmentItem,
  Location,
} from '@/features/inventory/types';
import { inventoryService } from '@/services/inventory-service';

const STATUS_LABEL_MAP = new Map(
  ITEM_STATUS_OPTIONS.map((opt) => [opt.value, opt.label]),
);

interface PartEquipmentTabProps {
  equipmentItems: EquipmentItem[];
  categories: Category[];
  locations: Location[];
  onCreateClick: () => void;
  onEditClick: (item: EquipmentItem) => void;
}

export function PartEquipmentTab({
  equipmentItems,
  categories,
  locations,
  onCreateClick,
  onEditClick,
}: PartEquipmentTabProps) {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = React.useState<EquipmentItem | null>(
    null,
  );

  const categoryMap = React.useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const locationMap = React.useMemo(
    () => new Map(locations.map((l) => [l.id, l.path.join('>')])),
    [locations],
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await inventoryService.deleteEquipment(deleteTarget.id);
      await qc.invalidateQueries({ queryKey: ['inventory', 'equipment'] });
      toast.success('Cihaz / yedek ürün silindi.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Silinemedi.');
      throw err;
    }
  };

  if (equipmentItems.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Cpu />
          </EmptyMedia>
          <EmptyTitle>Henüz cihaz veya yedek ürün yok</EmptyTitle>
          <EmptyDescription>
            Yedek parçası takip edilecek cihazları ve stoktaki yedek parçaları
            mutfak ürünlerinden ayrı olarak buraya ekleyin.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" onClick={onCreateClick}>
            <Plus className="mr-1.5 h-4 w-4" />
            Cihaz / Yedek Ekle
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {equipmentItems.map((item) => {
          const isDevice = item.kind === 'device';
          return (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {isDevice ? (
                      <Cpu className="h-4 w-4 shrink-0 text-accent" />
                    ) : (
                      <Wrench className="h-4 w-4 shrink-0 text-text-muted" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </CardTitle>
                  <p className="truncate text-xs text-text-muted">
                    {[
                      item.categoryId ? categoryMap.get(item.categoryId) : null,
                      item.locationId ? locationMap.get(item.locationId) : null,
                      item.brand,
                      item.model,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Genel'}
                  </p>
                </div>
                <Badge
                  variant={isDevice ? 'secondary' : 'outline'}
                  className="shrink-0"
                >
                  {isDevice ? 'Cihaz / Demirbaş' : 'Yedek Parça'}
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2 pt-2">
                <span className="min-w-0 truncate font-mono text-xs tabular-nums text-text-muted">
                  {isDevice
                    ? [
                        STATUS_LABEL_MAP.get(item.status) ?? 'Aktif',
                        item.serialNumber ? `SN: ${item.serialNumber}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')
                    : `Stok: ${item.quantity} ${item.unit}`}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-text-muted hover:bg-surface-sunken hover:text-text sm:h-8 sm:w-8"
                    aria-label={`${item.name} düzenle`}
                    onClick={() => onEditClick(item)}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-danger/80 hover:bg-danger-subtle hover:text-danger sm:h-8 sm:w-8"
                    aria-label={`${item.name} sil`}
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeleteTarget(null);
        }}
        entityLabel="Cihaz / Yedek Ürün"
        itemName={deleteTarget?.name ?? ''}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
