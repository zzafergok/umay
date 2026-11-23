import {
  createOpenRouterChatCompletion,
  FALLBACK_VISION_MODEL_IDS,
  fetchOpenRouterModelBySlug,
  fetchOpenRouterModels,
  type OpenRouterChatCompletionResponse,
  type OpenRouterModel,
} from '@/lib/ai/openrouter';
import {
  filterAndSortReceiptModels,
  isFreeOpenRouterModel,
  isRouterModelId,
  supportsReasoningOutput,
} from './model-catalog';
import { buildReceiptUserPrompt, RECEIPT_SYSTEM_PROMPT } from './prompt';
import {
  buildReasoningConfig,
  isRetryableParamError,
  isStructuredSchemaError,
  pickLowestMandatoryEffort,
  selectResponseFormat,
  shouldRetryWithBasicPayload,
  supportsTemperature,
} from './request-options';
import type { ReceiptAnalyzeInput } from './schemas';

const OPENROUTER_MAX_MODELS_PER_REQUEST = 3;
const MAX_FALLBACK_BATCHES = 3;

export function buildModelBatches(
  rawModels: OpenRouterModel[],
  preferredModelId?: string,
): string[][] {
  const rankedFreeVisionIds = filterAndSortReceiptModels(rawModels, {
    freeOnly: true,
  }).map((m) => m.id);
  const envDefault = process.env.OPENROUTER_DEFAULT_VISION_MODEL?.trim();
  const preferred = preferredModelId?.trim();

  const fallbackPool = Array.from(
    new Set(
      [envDefault, ...rankedFreeVisionIds, ...FALLBACK_VISION_MODEL_IDS].filter(
        (id): id is string => Boolean(id && id.length > 0 && id !== preferred),
      ),
    ),
  );
  const concretePool = fallbackPool.filter((id) => !isRouterModelId(id));
  const routerPool = fallbackPool.filter((id) => isRouterModelId(id));

  const fallbackBatches: string[][] = [];
  for (
    let i = 0;
    i < concretePool.length && fallbackBatches.length < MAX_FALLBACK_BATCHES;
    i += OPENROUTER_MAX_MODELS_PER_REQUEST
  ) {
    fallbackBatches.push(
      concretePool.slice(i, i + OPENROUTER_MAX_MODELS_PER_REQUEST),
    );
  }
  if (fallbackBatches.length < MAX_FALLBACK_BATCHES && routerPool[0]) {
    fallbackBatches.push([routerPool[0]]);
  }
  return preferred ? [[preferred], ...fallbackBatches] : fallbackBatches;
}

export async function requestBatchCompletion(
  batch: string[],
  input: ReceiptAnalyzeInput,
  imageUrls: string[],
  modelMap: Map<string, OpenRouterModel>,
  timeoutMs?: number,
): Promise<OpenRouterChatCompletionResponse> {
  const call = (
    payload: Parameters<typeof createOpenRouterChatCompletion>[0],
  ) => createOpenRouterChatCompletion(payload, { timeoutMs });

  const anySupportsReasoning = batch.some((id) => {
    const model = modelMap.get(id);
    return model ? supportsReasoningOutput(model) : false;
  });
  const allFree = batch.every((id) => {
    const model = modelMap.get(id);
    return model ? isFreeOpenRouterModel(model) : id.endsWith(':free');
  });

  const defaultMaxTokens = allFree
    ? imageUrls.length > 1
      ? 12000
      : 8192
    : imageUrls.length > 1
      ? 8192
      : 5000;

  const basePayload = {
    ...(batch.length === 1 ? { model: batch[0] } : { models: batch }),
    ...(supportsTemperature(batch, modelMap) ? { temperature: 0.1 } : {}),
    max_tokens: defaultMaxTokens,
    messages: [
      { role: 'system' as const, content: RECEIPT_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: buildReceiptUserPrompt(input.promptHint, imageUrls.length),
          },
          ...imageUrls.map((url) => ({
            type: 'image_url' as const,
            image_url: { url, detail: 'high' as const },
          })),
        ],
      },
    ],
  };

  const reasoningConfig = buildReasoningConfig(
    batch,
    modelMap,
    anySupportsReasoning,
  );
  const { primary: responseFormat, supportsJsonObject: canUseJsonObject } =
    selectResponseFormat(batch, modelMap);

  if (!responseFormat && !reasoningConfig) {
    return call(basePayload);
  }

  try {
    return await call({
      ...basePayload,
      ...(responseFormat ? { response_format: responseFormat } : {}),
      ...(reasoningConfig ? { reasoning: reasoningConfig } : {}),
    });
  } catch (error) {
    if (!isRetryableParamError(error)) throw error;
    const msg = error.message.toLowerCase();

    if (msg.includes('reasoning') && msg.includes('mandatory')) {
      return call({
        ...basePayload,
        ...(responseFormat ? { response_format: responseFormat } : {}),
        reasoning: { effort: pickLowestMandatoryEffort(batch, modelMap) },
      });
    }

    if (
      responseFormat?.type === 'json_schema' &&
      isStructuredSchemaError(error) &&
      canUseJsonObject
    ) {
      return call({
        ...basePayload,
        response_format: { type: 'json_object' },
        ...(reasoningConfig ? { reasoning: reasoningConfig } : {}),
      });
    }

    if (shouldRetryWithBasicPayload(error)) {
      const keepReasoning = !msg.includes('reasoning') && reasoningConfig;
      return call({
        ...(batch.length === 1 ? { model: batch[0] } : { models: batch }),
        max_tokens: imageUrls.length > 1 ? 6144 : 4096,
        messages: basePayload.messages,
        ...(keepReasoning ? { reasoning: reasoningConfig } : {}),
      });
    }
    throw error;
  }
}

export async function loadRawModelsSafe(): Promise<OpenRouterModel[]> {
  try {
    const response = await fetchOpenRouterModels();
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
}

export async function resolveMissingPreferredModel(
  preferredModelId: string | undefined,
  modelMap: Map<string, OpenRouterModel>,
): Promise<void> {
  const trimmed = preferredModelId?.trim();
  if (!trimmed || modelMap.has(trimmed) || !trimmed.includes('/')) return;
  const [author, slug, extra] = trimmed.split('/');
  if (!author || !slug || extra) return;
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
