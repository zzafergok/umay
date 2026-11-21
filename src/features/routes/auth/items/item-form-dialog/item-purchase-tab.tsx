'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import {
  AmountField,
  DateField,
  SelectField,
  TextField,
} from '@/components/forms';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import type { Category } from '@/features/inventory/types';

interface ItemPurchaseTabProps {
  activeCategory?: Category;
  photos: string[];
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
}

const CURRENCY_OPTIONS = [
  { value: 'TRY', label: 'TRY (₺)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
];

export function ItemPurchaseTab({
  activeCategory,
  photos,
  onPhotoUpload,
  onRemovePhoto,
}: ItemPurchaseTabProps) {
  const defaults = activeCategory?.itemDefaults;
  const [deletePhotoIndex, setDeletePhotoIndex] = React.useState<number | null>(
    null,
  );

  return (
    <div className="space-y-2.5 sm:space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <AmountField
          name="purchasePrice"
          label={
            defaults?.trackPurchase
              ? 'Satın Alma Fiyatı (Önerilen)'
              : 'Satın Alma Fiyatı'
          }
          placeholder="0,00"
        />
        <SelectField
          name="currency"
          label="Para Birimi"
          options={CURRENCY_OPTIONS}
        />
        <TextField
          name="store"
          label="Mağaza / Tedarikçi"
          placeholder="Örn. Amazon, Bauhaus"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <DateField
          name="purchaseDate"
          label="Satın Alma Tarihi"
          valueFormat="iso-date"
          placeholder="Tarih seçiniz"
        />
        <DateField
          name="warrantyEndsAt"
          label={
            defaults?.trackWarranty
              ? 'Garanti Bitiş (Önerilen)'
              : 'Garanti Bitiş'
          }
          valueFormat="iso-date"
          placeholder="Tarih seçiniz"
        />
        <DateField
          name="expiresAt"
          label={
            defaults?.trackExpiry
              ? 'Son Kullanma (Önerilen)'
              : 'Son Kullanma (SKT)'
          }
          valueFormat="iso-date"
          placeholder="Tarih seçiniz"
        />
      </div>

      <div className="space-y-2 rounded-md border border-border p-2.5 sm:p-3">
        <Label
          htmlFor="item-photo-upload"
          className="font-mono text-2xs uppercase tracking-wider text-text-muted"
        >
          Ürün Fotoğrafları
        </Label>
        <Input
          id="item-photo-upload"
          type="file"
          accept="image/*"
          onChange={onPhotoUpload}
          className="text-xs"
        />
        {photos.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {photos.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="flex min-h-[40px] items-center gap-1.5 rounded-sm border border-border bg-surface-sunken py-1 pl-2.5 pr-1 text-xs"
              >
                <span>Fotoğraf #{idx + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="h-8 w-8 text-danger/80 hover:bg-danger-subtle hover:text-danger"
                  onClick={() => setDeletePhotoIndex(idx)}
                  aria-label={`Fotoğraf ${idx + 1} kaldır`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted">Henüz fotoğraf eklenmedi.</p>
        )}
      </div>

      <DeleteConfirmationDialog
        open={deletePhotoIndex !== null}
        onOpenChange={(open) => {
          if (!open) setDeletePhotoIndex(null);
        }}
        entityLabel="Fotoğraf"
        itemName={
          deletePhotoIndex !== null ? `Fotoğraf #${deletePhotoIndex + 1}` : ''
        }
        onConfirm={() => {
          if (deletePhotoIndex === null) return;
          onRemovePhoto(deletePhotoIndex);
          setDeletePhotoIndex(null);
        }}
      />
    </div>
  );
}
