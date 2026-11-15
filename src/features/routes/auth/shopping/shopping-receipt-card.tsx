'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ReceiptAssistant } from '@/components/ai/receipt-assistant';
import { toast } from '@/components/core/toast';
import type { ReceiptLineItem } from '@/lib/ai/receipt-analyzer';
import { inventoryService } from '@/services/inventory-service';

export function ShoppingReceiptCard() {
  const qc = useQueryClient();

  const handleApplyItems = async (items: ReceiptLineItem[]) => {
    try {
      await Promise.all(
        items.map((item) =>
          inventoryService.createShopping({
            itemId: null,
            freeText: item.normalizedName || item.name,
            qty: Math.max(1, Math.round(item.quantity || 1)),
            unit: item.unit || 'adet',
            source: 'manual',
            done: false,
          }),
        ),
      );
      await qc.invalidateQueries({ queryKey: ['inventory', 'shopping'] });
      toast.success(`${items.length} ürün alışveriş listesine eklendi.`);
    } catch {
      toast.error('Fiş ürünleri listeye eklenirken hata oluştu.');
    }
  };

  return (
    <ReceiptAssistant
      onApplyItems={handleApplyItems}
      applyLabel="Seçilenleri Alışveriş Listesine Ekle"
    />
  );
}
