import { apiClient } from '@/lib/api';
import type {
  OpenRouterModelsCountResponse,
  OpenRouterModelsQueryParams,
  OpenRouterModelsResponse,
  OpenRouterSingleModelResponse,
  OpenRouterUserModelsQueryParams,
} from '@/lib/ai/openrouter';
import type {
  ReceiptAnalysisResult,
  ReceiptAnalyzeInput,
  ReceiptEnrichedItem,
  ReceiptEnrichInput,
} from '@/lib/ai/receipt-analyzer';

function toCleanParams(
  source?: object,
): Record<string, string | number | boolean> | undefined {
  if (!source) return undefined;
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(source)) {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      if (value !== '') result[key] = value;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export const aiReceiptService = {
  listModels: (refresh = false, query?: OpenRouterModelsQueryParams) => {
    const params: Record<string, string | number | boolean> = {
      ...(toCleanParams(query) ?? {}),
    };
    if (refresh) params.refresh = 'true';

    return apiClient.get<OpenRouterModelsResponse>('/ai/openrouter/models', {
      params: Object.keys(params).length > 0 ? params : undefined,
      timeout: 20000,
    });
  },

  getModelsCount: (outputModalities?: string) =>
    apiClient.get<OpenRouterModelsCountResponse>(
      '/ai/openrouter/models/count',
      {
        params: outputModalities
          ? { output_modalities: outputModalities }
          : undefined,
        timeout: 15000,
      },
    ),

  getUserModels: (query?: OpenRouterUserModelsQueryParams) =>
    apiClient.get<OpenRouterModelsResponse>('/ai/openrouter/models/user', {
      params: toCleanParams(query),
      timeout: 20000,
    }),

  getModelBySlug: (author: string, slug: string) => {
    const safeAuthor = encodeURIComponent(author.trim());
    const safeSlug = encodeURIComponent(slug.trim()).replace(/%3A/gi, ':');
    return apiClient.get<OpenRouterSingleModelResponse>(
      `/ai/openrouter/model/${safeAuthor}/${safeSlug}`,
      { timeout: 15000 },
    );
  },

  analyzeReceipt: (input: ReceiptAnalyzeInput) =>
    apiClient.post<{ analysis: ReceiptAnalysisResult }>(
      '/ai/receipt/analyze',
      input,
      { timeout: 200_000 },
    ),

  enrichReceipt: (input: ReceiptEnrichInput) =>
    apiClient.post<{ items: ReceiptEnrichedItem[] }>(
      '/ai/receipt/enrich',
      input,
      { timeout: 95_000 },
    ),
};
