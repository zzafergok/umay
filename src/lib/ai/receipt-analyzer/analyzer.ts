import {
  createOpenRouterChatCompletion,
  FALLBACK_VISION_MODEL_IDS,
  getFreeVisionModels,
  OpenRouterApiError,
} from '@/lib/ai/openrouter';
import { parseReceiptModelResponse } from './parser';
import { buildReceiptUserPrompt, RECEIPT_SYSTEM_PROMPT } from './prompt';
import type { ReceiptAnalysisResult, ReceiptAnalyzeInput } from './schemas';

async function buildDynamicModelCandidates(
  preferredModelId?: string,
): Promise<string[]> {
  const { models } = await getFreeVisionModels();
  const dynamicIds = models.map((m) => m.id);
  const envDefault = process.env.OPENROUTER_DEFAULT_VISION_MODEL?.trim();

  const candidates = [
    preferredModelId?.trim(),
    envDefault,
    ...dynamicIds,
    ...FALLBACK_VISION_MODEL_IDS,
  ].filter((id): id is string => Boolean(id && id.length > 0));

  return Array.from(new Set(candidates)).slice(0, 5);
}

export async function analyzeReceiptImage(
  input: ReceiptAnalyzeInput,
): Promise<ReceiptAnalysisResult> {
  const models = await buildDynamicModelCandidates(input.modelId);

  const response = await createOpenRouterChatCompletion({
    models,
    temperature: 0.1,
    max_tokens: 2400,
    messages: [
      {
        role: 'system',
        content: RECEIPT_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: buildReceiptUserPrompt(input.promptHint),
          },
          {
            type: 'image_url',
            image_url: {
              url: input.imageDataUrl,
              detail: 'high',
            },
          },
        ],
      },
    ],
  });

  const firstChoice = response.choices?.[0];
  const rawContent = firstChoice?.message?.content?.trim() ?? '';

  if (!rawContent) {
    throw new OpenRouterApiError(
      'Model fiş görselinden metin çıktısı üretemedi.',
      502,
      'empty_completion',
    );
  }

  const parsed = parseReceiptModelResponse(rawContent);

  return {
    ...parsed.data,
    modelUsed: response.model || models[0] || 'openrouter/free',
    provider: response.provider,
    usage: response.usage,
    parsedFromJson: parsed.parsedFromJson,
  };
}
