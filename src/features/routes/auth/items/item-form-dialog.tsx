'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import {
  AmountField,
  Form,
  SelectField,
  SubmitButton,
  TextField,
  TextareaField,
} from '@/components/forms';
import { toast } from '@/components/core/toast';
import { itemInputSchema, type ItemInput } from '@/features/inventory/schemas';
import type { Category, Item, Location } from '@/features/inventory/types';
import { inventoryService } from '@/services/inventory-service';
import { compressImageFile } from '@/lib/utils/image-compress';
import { useQueryClient } from '@tanstack/react-query';

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  locations: Location[];
  initialBarcode?: string;
  editItem?: Item;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  categories,
  locations,
  initialBarcode,
  editItem,
}: ItemFormDialogProps) {
  const qc = useQueryClient();
  const [saving, setSaving] = React.useState(false);
  const [customValues, setCustomValues] = React.useState<
    Record<string, string | number>
  >(editItem?.customFieldValues ?? {});
  const [photos, setPhotos] = React.useState<string[]>(editItem?.photos ?? []);

  const activeCategory = categories.find(
    (c) => c.id === (editItem?.categoryId || categories[0]?.id),
  );

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

  const handleSubmit = async (values: ItemInput) => {
    setSaving(true);
    try {
      const payload: ItemInput = {
        ...values,
        customFieldValues: customValues,
        photos,
      };
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

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const locationOptions = locations.map((l) => ({
    value: l.id,
    label: l.path.join(' > '),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editItem ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
          </DialogTitle>
        </DialogHeader>
        <Form
          schema={itemInputSchema}
          defaultValues={{
            name: editItem?.name ?? '',
            categoryId: editItem?.categoryId ?? categories[0]?.id ?? '',
            locationId: editItem?.locationId ?? locations[0]?.id ?? '',
            type: editItem?.type ?? 'consumable',
            quantity: editItem?.quantity ?? 1,
            unit: editItem?.unit ?? 'adet',
            minQuantity: editItem?.minQuantity ?? 1,
            targetQuantity: editItem?.targetQuantity,
            barcode: editItem?.barcode ?? initialBarcode ?? '',
            brand: editItem?.brand ?? '',
            expiresAt: editItem?.expiresAt,
            currency: editItem?.currency ?? 'TRY',
            photos: editItem?.photos ?? [],
            documents: editItem?.documents ?? [],
            tags: editItem?.tags ?? [],
            customFieldValues: editItem?.customFieldValues ?? {},
            notes: editItem?.notes ?? '',
            status: editItem?.status ?? 'active',
          }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <TextField
            name="name"
            label="Ürün Adı"
            placeholder="Örn. Zeytinyağı (1 Lt)"
            required
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              name="categoryId"
              label="Kategori"
              options={categoryOptions}
              required
            />
            <SelectField
              name="locationId"
              label="Konum"
              options={locationOptions}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <AmountField name="quantity" label="Miktar" required />
            <TextField name="unit" label="Birim" placeholder="adet" required />
            <AmountField name="minQuantity" label="Min. Eşik" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              name="barcode"
              label="Barkod (Opsiyonel)"
              placeholder="869..."
            />
            <TextField
              name="brand"
              label="Marka (Opsiyonel)"
              placeholder="Örn. Anker"
            />
          </div>

          {activeCategory && activeCategory.customFields.length > 0 && (
            <div className="space-y-3 rounded-sm border border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {activeCategory.name} Özel Alanları
              </p>
              {activeCategory.customFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label htmlFor={`cf-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`cf-${field.key}`}
                    value={String(customValues[field.key] ?? '')}
                    onChange={(e) =>
                      setCustomValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="item-photo-upload">Fotoğraf Ekle</Label>
            <Input
              id="item-photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
            {photos.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {photos.length} fotoğraf eklendi.
              </p>
            )}
          </div>

          <TextareaField name="notes" label="Notlar" />
          <SubmitButton isLoading={saving} fullWidth>
            Kaydet
          </SubmitButton>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
