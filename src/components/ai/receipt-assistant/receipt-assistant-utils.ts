import type { OpenRouterModelsQueryParams } from '@/lib/ai/openrouter';
import { ApiError } from '@/lib/api';

export const OPENROUTER_MODELS_QUERY_KEY = [
  'ai',
  'openrouter',
  'models',
] as const;

export function getOpenRouterModelsQueryKey(
  query?: OpenRouterModelsQueryParams,
) {
  return [...OPENROUTER_MODELS_QUERY_KEY, query ?? null] as const;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Görsel okunamadı.'));
      }
    };
    reader.onerror = () => reject(new Error('Görsel okunurken hata oluştu.'));
    reader.readAsDataURL(file);
  });
}

export function isMissingApiKeyError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 503) return true;
  if (
    typeof error.data === 'object' &&
    error.data !== null &&
    'code' in error.data &&
    (error.data as { code?: unknown }).code === 'missing_api_key'
  ) {
    return true;
  }
  return false;
}
