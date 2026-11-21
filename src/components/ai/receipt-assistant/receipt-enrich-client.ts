import type { ReceiptAnalysisResult } from '@/lib/ai/receipt-analyzer';
import { aiReceiptService } from '@/services/ai-receipt-service';

const MAX_ENRICH_ITEMS = 150;

/**
 * Fiş okuma yanıtından sonra ürün adı/kategori düzenlemesini ayrı (kısa) bir istekle yapar.
 * Başarısız olursa okunan ham kalemler korunur; analiz sonucu asla kaybolmaz.
 */
export async function enrichAnalysisItems(
  analysis: ReceiptAnalysisResult,
): Promise<{ analysis: ReceiptAnalysisResult; failed: boolean }> {
  if (analysis.items.length === 0) return { analysis, failed: false };

  try {
    const { items: enriched } = await aiReceiptService.enrichReceipt({
      names: analysis.items.slice(0, MAX_ENRICH_ITEMS).map((item) => item.name),
      modelId: analysis.modelUsed || undefined,
    });
    return {
      analysis: {
        ...analysis,
        items: analysis.items.map((item, index) => {
          const suggestion = enriched[index];
          if (!suggestion) return item;
          return {
            ...item,
            normalizedName: suggestion.normalizedName || item.normalizedName,
            categoryHint: suggestion.categoryHint ?? item.categoryHint,
          };
        }),
      },
      failed: false,
    };
  } catch {
    return { analysis, failed: true };
  }
}
