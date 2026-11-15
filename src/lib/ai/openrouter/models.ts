import {
  FALLBACK_FREE_VISION_MODELS,
  OPENROUTER_API_BASE_URL,
  OPENROUTER_DEFAULT_VISION_MODEL,
  OPENROUTER_MODELS_CACHE_TTL_MS,
  OPENROUTER_MODELS_PATH,
} from './constants';
import type {
  OpenRouterFreeVisionModel,
  OpenRouterModel,
  OpenRouterModelsResponse,
} from './types';

let cachedModels: {
  expiresAt: number;
  items: OpenRouterFreeVisionModel[];
} | null = null;

const EXCLUDED_MODEL_IDS = new Set([
  'google/lyria-3-pro-preview',
  'google/lyria-3-clip-preview',
]);

export function isFreeVisionTextModel(model: OpenRouterModel): boolean {
  if (EXCLUDED_MODEL_IDS.has(model.id)) {
    return false;
  }

  const promptFree = model.pricing?.prompt === '0';
  const completionFree = model.pricing?.completion === '0';
  if (!promptFree || !completionFree) {
    return false;
  }

  const inputs = model.architecture?.input_modalities ?? [];
  const outputs = model.architecture?.output_modalities ?? [];

  return (
    inputs.includes('image') &&
    inputs.includes('text') &&
    outputs.includes('text')
  );
}

export function mapToFreeVisionModel(
  model: OpenRouterModel,
): OpenRouterFreeVisionModel {
  const params = model.supported_parameters ?? [];
  return {
    id: model.id,
    name: model.name,
    contextLength: model.context_length ?? null,
    supportsStructuredOutputs: params.includes('structured_outputs'),
    supportsJsonObject: params.includes('response_format'),
    description: model.description,
  };
}

function scoreVisionModel(model: OpenRouterFreeVisionModel): number {
  let score = 0;
  if (model.supportsStructuredOutputs) score += 100;
  if (model.supportsJsonObject) score += 50;
  if (model.id !== 'openrouter/free') score += 10;
  if (model.contextLength) {
    score += Math.min(20, Math.floor(model.contextLength / 100_000));
  }
  return score;
}

function sortDynamicVisionModels(
  liveModels: OpenRouterFreeVisionModel[],
): OpenRouterFreeVisionModel[] {
  return [...liveModels].sort((a, b) => {
    const diff = scoreVisionModel(b) - scoreVisionModel(a);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
}

export function resolveDefaultVisionModel(
  models: OpenRouterFreeVisionModel[],
  envOverride?: string,
): string {
  const trimmedOverride = envOverride?.trim();
  if (trimmedOverride && models.some((m) => m.id === trimmedOverride)) {
    return trimmedOverride;
  }
  return models[0]?.id ?? OPENROUTER_DEFAULT_VISION_MODEL;
}

export async function fetchOpenRouterModels(
  signal?: AbortSignal,
): Promise<OpenRouterModel[]> {
  const response = await fetch(
    `${OPENROUTER_API_BASE_URL}${OPENROUTER_MODELS_PATH}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(`OpenRouter models fetch failed (${response.status})`);
  }

  const json = (await response.json()) as Partial<OpenRouterModelsResponse>;
  return Array.isArray(json.data) ? json.data : [];
}

export async function getFreeVisionModels(
  forceRefresh = false,
): Promise<{ models: OpenRouterFreeVisionModel[]; source: 'live' | 'fallback' }> {
  const now = Date.now();
  if (!forceRefresh && cachedModels && cachedModels.expiresAt > now) {
    return { models: cachedModels.items, source: 'live' };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const rawModels = await fetchOpenRouterModels(controller.signal).finally(
      () => clearTimeout(timer),
    );

    const dynamicModels = sortDynamicVisionModels(
      rawModels.filter(isFreeVisionTextModel).map(mapToFreeVisionModel),
    );

    if (dynamicModels.length === 0) {
      return { models: FALLBACK_FREE_VISION_MODELS, source: 'fallback' };
    }

    cachedModels = {
      expiresAt: now + OPENROUTER_MODELS_CACHE_TTL_MS,
      items: dynamicModels,
    };

    return { models: dynamicModels, source: 'live' };
  } catch {
    return { models: FALLBACK_FREE_VISION_MODELS, source: 'fallback' };
  }
}

export function resetOpenRouterModelsCache(): void {
  cachedModels = null;
}
