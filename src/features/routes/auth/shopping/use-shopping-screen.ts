'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/core/toast';
import type {
  ShoppingItemInput,
  ShoppingItemPatchInput,
} from '@/features/inventory/schemas';
import type { ShoppingListItem } from '@/features/inventory/types';
import {
  useCategoriesQuery,
  useItemsQuery,
  usePartsQuery,
  useRecordMovementMutation,
  useSettingsQuery,
  useShoppingQuery,
} from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import type { ShoppingSuggestion } from './shopping-suggestions';
import {
  buildShoppingSuggestions,
  computeShoppingSummary,
  filterAndSortShoppingList,
  type ShoppingPriorityFilter,
  type ShoppingStatusFilter,
} from './shopping-utils';

export function useShoppingScreen() {
  const qc = useQueryClient();
  const { data: list = [], isLoading } = useShoppingQuery();
  const { data: items = [] } = useItemsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: partsData } = usePartsQuery();
  const { data: settings } = useSettingsQuery();
  const moveMutation = useRecordMovementMutation();

  const [statusFilter, setStatusFilter] =
    React.useState<ShoppingStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] =
    React.useState<ShoppingPriorityFilter>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingEntry, setEditingEntry] =
    React.useState<ShoppingListItem | null>(null);
  const [isClearingDone, setIsClearingDone] = React.useState(false);

  const currency = settings?.currency ?? 'TRY';

  const itemMap = React.useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  );
  const categoryMap = React.useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const suggestions = React.useMemo<ShoppingSuggestion[]>(
    () =>
      buildShoppingSuggestions(
        list,
        items,
        partsData?.parts ?? [],
        itemMap,
        categoryMap,
      ),
    [list, items, partsData, itemMap, categoryMap],
  );

  const summary = React.useMemo(() => computeShoppingSummary(list), [list]);
  const filteredList = React.useMemo(
    () =>
      filterAndSortShoppingList(
        list,
        { status: statusFilter, priority: priorityFilter, search: searchQuery },
        itemMap,
        categoryMap,
      ),
    [list, statusFilter, priorityFilter, searchQuery, itemMap, categoryMap],
  );

  const invalidateShopping = () =>
    qc.invalidateQueries({ queryKey: ['inventory', 'shopping'] });

  const handleAddManual = async (input: ShoppingItemInput): Promise<boolean> => {
    try {
      await inventoryService.createShopping(input);
      await invalidateShopping();
      toast.success('Ürün alışveriş listesine eklendi.');
      return true;
    } catch {
      toast.error('Ürün eklenemedi.');
      return false;
    }
  };

  const toSuggestionInput = (s: ShoppingSuggestion): ShoppingItemInput => ({
    itemId: s.itemId,
    freeText: s.label,
    qty: s.suggestedQty,
    unit: s.unit,
    category: s.category,
    priority: 'high',
    source: s.source,
    done: false,
  });

  const handleAcceptSuggestion = async (s: ShoppingSuggestion) => {
    try {
      await inventoryService.createShopping(toSuggestionInput(s));
      await invalidateShopping();
      toast.success(`${s.label} listeye eklendi.`);
    } catch {
      toast.error('Öneri eklenemedi.');
    }
  };

  const handleAcceptAllSuggestions = async () => {
    try {
      await Promise.all(
        suggestions.map((s) =>
          inventoryService.createShopping(toSuggestionInput(s)),
        ),
      );
      await invalidateShopping();
      toast.success(`${suggestions.length} öneri listeye eklendi.`);
    } catch {
      toast.error('Öneriler eklenirken hata oluştu.');
    }
  };

  const handleToggleDone = async (entry: ShoppingListItem) => {
    const nextDone = !entry.done;
    try {
      await inventoryService.updateShopping(entry.id, { done: nextDone });
      if (nextDone && entry.itemId) {
        await moveMutation.mutateAsync({
          itemId: entry.itemId,
          type: 'in',
          delta: entry.qty,
          reason: 'Alışverişten stok girişi',
        });
      }
      await invalidateShopping();
      toast.success(
        nextDone
          ? entry.itemId
            ? 'Alındı ve stoğa eklendi.'
            : 'Alındı olarak işaretlendi.'
          : 'Alınacaklara geri taşındı.',
      );
    } catch {
      toast.error('Durum güncellenemedi.');
    }
  };

  const handleAdjustQty = async (entry: ShoppingListItem, delta: number) => {
    const nextQty = Math.max(1, entry.qty + delta);
    if (nextQty === entry.qty) return;
    try {
      await inventoryService.updateShopping(entry.id, { qty: nextQty });
      await invalidateShopping();
    } catch {
      toast.error('Miktar güncellenemedi.');
    }
  };

  const handleSaveEdit = async (
    id: string,
    patch: ShoppingItemPatchInput,
  ): Promise<boolean> => {
    try {
      await inventoryService.updateShopping(id, patch);
      await invalidateShopping();
      toast.success('Alışveriş kalemi güncellendi.');
      return true;
    } catch {
      toast.error('Değişiklikler kaydedilemedi.');
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await inventoryService.deleteShopping(id);
      await invalidateShopping();
      toast.success('Kalem listeden silindi.');
    } catch {
      toast.error('Silinemedi.');
    }
  };

  const handleClearDone = async () => {
    const doneItems = list.filter((item) => item.done);
    if (doneItems.length === 0) return;
    setIsClearingDone(true);
    try {
      await Promise.all(
        doneItems.map((item) => inventoryService.deleteShopping(item.id)),
      );
      await invalidateShopping();
      toast.success(`${doneItems.length} tamamlanan kalem temizlendi.`);
    } catch {
      toast.error('Tamamlanan kalemler temizlenemedi.');
    } finally {
      setIsClearingDone(false);
    }
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };

  return {
    list,
    filteredList,
    items,
    categories,
    itemMap,
    categoryMap,
    suggestions,
    summary,
    currency,
    isLoading,
    isClearingDone,
    statusFilter,
    priorityFilter,
    searchQuery,
    editingEntry,
    setStatusFilter,
    setPriorityFilter,
    setSearchQuery,
    setEditingEntry,
    resetFilters,
    handleAddManual,
    handleAcceptSuggestion,
    handleAcceptAllSuggestions,
    handleToggleDone,
    handleAdjustQty,
    handleSaveEdit,
    handleDelete,
    handleClearDone,
  };
}
