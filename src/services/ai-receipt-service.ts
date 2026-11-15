import { apiClient } from '@/lib/api';
import type { OpenRouterFreeVisionModel } from '@/lib/ai/openrouter';
import type {
  ReceiptAnalysisResult,
  ReceiptAnalyzeInput,
} from '@/lib/ai/receipt-analyzer';

export interface OpenRouterModelsListResponse {
  configured: boolean;
  defaultModel: string;
  source: 'live' | 'fallback';
  models: OpenRouterFreeVisionModel[];
}

export const aiReceiptService = {
  listFreeVisionModels: (refresh = false) =>
    apiClient.get<OpenRouterModelsListResponse>('/ai/openrouter/models', {
      params: refresh ? { refresh: 'true' } : undefined,
      timeout: 15000,
    }),

  analyzeReceipt: (input: ReceiptAnalyzeInput) =>
    apiClient.post<{ analysis: ReceiptAnalysisResult }>(
      '/ai/receipt/analyze',
      input,
      { timeout: 50000 },
    ),
};
