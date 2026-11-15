'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/core/toast';
import type { Category, Item, Location } from '@/features/inventory/types';
import { resolveCategoryColorHex } from '@/features/inventory/utils';
import {
  useCategoriesQuery,
  useItemQuery,
  useLocationsQuery,
  useMovementsQuery,
  useRecordMovementMutation,
} from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';

interface UseItemDetailDialogParams {
  itemId: string;
  onOpenChange: (open: boolean) => void;
  categories?: Category[];
  locations?: Location[];
  onEdit?: (item: Item) => void;
}

/** Manages data fetching, stock mutations, and modal actions for ItemDetailDialog. */
export function useItemDetailDialog({
  itemId,
  onOpenChange,
  categories: categoriesProp,
  locations: locationsProp,
  onEdit,
}: UseItemDetailDialogParams) {
  const qc = useQueryClient();
  const { data: item, isLoading } = useItemQuery(itemId);
  const { data: movements = [] } = useMovementsQuery(itemId);
  const { data: queriedCategories = [] } = useCategoriesQuery();
  const { data: queriedLocations = [] } = useLocationsQuery();
  const moveMutation = useRecordMovementMutation();

  const [qrOpen, setQrOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [inlineEditItem, setInlineEditItem] = React.useState<Item | undefined>(
    undefined,
  );

  const categories = categoriesProp ?? queriedCategories;
  const locations = locationsProp ?? queriedLocations;
  const category = item
    ? categories.find((c) => c.id === item.categoryId)
    : undefined;
  const location = item
    ? locations.find((l) => l.id === item.locationId)
    : undefined;
  const categoryHex = category?.colorToken
    ? resolveCategoryColorHex(category.colorToken)
    : undefined;

  const adjustStock = async (delta: number) => {
    if (!item) return;
    try {
      await moveMutation.mutateAsync({
        itemId: item.id,
        type: delta > 0 ? 'in' : 'out',
        delta,
        reason: delta > 0 ? 'Stok girişi' : 'Stok çıkışı',
      });
      toast.success('Stok güncellendi.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'İşlem başarısız.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!item) return;
    try {
      await inventoryService.deleteItem(item.id);
      await qc.invalidateQueries({ queryKey: ['inventory', 'items'] });
      toast.success('Ürün silindi.');
      setDeleteOpen(false);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ürün silinemedi.');
      throw err;
    }
  };

  const handleOpenEdit = () => {
    if (!item) return;
    if (onEdit) {
      onOpenChange(false);
      onEdit(item);
      return;
    }
    setInlineEditItem(item);
  };

  return {
    item,
    isLoading,
    movements,
    categories,
    locations,
    category,
    location,
    categoryHex,
    isAdjusting: moveMutation.isPending,
    qrOpen,
    setQrOpen,
    deleteOpen,
    setDeleteOpen,
    inlineEditItem,
    setInlineEditItem,
    adjustStock,
    handleConfirmDelete,
    handleOpenEdit,
  };
}
