'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
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
import type {
  Category,
  EquipmentItem,
  Location,
} from '@/features/inventory/types';
import { inventoryService } from '@/services/inventory-service';

interface PartSparesTabProps {
  spares: EquipmentItem[];
  linkedCountBySpareId: Map<string, number>;
  categories: Category[];
  locations: Location[];
  onCreateSpareClick: () => void;
  onEditSpareClick: (item: EquipmentItem) => void;
}

export function PartSparesTab({
  spares,
  linkedCountBySpareId,
  categories,
  locations,
  onCreateSpareClick,
  onEditSpareClick,
}: PartSparesTabProps) {
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
      toast.success('Yedek parça silindi.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Silinemedi.');
      throw err;
    }
  };

  if (spares.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package />
          </EmptyMedia>
          <EmptyTitle>Henüz yedek parça stoğu yok</EmptyTitle>
          <EmptyDescription>
            Dolabınızda bekleyen yedek filtre, solüsyon, fırça veya aksesuarları
            buraya ekleyin. Aktif parça değiştiğinde stoktan otomatik düşülür.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" onClick={onCreateSpareClick}>
            <Plus className="mr-1.5 h-4 w-4" />
            Yedek Parça Ekle
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {spares.map((spare) => {
          const linkedCount = linkedCountBySpareId.get(spare.id) ?? 0;
          return (
            <Card key={spare.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-4 w-4 shrink-0 text-text-muted" />
                    <span className="truncate">{spare.name}</span>
                  </CardTitle>
                  <p className="truncate text-xs text-text-muted">
                    {[
                      spare.categoryId
                        ? categoryMap.get(spare.categoryId)
                        : null,
                      spare.locationId
                        ? locationMap.get(spare.locationId)
                        : null,
                      spare.brand,
                      spare.model,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Yedek Parça'}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 font-mono">
                  {spare.quantity} {spare.unit}
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2 pt-2">
                <span className="truncate text-xs text-text-muted">
                  {linkedCount > 0
                    ? `${linkedCount} aktif parçaya bağlı`
                    : 'Henüz aktif parçaya bağlı değil'}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-muted hover:bg-surface-sunken hover:text-text"
                    aria-label={`${spare.name} düzenle`}
                    onClick={() => onEditSpareClick(spare)}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-danger/80 hover:bg-danger-subtle hover:text-danger"
                    aria-label={`${spare.name} sil`}
                    onClick={() => setDeleteTarget(spare)}
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
        entityLabel="Yedek Parça"
        itemName={deleteTarget?.name ?? ''}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
