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
import { deduplicateRawReceiptText, resolveReceiptImages } from './deduplicate';
import {
  buildEnrichedRawText,
  finalizeReceiptItems,
  scoreFinalizedReceipt,
  type FinalizedReceipt,
} from './finalize';
import { parseReceiptModelResponse } from './parser';
import {
  extractFirstChoicePayload,
  type ExtractedOpenRouterChoice,
} from './response-extract';
import type {
  ReceiptAnalysisResult,
  ReceiptAnalyzeInput,
  ReceiptModelOutput,
} from './schemas';

/** ARA TOPLAM ile uyuşmayan/kesilen yanıtlarda en fazla kaç farklı model denenir. */
const MAX_SCORED_ATTEMPTS = 3;
/** Tüm analiz için toplam süre bütçesi; istemci zaman aşımından (200 sn) önce bitmeli. */
export const RECEIPT_ANALYSIS_BUDGET_MS = 170_000;
/** Tek bir model çağrısı için üst sınır (büyük modeller 2 görselde 60–110 sn sürebilir). */
const MAX_SINGLE_CALL_MS = 120_000;
/** Kalan süre bundan azsa yeni model denenmez. */
const MIN_ATTEMPT_MS = 25_000;
/** Doğrulama amaçlı ek deneme için gereken asgari kalan süre. */
const MIN_RETRY_MS = 60_000;

interface CandidateAttempt {
  response: OpenRouterChatCompletionResponse;
  extracted: ExtractedOpenRouterChoice;
  parsed: { data: ReceiptModelOutput; parsedFromJson: boolean };
  finalized: FinalizedReceipt;
  score: number;
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

  let best: CandidateAttempt | null = null;
  let fallbackCandidate: CandidateAttempt | null = null;
  let preferredFallbackNote: string | null = null;
  let scoredAttempts = 0;
  let lastError: unknown = null;
  const deadline = Date.now() + RECEIPT_ANALYSIS_BUDGET_MS;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
    const batch = batches[batchIndex]!;
    const isPreferredBatch = Boolean(input.modelId && batchIndex === 0);
    const remainingMs = deadline - Date.now();
    if (remainingMs < (best ? MIN_RETRY_MS : MIN_ATTEMPT_MS)) break;
    try {
      const candidateResponse = await requestBatchCompletion(
        batch,
        input,
        imageUrls,
        modelMap,
        Math.min(remainingMs, MAX_SINGLE_CALL_MS),
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
        if (isPreferredBatch) {
          preferredFallbackNote = `${input.modelId} boş yanıt döndürdüğü için yedek modele geçildi.`;
        }
        continue;
      }

      const candidateParsed = parseReceiptModelResponse(rawContent);
      const finalized = finalizeReceiptItems(
        candidateParsed.data,
        imageUrls.length,
      );
      const attempt: CandidateAttempt = {
        response: candidateResponse,
        extracted: candidateExtracted,
        parsed: candidateParsed,
        finalized,
        score: scoreFinalizedReceipt(
          finalized,
          candidateExtracted.finishReason,
          candidateExtracted.nativeFinishReason,
        ),
      };
      if (!fallbackCandidate) fallbackCandidate = attempt;

      if (!candidateParsed.parsedFromJson && !candidateExtracted.contentText) {
        lastError = new OpenRouterApiError(
          'Model yalnızca tamamlanmamış muhakeme çıktısı döndürdü.',
          502,
          'reasoning_only_incomplete',
        );
        if (isPreferredBatch) {
          preferredFallbackNote = `${input.modelId} eksik yanıt döndürdüğü için yedek modele geçildi.`;
        }
        continue;
      }

      scoredAttempts += 1;
      const skipsMultiImageItems =
        best &&
        imageUrls.length > 1 &&
        best.finalized.items.length > attempt.finalized.items.length;
      if (!best || (!skipsMultiImageItems && attempt.score < best.score)) {
        best = attempt;
      }
      // Sağlam (doğrulanmış/kesilmemiş) yanıt bulunduysa dur; aksi halde başka model dene.
      if (attempt.score === 0 || scoredAttempts >= MAX_SCORED_ATTEMPTS) break;
    } catch (error) {
      if (
        error instanceof OpenRouterApiError &&
        error.code === 'missing_api_key'
      ) {
        throw error;
      }
      if (isPreferredBatch) {
        const reason =
          error instanceof Error ? error.message : 'Bilinmeyen hata';
        preferredFallbackNote = `${input.modelId} hatası (${reason}) nedeniyle yedek modele geçildi.`;
      }
      lastError = error;
    }
  }

  const finalAttempt = best ?? fallbackCandidate;
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

  const { response, extracted, parsed, finalized } = finalAttempt;
  const baseRawText =
    imageUrls.length > 1
      ? deduplicateRawReceiptText(parsed.data.rawText)
      : parsed.data.rawText;
  const cleanedRawText = buildEnrichedRawText(baseRawText, finalized.items);
  const fallbackNote =
    !extracted.contentText && (extracted.reasoning || extracted.refusal)
      ? 'Model doğrudan içerik yerine muhakeme/red yanıtı döndürdü; ham çıktı korundu.'
      : preferredFallbackNote && response.model !== input.modelId
        ? preferredFallbackNote
        : parsed.data.notes;

  return {
    ...parsed.data,
    rawText: cleanedRawText,
    items: finalized.items,
    grandTotal: finalized.grandTotal,
    taxTotal: finalized.taxTotal,
    totalsCheck: finalized.totalsCheck,
    notes: parsed.data.notes ?? fallbackNote,
    modelUsed: response.model || batches[0]?.[0] || 'openrouter/free',
    provider: response.provider,
    usage: response.usage ? { ...response.usage } : undefined,
    parsedFromJson: parsed.parsedFromJson,
    imageCount: imageUrls.length,
    deduplicatedCount: finalized.deduplicatedCount,
    completionId: response.id,
    finishReason: extracted.finishReason,
    nativeFinishReason: extracted.nativeFinishReason,
    reasoning: extracted.reasoning,
    refusal: extracted.refusal,
    rawResponse: { ...response },
  };
}
