'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/core/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { toast } from '@/components/core/toast';
import {
  AmountField,
  Form,
  SelectField,
  SubmitButton,
  TextField,
} from '@/components/forms';
import { ITEM_STATUS_OPTIONS } from '@/features/inventory/constants';
import type {
  Category,
  EquipmentItem,
  Location,
} from '@/features/inventory/types';
import { parseAmountInput } from '@/lib/utils';
import { inventoryService } from '@/services/inventory-service';
import {
  equipmentFormSchema,
  type EquipmentFormValues,
} from './part-form-schema';

interface PartEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  locations: Location[];
  editItem?: EquipmentItem | null;
  defaultKind?: 'device' | 'spare';
}

export function PartEquipmentDialog({
  open,
  onOpenChange,
  categories,
  locations,
  editItem,
  defaultKind = 'device',
}: PartEquipmentDialogProps) {
  const qc = useQueryClient();
  const isEditing = Boolean(editItem);

  const defaultValues = React.useMemo<EquipmentFormValues>(
    () => ({
      kind: editItem?.kind ?? defaultKind,
      name: editItem?.name ?? '',
      categoryId: editItem?.categoryId ?? '__none__',
      locationId: editItem?.locationId ?? '__none__',
      status: editItem?.status ?? 'active',
      quantity: editItem?.quantity ?? 1,
      unit: editItem?.unit ?? 'adet',
      brand: editItem?.brand ?? '',
      model: editItem?.model ?? '',
      serialNumber: editItem?.serialNumber ?? '',
    }),
    [editItem, defaultKind],
  );

  const methods = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (open) {
      methods.reset(defaultValues);
    }
  }, [open, defaultValues, methods]);

  const selectedKind = useWatch({ control: methods.control, name: 'kind' });
  const isDevice = selectedKind === 'device';

  const handleSubmit = async (values: EquipmentFormValues) => {
    try {
      const deviceMode = values.kind === 'device';
      const payload = {
        kind: values.kind,
        name: values.name.trim(),
        categoryId:
          values.categoryId && values.categoryId !== '__none__'
            ? values.categoryId
            : undefined,
        locationId:
          values.locationId && values.locationId !== '__none__'
            ? values.locationId
            : undefined,
        quantity: deviceMode
          ? 1
          : Math.max(0, parseAmountInput(values.quantity)),
        unit: deviceMode ? 'adet' : values.unit.trim() || 'adet',
        status: deviceMode ? values.status : ('active' as const),
        brand: values.brand?.trim() || undefined,
        model: values.model?.trim() || undefined,
        serialNumber: deviceMode
          ? values.serialNumber?.trim() || undefined
          : undefined,
      };

      if (editItem) {
        await inventoryService.updateEquipment(editItem.id, payload);
        toast.success(
          deviceMode ? 'Cihaz güncellendi.' : 'Yedek parça stoğu güncellendi.',
        );
      } else {
        await inventoryService.createEquipment(payload);
        toast.success(
          deviceMode ? 'Cihaz eklendi.' : 'Yedek parça stoğu eklendi.',
        );
      }

      await qc.invalidateQueries({ queryKey: ['inventory', 'equipment'] });
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Kayıt sırasında hata oluştu.',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobilePresentation="sheet" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? isDevice
                ? 'Cihazı Düzenle'
                : 'Yedek Parçayı Düzenle'
              : 'Cihaz veya Yedek Parça Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isDevice
              ? 'Yedek parça ömrü takip edilecek cihaz veya demirbaş bilgilerini girin.'
              : 'Değişimlerde stoktan düşülecek yedek parça veya aksesuar bilgilerini girin.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          schema={equipmentFormSchema}
          methods={methods}
          onSubmit={handleSubmit}
          className="space-y-3"
        >
          <SelectField
            name="kind"
            label="Tür"
            options={[
              { value: 'device', label: 'Cihaz / Demirbaş (Ana Ürün)' },
              { value: 'spare', label: 'Yedek Parça / Aksesuar Stoğu' },
            ]}
          />
          <TextField
            name="name"
            label={isDevice ? 'Cihaz Adı' : 'Yedek Parça Adı'}
            placeholder={
              isDevice
                ? 'Örn. Dikey Süpürge, Su Arıtma Cihazı'
                : 'Örn. HEPA Filtre, Dreame Paspas Bezi'
            }
            required
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              name="categoryId"
              label="Kategori (Opsiyonel)"
              options={[
                { value: '__none__', label: 'Seçilmedi' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <SelectField
              name="locationId"
              label="Konum (Opsiyonel)"
              options={[
                { value: '__none__', label: 'Seçilmedi' },
                ...locations.map((l) => ({
                  value: l.id,
                  label: l.path.join('>'),
                })),
              ]}
            />
          </div>

          {isDevice ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField
                name="status"
                label="Cihaz Durumu"
                options={ITEM_STATUS_OPTIONS}
              />
              <TextField
                name="serialNumber"
                label="Seri No (Opsiyonel)"
                placeholder="Örn. SN-2026-001"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <AmountField name="quantity" label="Stok Miktarı" required />
              <TextField
                name="unit"
                label="Birim"
                placeholder="adet"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <TextField
              name="brand"
              label="Marka (Opsiyonel)"
              placeholder="Örn. Dyson"
            />
            <TextField
              name="model"
              label="Model (Opsiyonel)"
              placeholder="Örn. V10"
            />
          </div>

          <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-border bg-surface-raised/95 pt-2.5 backdrop-blur-md sm:static sm:flex sm:justify-end sm:bg-transparent sm:pt-3 sm:backdrop-blur-none">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Vazgeç
            </Button>
            <SubmitButton
              size="sm"
              isLoading={methods.formState.isSubmitting}
              className="w-full sm:w-auto"
            >
              {isEditing ? 'Değişiklikleri Kaydet' : 'Kaydet'}
            </SubmitButton>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
