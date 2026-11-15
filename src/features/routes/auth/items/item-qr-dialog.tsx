'use client';

import * as React from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/core/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';

interface ItemQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemName: string;
}

export function ItemQrDialog({
  open,
  onOpenChange,
  itemId,
  itemName,
}: ItemQrDialogProps) {
  const [qrDataUrl, setQrDataUrl] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(`umay:item:${itemId}`, { width: 220, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [open, itemId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>QR Etiket — {itemName}</DialogTitle>
        </DialogHeader>
        {qrDataUrl ? (
          <div className="flex flex-col items-center gap-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`${itemName} QR kodu`}
              className="h-48 w-48 rounded-sm border border-border bg-white p-2"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              Etiketi Yazdır
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
