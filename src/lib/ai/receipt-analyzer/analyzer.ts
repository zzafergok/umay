import {
  OpenRouterApiError,
  type OpenRouterChatCompletionResponse,
} from '@/lib/ai/openrouter';
import {
  buildModelBatches,
  loadRawModelsSafe,
  requestBatchCompletion,
  resolveMissingPreferredModel,
} from './batch-request';
import {
  deduplicateRawReceiptText,
  deduplicateReceiptItems,
  resolveReceiptImages,
} from './deduplicate';
import { parseReceiptModelResponse } from './parser';
import {
  extractFirstChoicePayload,
  type ExtractedOpenRouterChoice,
} from './response-extract';
import type {
  ReceiptAnalysisResult,
  ReceiptAnalyzeInput,
  ReceiptLineItem,
  ReceiptModelOutput,
} from './schemas';

function buildEnrichedRawText(
  rawText: string,
  items: ReceiptLineItem[],
): string {
  const trimmed = rawText.trim();
  if (items.length === 0) return trimmed;
  const lineCount = trimmed ? trimmed.split(/\r?\n/).length : 0;
  if (lineCount >= items.length) return trimmed;

  const itemLines = items.map((item) => {
    const qtyPart = `${item.quantity} ${item.unit}`;
    const pricePart =
      item.totalPrice !== null ? ` *${item.totalPrice.toFixed(2)}` : '';
    return `${item.name} (${qtyPart})${pricePart}`;
  });
  return trimmed
    ? `${trimmed}\n--- Kalemler (${items.length}) ---\n${itemLines.join('\n')}`
    : itemLines.join('\n');
}

interface CandidateAttempt {
  response: OpenRouterChatCompletionResponse;
  extracted: ExtractedOpenRouterChoice;
  parsed: { data: ReceiptModelOutput; parsedFromJson: boolean };
}

export async function analyzeReceiptImage(
  input: ReceiptAnalyzeInput,
): Promise<ReceiptAnalysisResult> {
  const imageUrls = resolveReceiptImages(input);
  const rawModels = await loadRawModelsSafe();
  const modelMap = new Map(rawModels.map((m) => [m.id, m]));
  if (rawModels.length > 0) {
    await resolveMissingPreferredModel(input.modelId, modelMap);
  }
  const batches = buildModelBatches(rawModels, input.modelId);

  let selected: CandidateAttempt | null = null;
  let fallbackCandidate: CandidateAttempt | null = null;
  let lastError: unknown = null;

  for (const batch of batches) {
    try {
      const candidateResponse = await requestBatchCompletion(
        batch,
        input,
        imageUrls,
        modelMap,
      );
      const candidateExtracted = extractFirstChoicePayload(candidateResponse);
      const rawContent =
        candidateExtracted.contentText ||
        candidateExtracted.reasoning ||
        candidateExtracted.refusal ||
        '';

      if (!rawContent) {
        lastError = new OpenRouterApiError(
          'Model fiş görselinden metin çıktısı üretemedi.',
          502,
          'empty_completion',
        );
        continue;
      }

      const candidateParsed = parseReceiptModelResponse(rawContent);
      const attempt: CandidateAttempt = {
        response: candidateResponse,
        extracted: candidateExtracted,
        parsed: candidateParsed,
      };
      if (!fallbackCandidate) fallbackCandidate = attempt;

      if (!candidateParsed.parsedFromJson && !candidateExtracted.contentText) {
        lastError = new OpenRouterApiError(
          'Model yalnızca tamamlanmamış muhakeme çıktısı döndürdü.',
          502,
          'reasoning_only_incomplete',
        );
        continue;
      }

      selected = attempt;
      break;
    } catch (error) {
      if (
        error instanceof OpenRouterApiError &&
        error.code === 'missing_api_key'
      ) {
        throw error;
      }
      lastError = error;
    }
  }

  const finalAttempt = selected ?? fallbackCandidate;
  if (!finalAttempt) {
    if (lastError instanceof OpenRouterApiError) throw lastError;
    throw new OpenRouterApiError(
      lastError instanceof Error
        ? lastError.message
        : 'OpenRouter modellerinden yanıt alınamadı.',
      502,
      'completion_failed',
    );
  }

  const { response, extracted, parsed } = finalAttempt;
  const { items: deduplicatedItems, deduplicatedCount } =
    imageUrls.length > 1
      ? deduplicateReceiptItems(parsed.data.items)
      : { items: parsed.data.items, deduplicatedCount: 0 };
  const baseRawText =
    imageUrls.length > 1
      ? deduplicateRawReceiptText(parsed.data.rawText)
      : parsed.data.rawText;
  const cleanedRawText = buildEnrichedRawText(baseRawText, deduplicatedItems);
  const fallbackNote =
    !extracted.contentText && (extracted.reasoning || extracted.refusal)
      ? 'Model doğrudan içerik yerine muhakeme/red yanıtı döndürdü; ham çıktı korundu.'
      : parsed.data.notes;

  return {
    ...parsed.data,
    rawText: cleanedRawText,
    items: deduplicatedItems,
    notes: parsed.data.notes ?? fallbackNote,
    modelUsed: response.model || batches[0]?.[0] || 'openrouter/free',
    provider: response.provider,
    usage: response.usage ? { ...response.usage } : undefined,
    parsedFromJson: parsed.parsedFromJson,
    imageCount: imageUrls.length,
    deduplicatedCount,
    completionId: response.id,
    finishReason: extracted.finishReason,
    nativeFinishReason: extracted.nativeFinishReason,
    reasoning: extracted.reasoning,
    refusal: extracted.refusal,
    rawResponse: { ...response },
  };
}
