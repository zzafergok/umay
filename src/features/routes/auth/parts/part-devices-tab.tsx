'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Cpu, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import { StatusPill } from '@/components/core/status-pill';
import { toast } from '@/components/core/toast';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { ITEM_STATUS_OPTIONS } from '@/features/inventory/constants';
import type {
  Category,
  EquipmentItem,
  Location,
  Part,
} from '@/features/inventory/types';
import { computePartHealth } from '@/lib/lifecycle';
import { inventoryService } from '@/services/inventory-service';

const STATUS_LABEL_MAP = new Map(
  ITEM_STATUS_OPTIONS.map((opt) => [opt.value, opt.label]),
);

interface PartDevicesTabProps {
  devices: EquipmentItem[];
  partsByDeviceId: Map<string, Part[]>;
  categories: Category[];
  locations: Location[];
  onCreateDeviceClick: () => void;
  onEditDeviceClick: (item: EquipmentItem) => void;
  onAddPartForDevice: (deviceId: string) => void;
  onReplacePartClick: (part: Part) => void;
}

export function PartDevicesTab({
  devices,
  partsByDeviceId,
  categories,
  locations,
  onCreateDeviceClick,
  onEditDeviceClick,
  onAddPartForDevice,
  onReplacePartClick,
}: PartDevicesTabProps) {
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
      toast.success('Cihaz silindi.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Silinemedi.');
      throw err;
    }
  };

  if (devices.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Cpu />
          </EmptyMedia>
          <EmptyTitle>Henüz cihaz eklenmemiş</EmptyTitle>
          <EmptyDescription>
            Su arıtma cihazı, süpürge, kombi veya kahve makinesi gibi bakımını
            takip etmek istediğiniz cihazları buraya ekleyin.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" onClick={onCreateDeviceClick}>
            <Plus className="mr-1.5 h-4 w-4" />
            Cihaz Ekle
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((device) => {
          const linkedParts = partsByDeviceId.get(device.id) ?? [];
          return (
            <Card key={device.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Cpu className="h-4 w-4 shrink-0 text-accent" />
                    <span className="truncate">{device.name}</span>
                  </CardTitle>
                  <p className="truncate text-xs text-text-muted">
                    {[
                      device.categoryId
                        ? categoryMap.get(device.categoryId)
                        : null,
                      device.locationId
                        ? locationMap.get(device.locationId)
                        : null,
                      device.brand,
                      device.model,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Cihaz / Demirbaş'}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {STATUS_LABEL_MAP.get(device.status) ?? 'Aktif'}
                </Badge>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col justify-between gap-3 pt-2">
                <div className="space-y-2">
                  {device.serialNumber ? (
                    <p className="font-mono text-xs text-text-muted">
                      SN: {device.serialNumber}
                    </p>
                  ) : null}

                  {linkedParts.length > 0 ? (
                    <div className="space-y-1.5 rounded-lg border border-border/70 bg-surface-sunken/60 p-2.5">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                        Bağlı Parçalar ({linkedParts.length})
                      </p>
                      <div className="space-y-1.5">
                        {linkedParts.map((part) => {
                          const health = computePartHealth(part);
                          return (
                            <div
                              key={part.id}
                              className="flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="truncate font-medium text-text">
                                {part.name}
                              </span>
                              <div className="flex shrink-0 items-center gap-1.5">
                                {health.status === 'overdue' ? (
                                  <StatusPill tone="overdue" label="Gecikti" />
                                ) : health.status === 'due_soon' ? (
                                  <StatusPill
                                    tone="due_soon"
                                    label={
                                      health.daysRemaining !== null
                                        ? `${health.daysRemaining}g`
                                        : 'Yaklaşıyor'
                                    }
                                  />
                                ) : health.daysRemaining !== null ? (
                                  <span className="font-mono text-[11px] text-text-muted">
                                    {health.daysRemaining}g
                                  </span>
                                ) : null}
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-text-muted hover:text-text"
                                  aria-label={`${part.name} değiştirildi`}
                                  onClick={() => onReplacePartClick(part)}
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted">
                      Bu cihaza bağlı parça takibi yok.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onAddPartForDevice(device.id)}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Parça Ekle
                  </Button>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-text-muted hover:bg-surface-sunken hover:text-text"
                      aria-label={`${device.name} düzenle`}
                      onClick={() => onEditDeviceClick(device)}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-danger/80 hover:bg-danger-subtle hover:text-danger"
                      aria-label={`${device.name} sil`}
                      onClick={() => setDeleteTarget(device)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
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
        entityLabel="Cihaz"
        itemName={deleteTarget?.name ?? ''}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
