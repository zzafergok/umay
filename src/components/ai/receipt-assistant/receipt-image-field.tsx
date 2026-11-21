'use client';

import * as React from 'react';
import { ImagePlus, Plus, Trash2, Upload, X } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import { MAX_RECEIPT_IMAGES } from '@/lib/ai/receipt-analyzer';
import type { ReceiptImageEntry } from './types';

interface ReceiptImageFieldProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  images: ReceiptImageEntry[];
  isAnalyzing?: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (id: string) => void;
  onClearAll: () => void;
}

export function ReceiptImageField({
  fileInputRef,
  images,
  isAnalyzing = false,
  onFileChange,
  onRemoveImage,
  onClearAll,
}: ReceiptImageFieldProps) {
  const imageCount = images.length;
  const isFull = imageCount >= MAX_RECEIPT_IMAGES;
  const triggerPicker = () => {
    if (!isFull && !isAnalyzing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="receipt-image-input" className="block">
            Fiş Görselleri
          </Label>
          <Badge
            variant="secondary"
            size="sm"
            className="font-mono text-[10px] tabular-nums"
          >
            {imageCount}/{MAX_RECEIPT_IMAGES} parça
          </Badge>
        </div>

        {imageCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={isAnalyzing}
            onClick={onClearAll}
            className="text-text-muted hover:text-danger h-6 px-1.5 text-[11px]"
          >
            <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" />
            Temizle
          </Button>
        ) : null}
      </div>

      <Input
        ref={fileInputRef}
        id="receipt-image-input"
        type="file"
        accept="image/*"
        multiple
        tabIndex={-1}
        hidden
        aria-hidden="true"
        className="hidden"
        onChange={onFileChange}
      />

      {imageCount === 0 ? (
        <Button
          type="button"
          variant="outline"
          aria-controls="receipt-image-input"
          onClick={triggerPicker}
          className="bg-surface-sunken/45 hover:border-accent/60 hover:bg-surface-sunken/80 group h-auto min-h-[68px] w-full justify-between gap-3 whitespace-normal rounded-xl border-dashed border-border-strong px-3.5 py-3 font-normal transition-colors md:h-auto md:min-h-[64px]"
        >
          <span className="flex min-w-0 flex-1 items-center gap-3">
            <span className="bg-surface text-accent group-hover:border-accent/40 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border transition-colors">
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="text-text block text-xs font-medium sm:text-sm">
                Fiş fotoğraflarını yükleyin
              </span>
              <span className="text-text-muted mt-0.5 block text-[11px] leading-snug">
                Uzun fişleri parça parça seçebilirsiniz (PNG, JPG, WebP)
              </span>
            </span>
          </span>
          <span className="bg-surface text-text-muted group-hover:text-text inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors">
            <Upload className="h-3 w-3" aria-hidden="true" />
            Görsel Seç
          </span>
        </Button>
      ) : (
        <div className="bg-surface-sunken/40 rounded-xl border border-border p-2.5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="bg-surface group relative flex items-center gap-2.5 rounded-lg border border-border p-1.5 pr-7 transition-colors hover:border-border-strong"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.dataUrl}
                    alt={`Fiş parçası ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="bg-text/80 text-bg absolute bottom-0 left-0 rounded-tr-sm px-1 font-mono text-[9px] font-semibold leading-tight">
                    #{idx + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-text text-xs font-semibold leading-tight">
                    {idx + 1}. Parça
                  </p>
                  <p
                    className="text-text-muted mt-0.5 truncate text-[11px]"
                    title={img.name}
                  >
                    {img.name}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={isAnalyzing}
                  onClick={() => onRemoveImage(img.id)}
                  aria-label={`${idx + 1}. fiş görselini kaldır`}
                  className="text-text-muted hover:bg-danger-subtle hover:text-danger absolute right-1 top-1 size-6 rounded-md"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            ))}

            {!isFull ? (
              <Button
                type="button"
                variant="outline"
                disabled={isAnalyzing}
                onClick={triggerPicker}
                className="bg-surface/60 hover:border-accent/60 hover:bg-surface text-text-muted hover:text-accent h-auto min-h-[56px] w-full flex-col items-center justify-center gap-1 rounded-lg border-dashed border-border-strong px-2 py-2 text-xs font-medium transition-colors md:h-auto md:min-h-[56px]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Parça Ekle</span>
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
