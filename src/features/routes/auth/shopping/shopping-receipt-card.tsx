'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ReceiptAssistant } from '@/components/ai/receipt-assistant';
import { toast } from '@/components/core/toast';
import type { OpenRouterModelsQueryParams } from '@/lib/ai/openrouter';
import type {
  ReceiptAnalysisResult,
  ReceiptLineItem,
} from '@/lib/ai/receipt-analyzer';
import { inventoryService } from '@/services/inventory-service';
import { formatShoppingUnit } from './shopping-utils';

const SHOPPING_VISION_TEXT_MODEL_QUERY: OpenRouterModelsQueryParams = {
  input_modalities: 'text,image',
  output_modalities: 'text',
  endpoints: '/api/v1/chat/completions',
};

function resolveUnitPrice(item: ReceiptLineItem): number | undefined {
  if (typeof item.unitPrice === 'number' && item.unitPrice > 0) {
    return Number(item.unitPrice.toFixed(2));
  }
  if (
    typeof item.totalPrice === 'number' &&
    item.totalPrice > 0 &&
    item.quantity > 0
  ) {
    return Number((item.totalPrice / item.quantity).toFixed(2));
  }
  return undefined;
}

export function ShoppingReceiptCard({
  listId,
  onApplied,
  embedded = false,
}: {
  listId?: string;
  onApplied?: () => void;
  embedded?: boolean;
}) {
  const qc = useQueryClient();

  const handleApplyItems = async (
    items: ReceiptLineItem[],
    analysis: ReceiptAnalysisResult,
  ) => {
    if (items.length === 0) return;
    const targetListId = listId && listId !== 'unassigned' ? listId : undefined;
    const store = analysis.merchantName?.trim() || undefined;
    try {
      await inventoryService.createShoppingBulk(
        items.map((item) => ({
          listId: targetListId,
          itemId: null,
          freeText: item.normalizedName || item.name,
          qty: item.quantity > 0 ? Number(item.quantity.toFixed(3)) : 1,
          unit: formatShoppingUnit(item.unit),
          category: item.categoryHint?.trim() || undefined,
          priority: 'normal',
          estimatedPrice: resolveUnitPrice(item),
          store,
          source: 'receipt_ai',
          done: false,
        })),
      );
      await qc.invalidateQueries({ queryKey: ['inventory', 'shopping'] });
      toast.success(`${items.length} ürün alışveriş listesine eklendi.`);
      onApplied?.();
    } catch {
      toast.error('Fiş ürünleri listeye eklenirken hata oluştu.');
    }
  };

  return (
    <ReceiptAssistant
      onApplyItems={handleApplyItems}
      applyLabel="Seçilenleri Alışveriş Listesine Ekle"
      modelQuery={SHOPPING_VISION_TEXT_MODEL_QUERY}
      defaultFreeOnly
      embedded={embedded}
    />
  );
}
