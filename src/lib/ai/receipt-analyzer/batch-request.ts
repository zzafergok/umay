import {
  createOpenRouterChatCompletion,
  FALLBACK_VISION_MODEL_IDS,
  fetchOpenRouterModelBySlug,
  fetchOpenRouterModels,
  OpenRouterApiError,
  type OpenRouterChatCompletionResponse,
  type OpenRouterModel,
  type OpenRouterReasoningConfig,
} from '@/lib/ai/openrouter';
import {
  filterAndSortReceiptModels,
  isFreeOpenRouterModel,
  isRouterModelId,
  supportsJsonObject,
  supportsReasoningOutput,
} from './model-catalog';
import { buildReceiptUserPrompt, RECEIPT_SYSTEM_PROMPT } from './prompt';
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

function isMandatoryReasoningModel(batch: string[]): boolean {
  return batch.some((id) => id.startsWith('google/gemini-4'));
}

function buildReasoningConfig(
  batch: string[],
  anySupportsReasoning: boolean,
): OpenRouterReasoningConfig | undefined {
  if (!anySupportsReasoning) return undefined;
  if (isMandatoryReasoningModel(batch)) {
    return { effort: 'low' };
  }
  return { enabled: false };
}

function shouldRetryWithLowReasoning(error: unknown): boolean {
  if (!(error instanceof OpenRouterApiError)) return false;
  if (error.status !== 400 && error.status !== 422) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('reasoning') && msg.includes('mandatory');
}

function shouldRetryWithBasicPayload(error: unknown): boolean {
  if (!(error instanceof OpenRouterApiError)) return false;
  if (error.status !== 400 && error.status !== 422) return false;
  const msg = error.message.toLowerCase();
  return [
    'response_format',
    'json_object',
    'structured',
    'reasoning',
    'max_tokens',
    'parameter',
  ].some((token) => msg.includes(token));
}

export async function requestBatchCompletion(
  batch: string[],
  input: ReceiptAnalyzeInput,
  imageUrls: string[],
  modelMap: Map<string, OpenRouterModel>,
): Promise<OpenRouterChatCompletionResponse> {
  const allSupportJson = batch.every((id) => {
    const model = modelMap.get(id);
    return model ? supportsJsonObject(model) : false;
  });
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
    temperature: 0.1,
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

  const reasoningConfig = buildReasoningConfig(batch, anySupportsReasoning);
  if (!allSupportJson && !reasoningConfig) {
    return createOpenRouterChatCompletion(basePayload);
  }

  try {
    return await createOpenRouterChatCompletion({
      ...basePayload,
      ...(allSupportJson
        ? { response_format: { type: 'json_object' as const } }
        : {}),
      ...(reasoningConfig ? { reasoning: reasoningConfig } : {}),
    });
  } catch (error) {
    if (shouldRetryWithLowReasoning(error)) {
      return createOpenRouterChatCompletion({
        ...basePayload,
        ...(allSupportJson
          ? { response_format: { type: 'json_object' as const } }
          : {}),
        reasoning: { effort: 'low' },
      });
    }
    if (shouldRetryWithBasicPayload(error)) {
      return createOpenRouterChatCompletion({
        ...basePayload,
        max_tokens: imageUrls.length > 1 ? 6144 : 4096,
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
