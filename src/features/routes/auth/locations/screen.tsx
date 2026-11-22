'use client';

import * as React from 'react';
import { FolderTree, MapPin, Plus, Trash2 } from 'lucide-react';
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
import type { LocationInput } from '@/features/inventory/schemas';
import type { Location } from '@/features/inventory/types';
import { useItemsQuery, useLocationsQuery } from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import { useQueryClient } from '@tanstack/react-query';
import { LocationFormDialog } from './location-form-dialog';

export function LocationsScreen() {
  const qc = useQueryClient();
  const { data: locations = [], isLoading } = useLocationsQuery();
  const { data: items = [] } = useItemsQuery();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Location | null>(null);

  const countByLocation = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.locationId, (map.get(item.locationId) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const childCountByLocation = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const loc of locations) {
      if (loc.parentId) {
        map.set(loc.parentId, (map.get(loc.parentId) ?? 0) + 1);
      }
    }
    return map;
  }, [locations]);

  const sortedLocations = React.useMemo(
    () =>
      locations.toSorted((a, b) =>
        a.path.join('>').localeCompare(b.path.join('>'), 'tr'),
      ),
    [locations],
  );

  const parentOptions = React.useMemo(
    () => [
      { value: '__none__', label: 'Kök Konum (Üst Yok)' },
      ...sortedLocations.map((loc) => ({
        value: loc.id,
        label: loc.path.join('>'),
      })),
    ],
    [sortedLocations],
  );

  const handleCreate = async (values: LocationInput) => {
    setSaving(true);
    try {
      const parentId =
        values.parentId === '__none__' || !values.parentId
          ? null
          : values.parentId;
      await inventoryService.createLocation({ ...values, parentId });
      await qc.invalidateQueries({ queryKey: ['inventory', 'locations'] });
      toast.success('Konum eklendi.');
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Konum eklenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await inventoryService.deleteLocation(deleteTarget.id);
      await qc.invalidateQueries({ queryKey: ['inventory', 'locations'] });
      toast.success('Konum silindi.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Konum silinemedi.');
      throw err;
    }
  };

  const deleteItemCount = deleteTarget
    ? (countByLocation.get(deleteTarget.id) ?? 0)
    : 0;
  const deleteChildCount = deleteTarget
    ? (childCountByLocation.get(deleteTarget.id) ?? 0)
    : 0;
  const deleteWarning =
    deleteChildCount > 0
      ? `Bu konuma bağlı ${deleteChildCount} alt konum bulunuyor. Önce alt konumları taşımalı veya silmelisiniz.`
      : deleteItemCount > 0
        ? `Bu konuma bağlı ${deleteItemCount} ürün bulunuyor.`
        : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Oda, dolap ve çekmece hiyerarşisini yönet.
        </p>
        {!isLoading && sortedLocations.length > 0 ? (
          <Button
            onClick={() => setOpen(true)}
            className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Konum Ekle
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      ) : sortedLocations.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderTree />
            </EmptyMedia>
            <EmptyTitle>Henüz konum yok</EmptyTitle>
            <EmptyDescription>
              Ev, Mutfak veya Çalışma Odası gibi ilk konumunu oluştur.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Konum Ekle
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sortedLocations.map((loc) => {
            const itemCount = countByLocation.get(loc.id) ?? 0;
            return (
              <Card key={loc.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4 shrink-0 text-umay-blue" />
                      <span className="truncate">{loc.name}</span>
                    </CardTitle>
                    <p className="break-words text-xs text-muted-foreground">
                      {loc.path.join('>')}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 tabular-nums">
                    {itemCount} ürün
                  </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2 pt-2">
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {loc.note || 'Not yok'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-danger/80 hover:bg-danger-subtle hover:text-danger sm:h-8 sm:w-8"
                    aria-label={`${loc.name} konumunu sil`}
                    onClick={() => setDeleteTarget(loc)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <LocationFormDialog
        open={open}
        onOpenChange={setOpen}
        saving={saving}
        parentOptions={parentOptions}
        onSubmit={handleCreate}
      />

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeleteTarget(null);
        }}
        entityLabel="Konum"
        itemName={deleteTarget?.name ?? ''}
        itemIcon={<MapPin className="size-4" />}
        itemColor="rgb(var(--umay-blue))"
        details={
          deleteTarget
            ? [
                { label: 'Konum Yolu', value: deleteTarget.path.join('>') },
                { label: 'Bağlı Ürün', value: `${deleteItemCount} ürün` },
              ]
            : undefined
        }
        warning={deleteWarning}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
