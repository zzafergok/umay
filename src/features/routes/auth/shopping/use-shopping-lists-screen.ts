'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/core/toast';
import type { ShoppingListInput } from '@/features/inventory/schemas';
import type {
  ShoppingList,
  ShoppingListItem,
} from '@/features/inventory/types';
import {
  useSettingsQuery,
  useShoppingListsQuery,
  useShoppingQuery,
} from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';

export function useShoppingListsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: lists = [], isLoading } = useShoppingListsQuery();
  const { data: allItems = [] } = useShoppingQuery();
  const { data: settings } = useSettingsQuery();

  const [search, setSearch] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingList, setEditingList] = React.useState<ShoppingList | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = React.useState<ShoppingList | null>(
    null,
  );

  const currency = settings?.currency ?? 'TRY';

  const { itemsByList, unassignedItems } = React.useMemo(() => {
    const map = new Map<string, ShoppingListItem[]>();
    const unassigned: ShoppingListItem[] = [];
    for (const item of allItems) {
      if (item.listId) {
        const arr = map.get(item.listId) ?? [];
        arr.push(item);
        map.set(item.listId, arr);
      } else {
        unassigned.push(item);
      }
    }
    return { itemsByList: map, unassignedItems: unassigned };
  }, [allItems]);

  const filteredLists = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lists;
    return lists.filter(
      (list) =>
        list.name.toLowerCase().includes(q) ||
        (list.store?.toLowerCase().includes(q) ?? false) ||
        (list.description?.toLowerCase().includes(q) ?? false),
    );
  }, [lists, search]);

  const invalidateAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['inventory', 'shopping-lists'] }),
      qc.invalidateQueries({ queryKey: ['inventory', 'shopping'] }),
    ]);
  };

  const handleSubmitForm = async (
    values: ShoppingListInput,
  ): Promise<boolean> => {
    try {
      if (editingList) {
        await inventoryService.updateShoppingList(editingList.id, values);
        await invalidateAll();
        toast.success('Alışveriş listesi güncellendi.');
      } else {
        const created = await inventoryService.createShoppingList(values);
        await invalidateAll();
        toast.success('Alışveriş listesi oluşturuldu.');
        router.push(`/shopping/${created.id}`);
      }
      setEditingList(null);
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Alışveriş listesi kaydedilemedi.',
      );
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await inventoryService.deleteShoppingList(deleteTarget.id);
      await invalidateAll();
      toast.success('Alışveriş listesi silindi.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Alışveriş listesi silinemedi.',
      );
      throw err;
    }
  };

  return {
    lists,
    filteredLists,
    itemsByList,
    unassignedItems,
    currency,
    isLoading,
    search,
    setSearch,
    formOpen,
    setFormOpen,
    editingList,
    setEditingList,
    deleteTarget,
    setDeleteTarget,
    handleSubmitForm,
    handleConfirmDelete,
  };
}
