'use client';

import * as React from 'react';
import { toast } from '@/components/core/toast';
import type { Item } from '@/features/inventory/types';
import {
  useCategoriesQuery,
  useItemsQuery,
  useLocationsQuery,
  useRecordMovementMutation,
} from '@/hooks/use-inventory-hooks';

/** Manages filtering, stock quick-consume, and create/edit/detail modal state for ItemsScreen. */
export function useItemsScreen() {
  const { data: items = [], isLoading } = useItemsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: locations = [] } = useLocationsQuery();
  const moveMutation = useRecordMovementMutation();

  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [locationFilter, setLocationFilter] = React.useState('all');
  const [lowStockOnly, setLowStockOnly] = React.useState(false);
  const [expiringOnly, setExpiringOnly] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Item | undefined>(
    undefined,
  );
  const [detailItemId, setDetailItemId] = React.useState<string | null>(null);
  const [nowMs] = React.useState(() => Date.now());

  const categoryMap = React.useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );
  const locationMap = React.useMemo(
    () => new Map(locations.map((l) => [l.id, l])),
    [locations],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const soonThreshold = nowMs + 30 * 24 * 60 * 60 * 1000;
    return items.filter((item) => {
      if (categoryFilter !== 'all' && item.categoryId !== categoryFilter) {
        return false;
      }
      if (locationFilter !== 'all' && item.locationId !== locationFilter) {
        return false;
      }
      if (lowStockOnly && item.quantity > item.minQuantity) {
        return false;
      }
      if (expiringOnly) {
        const expMs = item.expiresAt ? Date.parse(item.expiresAt) : NaN;
        if (Number.isNaN(expMs) || expMs > soonThreshold) {
          return false;
        }
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.brand?.toLowerCase().includes(q) ?? false) ||
        (item.barcode?.toLowerCase().includes(q) ?? false) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [
    items,
    search,
    categoryFilter,
    locationFilter,
    lowStockOnly,
    expiringOnly,
    nowMs,
  ]);

  const handleConsume = async (item: Item) => {
    try {
      await moveMutation.mutateAsync({
        itemId: item.id,
        type: 'consume',
        delta: -1,
        reason: 'Hızlı tüketim',
      });
      toast.success(`${item.name} (-1 ${item.unit})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Stok güncellenemedi.');
    }
  };

  const clearUrlParams = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    if (window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const openCreateModal = React.useCallback(() => {
    setEditingItem(undefined);
    setFormDialogOpen(true);
  }, []);

  const openEditModal = React.useCallback((item: Item) => {
    setEditingItem(item);
    setFormDialogOpen(true);
  }, []);

  const openDetailModal = React.useCallback((itemId: string) => {
    setDetailItemId(itemId);
  }, []);

  const handleFormOpenChange = (open: boolean) => {
    setFormDialogOpen(open);
    if (!open) {
      setEditingItem(undefined);
      clearUrlParams();
    }
  };

  const handleDetailOpenChange = (open: boolean) => {
    if (!open) {
      setDetailItemId(null);
      clearUrlParams();
    }
  };

  return {
    isLoading,
    categories,
    locations,
    filtered,
    categoryMap,
    locationMap,
    isMoving: moveMutation.isPending,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    locationFilter,
    setLocationFilter,
    lowStockOnly,
    setLowStockOnly,
    expiringOnly,
    setExpiringOnly,
    viewMode,
    setViewMode,
    formDialogOpen,
    editingItem,
    detailItemId,
    openCreateModal,
    openEditModal,
    openDetailModal,
    handleFormOpenChange,
    handleDetailOpenChange,
    handleConsume,
  };
}
