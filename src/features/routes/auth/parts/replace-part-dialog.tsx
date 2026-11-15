'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import { Button } from '@/components/core/button';
import { toast } from '@/components/core/toast';
import type { Part } from '@/features/inventory/types';
import { useReplacePartMutation } from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import { useQueryClient } from '@tanstack/react-query';

interface ReplacePartDialogProps {
  part: Part | null;
  onClose: () => void;
}

export function ReplacePartDialog({ part, onClose }: ReplacePartDialogProps) {
  const qc = useQueryClient();
  const [cost, setCost] = React.useState('');
  const [note, setNote] = React.useState('');
  const [dateStr, setDateStr] = React.useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const replaceMutation = useReplacePartMutation(part?.id ?? '');

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!part) return;
    try {
      const result = await replaceMutation.mutateAsync({
        replacedAt: new Date(`${dateStr}T12:00:00.000Z`).toISOString(),
        cost: cost ? Number(cost) : undefined,
        note: note.trim() || undefined,
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
        toast.info('Yedek stok azaldığı için alışveriş listesine öneri eklendi.');
      }

      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Değişim kaydedilemedi.');
    }
  };

  return (
    <Dialog open={Boolean(part)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Parça Değiştirildi — {part?.name}</DialogTitle>
          <DialogDescription>
            Onayladığında ömür sıfırlanır, değişim günlüğüne yazılır ve bağlı
            yedek varsa stoktan 1 düşülür.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleConfirm} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="replace-date">Değişim Tarihi</Label>
            <Input
              id="replace-date"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="replace-cost">Maliyet (TRY, opsiyonel)</Label>
            <Input
              id="replace-cost"
              type="number"
              min={0}
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="Örn. 450"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="replace-note">Not (opsiyonel)</Label>
            <Input
              id="replace-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn. Orijinal filtre takıldı"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={replaceMutation.isPending}>
              {replaceMutation.isPending ? 'Kaydediliyor...' : 'Onayla'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
