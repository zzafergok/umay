'use client';

import * as React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import { cn } from '@/lib/utils';

interface ReceiptImageFieldProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileName: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ReceiptImageField({
  fileInputRef,
  fileName,
  onFileChange,
}: ReceiptImageFieldProps) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor="receipt-image-input" className="block">
        Fiş Görseli
      </Label>
      <Input
        ref={fileInputRef}
        id="receipt-image-input"
        type="file"
        accept="image/*"
        capture="environment"
        tabIndex={-1}
        hidden
        aria-hidden="true"
        className="hidden"
        onChange={onFileChange}
      />
      <Button
        type="button"
        variant="outline"
        aria-controls="receipt-image-input"
        aria-label={`Fiş Görseli: ${fileName || 'Fiş fotoğrafı seçin veya çekin'}`}
        onClick={() => fileInputRef.current?.click()}
        className="bg-surface-sunken hover:bg-surface-sunken/80 h-auto min-h-[44px] w-full justify-between gap-2 whitespace-normal px-3 py-2 font-normal"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <Upload
            className="text-text-muted h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <span
            className={cn(
              'text-body break-words text-left leading-snug',
              fileName ? 'text-text' : 'text-text-subtle',
            )}
          >
            {fileName || 'Fiş fotoğrafı seçin veya çekin'}
          </span>
        </span>
        <span className="rounded-xs bg-surface text-text-muted shrink-0 whitespace-nowrap border border-border px-2 py-0.5 font-mono text-2xs">
          {fileName ? 'Değiştir' : 'Dosya Seç'}
        </span>
      </Button>
    </div>
  );
}
