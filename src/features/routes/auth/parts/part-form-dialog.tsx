'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/core/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { toast } from '@/components/core/toast';
import {
  AmountField,
  DateField,
  Form,
  SelectField,
  SubmitButton,
  TextField,
} from '@/components/forms';
import type { Item } from '@/features/inventory/types';
import { parseAmountInput } from '@/lib/utils';
import { inventoryService } from '@/services/inventory-service';
import { partFormSchema, type PartFormValues } from './part-form-schema';

interface PartFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Item[];
}

function getDefaultValues(): PartFormValues {
  return {
    name: '',
    parentItemId: '__none__',
    spareItemId: '__none__',
    mode: 'time',
    days: 180,
    usageLimit: 1000,
    usageUnit: 'litre',
    installedDate: new Date().toISOString().slice(0, 10),
  };
}

export function PartFormDialog({
  open,
  onOpenChange,
  items,
}: PartFormDialogProps) {
  const qc = useQueryClient();
  const methods = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: getDefaultValues(),
  });

  React.useEffect(() => {
    if (open) methods.reset(getDefaultValues());
  }, [open, methods]);

  const mode = useWatch({ control: methods.control, name: 'mode' });

  const parentOptions = [
    { value: '__none__', label: 'Bağımsız' },
    ...items.map((item) => ({ value: item.id, label: item.name })),
  ];
  const spareOptions = [
    { value: '__none__', label: 'Yedek Bağlı Değil' },
    ...items.map((item) => ({
      value: item.id,
      label: `${item.name} (${item.quantity})`,
    })),
  ];

  const handleSubmit = async (values: PartFormValues) => {
    try {
      const showTime = values.mode === 'time' || values.mode === 'both';
      const showUsage = values.mode === 'usage' || values.mode === 'both';

      await inventoryService.createPart({
        name: values.name.trim(),
        parentItemId:
          values.parentItemId === '__none__' ? null : values.parentItemId,
        spareItemId:
          values.spareItemId === '__none__' ? null : values.spareItemId,
        lifespan: {
          mode: values.mode,
          days: showTime ? parseAmountInput(values.days ?? 180) : undefined,
          usageUnit: showUsage
            ? values.usageUnit?.trim() || 'birim'
            : undefined,
          usageLimit: showUsage
            ? parseAmountInput(values.usageLimit ?? 1000)
            : undefined,
        },
        installedAt: new Date(
          `${values.installedDate}T12:00:00.000Z`,
        ).toISOString(),
        usageCurrent: 0,
        notes: '',
      });
      await qc.invalidateQueries({ queryKey: ['inventory', 'parts'] });
      toast.success('Ömürlü parça eklendi.');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Parça eklenemedi.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobilePresentation="sheet" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Ömürlü Parça</DialogTitle>
        </DialogHeader>

        <Form
          schema={partFormSchema}
          methods={methods}
          onSubmit={handleSubmit}
          className="min-w-0 space-y-2.5 sm:space-y-4"
        >
          <TextField
            name="name"
            label="Parça Adı"
            placeholder="Örn. Su Arıtma Karbon Filtresi"
            required
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              name="parentItemId"
              label="Ana Ürün"
              options={parentOptions}
            />
            <SelectField
              name="spareItemId"
              label="Stoktaki Yedek"
              options={spareOptions}
            />
          </div>

          <SelectField
            name="mode"
            label="Ömür Modu"
            options={[
              { value: 'time', label: 'Zamana Göre (Gün)' },
              { value: 'usage', label: 'Kullanıma Göre' },
              { value: 'both', label: 'İkisi Birden (Hangisi Önce)' },
            ]}
          />

          {(mode === 'time' || mode === 'both') && (
            <AmountField name="days" label="Ömür (Gün)" required />
          )}

          {(mode === 'usage' || mode === 'both') && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AmountField name="usageLimit" label="Kullanım Limiti" required />
              <TextField
                name="usageUnit"
                label="Birim"
                placeholder="litre / baskı / saat"
              />
            </div>
          )}

          <DateField
            name="installedDate"
            label="Takılma Tarihi"
            valueFormat="iso-date"
            required
          />

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
              Parçayı Kaydet
            </SubmitButton>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
