'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/core/toast';
import type { LocationInput } from '@/features/inventory/schemas';
import type { Location } from '@/features/inventory/types';
import { useItemsQuery, useLocationsQuery } from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';

export function useLocationsScreen() {
  const qc = useQueryClient();
  const { data: locations = [], isLoading } = useLocationsQuery();
  const { data: items = [] } = useItemsQuery();
  const [open, setOpen] = React.useState(false);
  const [editingTarget, setEditingTarget] = React.useState<Location | null>(
    null,
  );
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

  const excludedParentIds = React.useMemo(() => {
    if (!editingTarget) return new Set<string>();
    const excluded = new Set<string>([editingTarget.id]);
    const queue = [editingTarget.id];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      for (const loc of locations) {
        if (loc.parentId === currentId && !excluded.has(loc.id)) {
          excluded.add(loc.id);
          queue.push(loc.id);
        }
      }
    }
    return excluded;
  }, [editingTarget, locations]);

  const parentOptions = React.useMemo(
    () => [
      { value: '__none__', label: 'Kök Konum (Üst Yok)' },
      ...sortedLocations
        .filter((loc) => !excludedParentIds.has(loc.id))
        .map((loc) => ({
          value: loc.id,
          label: loc.path.join('>'),
        })),
    ],
    [sortedLocations, excludedParentIds],
  );

  const handleSave = async (values: LocationInput) => {
    setSaving(true);
    try {
      const parentId =
        values.parentId === '__none__' || !values.parentId
          ? null
          : values.parentId;
      if (editingTarget) {
        await inventoryService.updateLocation(editingTarget.id, {
          ...values,
          parentId,
        });
        toast.success('Konum güncellendi.');
        setEditingTarget(null);
      } else {
        await inventoryService.createLocation({ ...values, parentId });
        toast.success('Konum eklendi.');
        setOpen(false);
      }
      await qc.invalidateQueries({ queryKey: ['inventory', 'locations'] });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : editingTarget
            ? 'Konum güncellenemedi.'
            : 'Konum eklenemedi.',
      );
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

  return {
    isLoading,
    sortedLocations,
    countByLocation,
    parentOptions,
    dialogOpen: open || Boolean(editingTarget),
    editingTarget,
    saving,
    deleteTarget,
    deleteItemCount,
    deleteWarning,
    openCreateDialog: () => setOpen(true),
    openEditDialog: (loc: Location) => setEditingTarget(loc),
    closeDialog: () => {
      setOpen(false);
      setEditingTarget(null);
    },
    setDeleteTarget,
    handleSave,
    handleConfirmDelete,
  };
}
