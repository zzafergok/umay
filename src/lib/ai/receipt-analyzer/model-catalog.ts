import {
  OPENROUTER_DEFAULT_VISION_MODEL,
  type OpenRouterModel,
  type OpenRouterModelPricing,
} from '@/lib/ai/openrouter';

export type ReceiptModelPricingFilter = 'all' | 'free' | 'paid';

export function isChatCompletionModel(model: OpenRouterModel): boolean {
  if (!Array.isArray(model.endpoints) || model.endpoints.length === 0) {
    return true;
  }
  return model.endpoints.includes('/api/v1/chat/completions');
}

const PRICING_COST_KEYS = [
  'prompt',
  'completion',
  'image',
  'image_token',
  'image_output',
  'audio',
  'audio_output',
  'request',
  'web_search',
  'internal_reasoning',
] as const;

export function isRouterModelId(id: string): boolean {
  const normalized = id.trim().toLowerCase();
  return (
    normalized.startsWith('openrouter/') ||
    normalized.includes('router') ||
    normalized === 'nvidia/switchyard'
  );
}

export function isFreeOpenRouterModel(model: OpenRouterModel): boolean {
  const pricing = model.pricing;
  if (!pricing) {
    return model.id.endsWith(':free') || model.id === 'openrouter/free';
  }
  const prompt = Number(pricing.prompt);
  const completion = Number(pricing.completion);
  if (!Number.isFinite(prompt) || !Number.isFinite(completion)) {
    return model.id.endsWith(':free') || model.id === 'openrouter/free';
  }
  if (prompt < 0 || completion < 0) return false;
  if (pricing.discount === 1) return true;

  for (const key of PRICING_COST_KEYS) {
    const raw = pricing[key];
    if (raw === undefined || raw === null || raw === '') continue;
    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric !== 0) return false;
  }
  return true;
}

const NON_OCR_MODEL_PREFIXES = ['scaledown/', 'google/lyria-'] as const;
const CHAT_EXTRACTION_PARAMS = [
  'temperature',
  'response_format',
  'structured_outputs',
  'tools',
] as const;

/**
 * Görseldeki metinleri (OCR / Fiş Analizi) çıkarabilen uyumlu Vision-to-Text modellerini filtreler.
 * Görsel/video/ses üreten modelleri, batch-only uç noktaları, guardrail sınıflandırıcıları ve
 * dinamik (-1) kod yönlendiricilerini eler.
 */
export function isVisionTextModel(model: OpenRouterModel): boolean {
  if (!isChatCompletionModel(model)) return false;

  const idLower = model.id.trim().toLowerCase();
  if (
    idLower.endsWith(':batch') ||
    idLower.startsWith('~') ||
    idLower.includes('guard') ||
    NON_OCR_MODEL_PREFIXES.some((prefix) => idLower.startsWith(prefix)) ||
    model.architecture?.tokenizer === 'Router'
  ) {
    return false;
  }

  const endpoints = model.endpoints ?? [];
  if (
    endpoints.includes('/api/v1/images') ||
    endpoints.includes('/api/v1/videos')
  ) {
    return false;
  }

  const inputs = model.architecture?.input_modalities ?? [];
  const outputs = model.architecture?.output_modalities ?? [];
  const isPureTextOutput =
    outputs.includes('text') &&
    !outputs.includes('image') &&
    !outputs.includes('video') &&
    !outputs.includes('audio');

  if (!inputs.includes('image') || !inputs.includes('text') || !isPureTextOutput) {
    return false;
  }

  if (model.pricing) {
    if (Number(model.pricing.prompt) < 0 || Number(model.pricing.completion) < 0) {
      return false;
    }
  }

  const supportedParams = model.supported_parameters;
  if (Array.isArray(supportedParams) && supportedParams.length > 0) {
    const hasExtractionParam = CHAT_EXTRACTION_PARAMS.some((param) =>
      supportedParams.includes(param),
    );
    if (!hasExtractionParam) return false;
  }

  return true;
}

export function supportsStructuredOutputs(model: OpenRouterModel): boolean {
  return model.supported_parameters?.includes('structured_outputs') ?? false;
}

export function supportsJsonObject(model: OpenRouterModel): boolean {
  return model.supported_parameters?.includes('response_format') ?? false;
}

