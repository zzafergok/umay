'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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
  DateField,
  Form,
  SubmitButton,
  TextField,
} from '@/components/forms';
import type { Part } from '@/features/inventory/types';
import { useReplacePartMutation } from '@/hooks/use-inventory-hooks';
import { parseAmountInput } from '@/lib/utils';
import { inventoryService } from '@/services/inventory-service';
import { replacePartSchema, type ReplacePartValues } from './part-form-schema';

interface ReplacePartDialogProps {
  part: Part | null;
  onClose: () => void;
}

function getDefaultValues(): ReplacePartValues {
  return {
    dateStr: new Date().toISOString().slice(0, 10),
    cost: '',
    note: '',
  };
}

export function ReplacePartDialog({ part, onClose }: ReplacePartDialogProps) {
  const qc = useQueryClient();
  const replaceMutation = useReplacePartMutation(part?.id ?? '');
  const methods = useForm<ReplacePartValues>({
    resolver: zodResolver(replacePartSchema),
    defaultValues: getDefaultValues(),
  });

  React.useEffect(() => {
    if (part) methods.reset(getDefaultValues());
  }, [part, methods]);

  const handleConfirm = async (values: ReplacePartValues) => {
    if (!part) return;
    try {
      const parsedCost =
        values.cost !== undefined && values.cost !== ''
          ? parseAmountInput(values.cost)
          : undefined;

      const result = await replaceMutation.mutateAsync({
        replacedAt: new Date(`${values.dateStr}T12:00:00.000Z`).toISOString(),
        cost: parsedCost && parsedCost > 0 ? parsedCost : undefined,
        note: values.note.trim() || undefined,
        deductSpare: true,
      });

      toast.success(
        result.spareDeducted
          ? `${part.name} değiştirildi ve yedek stoktan 1 düşüldü.`
          : `${part.name} değişimi kaydedildi.`,
      );

      if (result.suggestShopping && part.spareItemId) {
        await inventoryService.createShopping({
          itemId: part.spareItemId,
          freeText: `${part.name} Yedeği`,
          qty: 1,
          unit: 'adet',
          source: 'auto_part_due',
          done: false,
        });
        await qc.invalidateQueries({ queryKey: ['inventory', 'shopping'] });
        toast.info(
          'Yedek stok azaldığı için alışveriş listesine öneri eklendi.',
        );
      }

      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Değişim kaydedilemedi.',
      );
    }
  };

  return (
    <Dialog open={Boolean(part)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent mobilePresentation="sheet" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Parça Değiştirildi — {part?.name}</DialogTitle>
          <DialogDescription>
            Onayladığında ömür sıfırlanır, değişim günlüğüne yazılır ve bağlı
            yedek varsa stoktan 1 düşülür.
          </DialogDescription>
        </DialogHeader>

        <Form
          schema={replacePartSchema}
          methods={methods}
          onSubmit={handleConfirm}
          className="space-y-4"
        >
          <DateField
            name="dateStr"
            label="Değişim Tarihi"
            valueFormat="iso-date"
            required
          />
          <AmountField
            name="cost"
            label="Maliyet (TRY, opsiyonel)"
            placeholder="Örn. 450"
          />
          <TextField
            name="note"
            label="Not (opsiyonel)"
            placeholder="Örn. Orijinal filtre takıldı"
          />
          <div className="bg-surface-raised/95 sticky bottom-0 grid grid-cols-2 gap-2 border-t border-border pt-2.5 backdrop-blur-md sm:static sm:flex sm:justify-end sm:bg-transparent sm:pt-3 sm:backdrop-blur-none">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <SubmitButton
              size="sm"
              isLoading={replaceMutation.isPending}
              className="w-full sm:w-auto"
            >
              Onayla
            </SubmitButton>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
