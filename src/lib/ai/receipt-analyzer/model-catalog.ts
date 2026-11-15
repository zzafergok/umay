import {
  OPENROUTER_DEFAULT_VISION_MODEL,
  type OpenRouterModel,
  type OpenRouterModelPricing,
} from '@/lib/ai/openrouter';

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

export function isFreeOpenRouterModel(model: OpenRouterModel): boolean {
  const pricing = model.pricing;
  if (!pricing) {
    return model.id.endsWith(':free') || model.id === 'openrouter/free';
  }
  if (pricing.discount === 1) return true;

  const prompt = Number(pricing.prompt);
  const completion = Number(pricing.completion);
  if (!Number.isFinite(prompt) || !Number.isFinite(completion)) {
    return model.id.endsWith(':free') || model.id === 'openrouter/free';
  }

  for (const key of PRICING_COST_KEYS) {
    const raw = pricing[key];
    if (raw === undefined || raw === null || raw === '') continue;
    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric > 0) {
      return false;
    }
  }
  return true;
}

export function isVisionTextModel(model: OpenRouterModel): boolean {
  if (!isChatCompletionModel(model)) {
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
  if (model.context_length) {
    score += Math.min(20, Math.floor(model.context_length / 100_000));
  }
  return score;
}

export function filterAndSortReceiptModels(
  models: OpenRouterModel[],
  options: { freeOnly?: boolean } = {},
): OpenRouterModel[] {
  const { freeOnly = true } = options;

  return models
    .filter(
      (model) =>
        isVisionTextModel(model) && (!freeOnly || isFreeOpenRouterModel(model)),
    )
    .sort((a, b) => {
      const diff = scoreReceiptVisionModel(b) - scoreReceiptVisionModel(a);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
}

export function pickDefaultReceiptModelId(
  models: OpenRouterModel[],
  preferredOverride?: string,
): string {
  const trimmed = preferredOverride?.trim();
  if (trimmed && models.some((m) => m.id === trimmed)) {
    return trimmed;
  }
  const rankedFree = filterAndSortReceiptModels(models, { freeOnly: true });
  return rankedFree[0]?.id ?? models[0]?.id ?? OPENROUTER_DEFAULT_VISION_MODEL;
}

export function formatModelContextLength(
  contextLength: number | null | undefined,
): string | null {
  if (!contextLength || contextLength <= 0) return null;
  if (contextLength >= 1_000_000) {
    return `${(contextLength / 1_000_000).toFixed(1).replace(/\.0$/, '')}M bağlam`;
  }
  if (contextLength >= 1_000) {
    return `${Math.round(contextLength / 1_000)}K bağlam`;
  }
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

  if (
    discountFactor === 0 ||
    (promptPerToken === 0 && completionPerToken === 0)
  ) {
    return 'Ücretsiz';
  }
  const promptPerMillion = promptPerToken * 1_000_000;
  const completionPerMillion = completionPerToken * 1_000_000;
  if (
    Number.isFinite(promptPerMillion) &&
    Number.isFinite(completionPerMillion)
  ) {
    return `$${promptPerMillion.toFixed(2)} / $${completionPerMillion.toFixed(2)} per 1M`;
  }
  return 'Ücretli';
}