export function supportsReasoningOutput(model: OpenRouterModel): boolean {
  return (
    Boolean(model.reasoning) ||
    (model.supported_parameters?.includes('reasoning') ?? false)
  );
}

function scoreReceiptVisionModel(model: OpenRouterModel): number {
  let score = 0;
  if (isFreeOpenRouterModel(model)) score += 200;
  if (supportsStructuredOutputs(model)) score += 100;
  if (supportsJsonObject(model)) score += 50;
  if (model.id !== 'openrouter/free') score += 10;
  if (model.id === 'nvidia/nemotron-3.5-super-vl:free') {
    score += 180;
  } else if (model.id.startsWith('google/') || model.id.startsWith('nvidia/')) {
    score += 25;
  }
  if (model.id.startsWith('inclusionai/') || model.id.startsWith('baidu/')) {
    score -= 160;
  }
  if (model.context_length) {
    score += Math.min(20, Math.floor(model.context_length / 100_000));
  }
  return score;
}

export function filterAndSortReceiptModels(
  models: OpenRouterModel[],
  options: {
    freeOnly?: boolean;
    pricingFilter?: ReceiptModelPricingFilter;
  } = {},
): OpenRouterModel[] {
  const mode: ReceiptModelPricingFilter =
    options.pricingFilter ??
    (options.freeOnly !== undefined ? (options.freeOnly ? 'free' : 'all') : 'free');

  return models
    .filter((model) => {
      if (!isVisionTextModel(model)) return false;
      if (mode === 'free') return isFreeOpenRouterModel(model);
      if (mode === 'paid') return !isFreeOpenRouterModel(model);
      return true;
    })
    .sort((a, b) => {
      const diff = scoreReceiptVisionModel(b) - scoreReceiptVisionModel(a);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
}

export function countReceiptModelsByPricing(models: OpenRouterModel[]): {
  all: number;
  free: number;
  paid: number;
} {
  let free = 0;
  let paid = 0;
  for (const model of models) {
    if (!isVisionTextModel(model)) continue;
    if (isFreeOpenRouterModel(model)) free += 1;
    else paid += 1;
  }
  return { all: free + paid, free, paid };
}

export function pickDefaultReceiptModelId(
  models: OpenRouterModel[],
  preferredOverride?: string,
): string {
  const trimmed = preferredOverride?.trim();
  if (trimmed && models.some((m) => m.id === trimmed)) return trimmed;
  const rankedFree = filterAndSortReceiptModels(models, { pricingFilter: 'free' });
  return rankedFree[0]?.id ?? models[0]?.id ?? OPENROUTER_DEFAULT_VISION_MODEL;
}

export function formatModelContextLength(
  contextLength: number | null | undefined,
): string | null {
  if (!contextLength || contextLength <= 0) return null;
  if (contextLength >= 1_000_000) {
    return `${(contextLength / 1_000_000).toFixed(1).replace(/\.0$/, '')}M bağlam`;
  }
  if (contextLength >= 1_000) return `${Math.round(contextLength / 1_000)}K bağlam`;
  return `${contextLength} bağlam`;
}

export function formatModelPricingLabel(
  pricing: OpenRouterModelPricing | undefined,
): string {
  if (!pricing) return 'Bilinmiyor';
  const discountFactor =
    typeof pricing.discount === 'number' && Number.isFinite(pricing.discount)
      ? Math.max(0, 1 - pricing.discount)
      : 1;
  const promptPerToken = Number(pricing.prompt) * discountFactor;
  const completionPerToken = Number(pricing.completion) * discountFactor;

  if (promptPerToken < 0 || completionPerToken < 0) return 'Dinamik';
  if (discountFactor === 0 || (promptPerToken === 0 && completionPerToken === 0)) {
    return 'Ücretsiz';
  }
  const promptPerMillion = promptPerToken * 1_000_000;
  const completionPerMillion = completionPerToken * 1_000_000;
  if (Number.isFinite(promptPerMillion) && Number.isFinite(completionPerMillion)) {
    return `$${promptPerMillion.toFixed(2)} / $${completionPerMillion.toFixed(2)} per 1M`;
  }
  return 'Ücretli';
}
