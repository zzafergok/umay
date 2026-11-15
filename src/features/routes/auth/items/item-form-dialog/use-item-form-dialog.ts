'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from '@/components/core/toast';
import type {
  Category,
  CustomFieldValue,
  Item,
  Location,
} from '@/features/inventory/types';
import {
  buildDefaultCustomFieldValues,
  validateCustomFieldValues,
} from '@/features/inventory/utils';
import { compressImageFile } from '@/lib/utils/image-compress';
import { inventoryService } from '@/services/inventory-service';
import { useQueryClient } from '@tanstack/react-query';
import {
  buildInitialCustomValues,
  buildItemFormDefaults,
  itemFormSchema,
  toItemPayload,
  type ItemFormValues,
} from './item-form-schema';

interface UseItemFormDialogParams {
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  locations: Location[];
  initialBarcode?: string;
  editItem?: Item;
}

export function useItemFormDialog({
  onOpenChange,
  categories,
  locations,
  initialBarcode,
  editItem,
}: UseItemFormDialogParams) {
  const qc = useQueryClient();
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('basic');
  const [customValues, setCustomValues] = React.useState<
    Record<string, CustomFieldValue>
  >(() => buildInitialCustomValues(editItem, categories));
  const [customErrors, setCustomErrors] = React.useState<
    Record<string, string>
  >({});
  const [photos, setPhotos] = React.useState<string[]>(editItem?.photos ?? []);
  const [tags, setTags] = React.useState<string[]>(editItem?.tags ?? []);

  const methods = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: buildItemFormDefaults(
      editItem,
      categories,
      locations,
      initialBarcode,
    ),
    mode: 'onChange',
  });

  const watchedCategoryId = useWatch({
    control: methods.control,
    name: 'categoryId',
  });

  const activeCategory = React.useMemo(
    () => categories.find((c) => c.id === watchedCategoryId) ?? categories[0],
    [categories, watchedCategoryId],
  );

  const handleCategoryChange = (nextCategoryId: string | null) => {
    if (editItem || !nextCategoryId) return;
    const nextCat = categories.find((c) => c.id === nextCategoryId);
    if (!nextCat) return;

    const defaults = nextCat.itemDefaults;
    if (defaults?.defaultType) {
      methods.setValue('type', defaults.defaultType);
    }
    if (defaults?.defaultUnit) {
      methods.setValue('unit', defaults.defaultUnit);
    }
    if (defaults?.defaultMinQuantity !== undefined) {
      methods.setValue('minQuantity', defaults.defaultMinQuantity);
    }
    setCustomValues((prev) =>
      buildDefaultCustomFieldValues(nextCat.customFields, prev),
    );
    setCustomErrors({});
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      const fd = new FormData();
      fd.append('file', compressed);
      const res = await fetch('/api/inventory/upload', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        toast.error('Fotoğraf yüklenemedi.');
        return;
      }
      const data = (await res.json()) as { url: string };
      setPhotos((prev) => [...prev, data.url]);
      toast.success('Fotoğraf eklendi.');
    } catch {
      toast.error('Fotoğraf işlenemedi.');
    }
  };

  const handleCustomValueChange = (
    key: string,
    next: CustomFieldValue | undefined,
  ) => {
    setCustomValues((prev) => {
      const copy = { ...prev };
      if (next === undefined) {
        delete copy[key];
      } else {
        copy[key] = next;
      }
      return copy;
    });
    setCustomErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSubmit = async (values: ItemFormValues) => {
    if (activeCategory) {
      const validationErrors = validateCustomFieldValues(
        activeCategory.customFields,
        customValues,
      );
      if (Object.keys(validationErrors).length > 0) {
        setCustomErrors(validationErrors);
        setActiveTab('technical');
        toast.error('Lütfen zorunlu veya hatalı özel alanları düzeltin.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = toItemPayload(
        values,
        customValues,
        photos,
        tags,
        editItem?.documents ?? [],
      );
      if (editItem) {
        await inventoryService.updateItem(editItem.id, payload);
        toast.success('Ürün güncellendi.');
      } else {
        await inventoryService.createItem(payload);
        toast.success('Ürün eklendi.');
      }
      await qc.invalidateQueries({ queryKey: ['inventory', 'items'] });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ürün kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    activeTab,
    setActiveTab,
    methods,
    activeCategory,
    customValues,
    customErrors,
    photos,
    tags,
    setTags,
    handlePhotoUpload,
    handleRemovePhoto: (idx: number) =>
      setPhotos((prev) => prev.filter((_, i) => i !== idx)),
    handleCategoryChange,
    handleCustomValueChange,
    handleSubmit,
  };
}
