import {
  createOpenRouterChatCompletion,
  FALLBACK_VISION_MODEL_IDS,
  fetchOpenRouterModelBySlug,
  fetchOpenRouterModels,
  OpenRouterApiError,
  type OpenRouterChatCompletionResponse,
  type OpenRouterModel,
} from '@/lib/ai/openrouter';
import {
  filterAndSortReceiptModels,
  supportsJsonObject,
} from './model-catalog';
import { parseReceiptModelResponse } from './parser';
import { buildReceiptUserPrompt, RECEIPT_SYSTEM_PROMPT } from './prompt';
import {
  extractFirstChoicePayload,
  type ExtractedOpenRouterChoice,
} from './response-extract';
import type { ReceiptAnalysisResult, ReceiptAnalyzeInput } from './schemas';

const OPENROUTER_MAX_MODELS_PER_REQUEST = 3;
const MAX_FALLBACK_BATCHES = 3;

function chunkModels(ids: string[], size: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}

function buildModelBatches(
  rawModels: OpenRouterModel[],
  preferredModelId?: string,
): string[][] {
  const rankedFreeVisionIds = filterAndSortReceiptModels(rawModels, {
    freeOnly: true,
  }).map((m) => m.id);
  const envDefault = process.env.OPENROUTER_DEFAULT_VISION_MODEL?.trim();

  const candidates = [
    preferredModelId?.trim(),
    envDefault,
    ...rankedFreeVisionIds,
    ...FALLBACK_VISION_MODEL_IDS,
  ].filter((id): id is string => Boolean(id && id.length > 0));

  const uniqueCandidates = Array.from(new Set(candidates));
  return chunkModels(uniqueCandidates, OPENROUTER_MAX_MODELS_PER_REQUEST).slice(
    0,
    MAX_FALLBACK_BATCHES,
  );
}

function shouldRetryWithoutJsonFormat(error: unknown): boolean {
  if (!(error instanceof OpenRouterApiError)) return false;
  if (error.status !== 400 && error.status !== 422) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('response_format') ||
    msg.includes('json_object') ||
    msg.includes('structured') ||
    msg.includes('parameter')
  );
}

async function requestBatchCompletion(
  batch: string[],
  input: ReceiptAnalyzeInput,
  modelMap: Map<string, OpenRouterModel>,
): Promise<OpenRouterChatCompletionResponse> {
  const allSupportJson = batch.every((id) => {
    const model = modelMap.get(id);
    return model ? supportsJsonObject(model) : false;
  });

  const basePayload = {
    ...(batch.length === 1 ? { model: batch[0] } : { models: batch }),
    temperature: 0.1,
    max_tokens: 2400,
    messages: [
      {
        role: 'system' as const,
        content: RECEIPT_SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: buildReceiptUserPrompt(input.promptHint),
          },
          {
            type: 'image_url' as const,
            image_url: {
              url: input.imageDataUrl,
              detail: 'high' as const,
            },
          },
        ],
      },
    ],
  };

  if (!allSupportJson) {
    return createOpenRouterChatCompletion(basePayload);
  }

  try {
    return await createOpenRouterChatCompletion({
      ...basePayload,
      response_format: { type: 'json_object' },
    });
  } catch (error) {
    if (shouldRetryWithoutJsonFormat(error)) {
      return createOpenRouterChatCompletion(basePayload);
    }
    throw error;
  }
}

async function loadRawModelsSafe(): Promise<OpenRouterModel[]> {
  try {
    const response = await fetchOpenRouterModels();
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
}

async function resolveMissingPreferredModel(
  preferredModelId: string | undefined,
  modelMap: Map<string, OpenRouterModel>,
): Promise<void> {
  const trimmed = preferredModelId?.trim();
  if (!trimmed || modelMap.has(trimmed) || !trimmed.includes('/')) return;
  const slashIdx = trimmed.indexOf('/');
  const author = trimmed.slice(0, slashIdx);
  const slug = trimmed.slice(slashIdx + 1);
  if (!author || !slug || slug.includes('/')) return;
  try {
    const res = await fetchOpenRouterModelBySlug(author, slug);
    if (res.data) {
      modelMap.set(trimmed, res.data);
      modelMap.set(res.data.id, res.data);
    }
  } catch {
    // Model detay sorgusu başarısız olursa doğrudan chat isteğiyle devam et.
  }
}

export async function analyzeReceiptImage(
  input: ReceiptAnalyzeInput,
): Promise<ReceiptAnalysisResult> {
  const rawModels = await loadRawModelsSafe();
  const modelMap = new Map(rawModels.map((m) => [m.id, m]));
  if (rawModels.length > 0) {
    await resolveMissingPreferredModel(input.modelId, modelMap);
  }
  const batches = buildModelBatches(rawModels, input.modelId);

  let response: OpenRouterChatCompletionResponse | null = null;
  let extracted: ExtractedOpenRouterChoice | null = null;
  let lastError: unknown = null;

  for (const batch of batches) {
    try {
      const candidateResponse = await requestBatchCompletion(
        batch,
        input,
        modelMap,
      );
      const candidateExtracted = extractFirstChoicePayload(candidateResponse);

      if (
        !candidateExtracted.contentText &&
        !candidateExtracted.reasoning &&
        !candidateExtracted.refusal
      ) {
        lastError = new OpenRouterApiError(
          'Model fiş görselinden metin çıktısı üretemedi.',
          502,
          'empty_completion',
        );
        continue;
      }

      response = candidateResponse;
      extracted = candidateExtracted;
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

  if (!response || !extracted) {
    if (lastError instanceof OpenRouterApiError) {
      throw lastError;
    }
    throw new OpenRouterApiError(
      lastError instanceof Error
        ? lastError.message
        : 'OpenRouter modellerinden yanıt alınamadı.',
      502,
      'completion_failed',
    );
  }

  const rawContent =
    extracted.contentText || extracted.reasoning || extracted.refusal || '';
  const parsed = parseReceiptModelResponse(rawContent);
  const fallbackNote =
    !extracted.contentText && (extracted.reasoning || extracted.refusal)
      ? 'Model doğrudan içerik yerine muhakeme/red yanıtı döndürdü; ham çıktı korundu.'
      : parsed.data.notes;

  return {
    ...parsed.data,
    notes: parsed.data.notes ?? fallbackNote,
    modelUsed: response.model || batches[0]?.[0] || 'openrouter/free',
    provider: response.provider,
    usage: response.usage ? { ...response.usage } : undefined,
    parsedFromJson: parsed.parsedFromJson,
    completionId: response.id,
    finishReason: extracted.finishReason,
    nativeFinishReason: extracted.nativeFinishReason,
    reasoning: extracted.reasoning,
    refusal: extracted.refusal,
    rawResponse: { ...response },
  };
}
