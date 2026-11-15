import { OpenRouterApiError, parseOpenRouterErrorPayload } from './client';
import { getOpenRouterConfig, isOpenRouterConfigured } from './config';
import { OPENROUTER_API_BASE_URL } from './constants';

export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  const entries = Object.entries(params).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '') continue;
    searchParams.set(key, String(value));
  }
  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : '';
}

export async function requestOpenRouterGet<T>(
  pathWithQuery: string,
  options: { requireAuth?: boolean; signal?: AbortSignal } = {},
): Promise<T> {
  const configured = isOpenRouterConfigured();
  if (options.requireAuth && !configured) {
    throw new OpenRouterApiError(
      'OPENROUTER_API_KEY tanımlı değil. Kullanıcıya özel model listesi için API anahtarı gerekir.',
      503,
      'missing_api_key',
    );
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (configured) {
    headers.Authorization = `Bearer ${getOpenRouterConfig().apiKey}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);
  const forwardAbort = () => controller.abort();
  options.signal?.addEventListener('abort', forwardAbort, { once: true });

  try {
    const response = await fetch(`${OPENROUTER_API_BASE_URL}${pathWithQuery}`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    const rawBody: unknown = await response.json().catch(() => null);
    const errorPayload = parseOpenRouterErrorPayload(rawBody);

    if (!response.ok || errorPayload) {
      const status = response.ok
        ? typeof errorPayload?.code === 'number'
          ? errorPayload.code
          : 502
        : response.status;
      throw new OpenRouterApiError(
        errorPayload?.message ||
          `OpenRouter isteği başarısız oldu (HTTP ${response.status}).`,
        status,
        errorPayload?.code ?? response.status,
        errorPayload?.metadata,
      );
    }

    if (typeof rawBody !== 'object' || rawBody === null) {
      throw new OpenRouterApiError(
        'OpenRouter yanıtı beklenen JSON formatında değil.',
        502,
        'invalid_response',
      );
    }

    return rawBody as T;
  } catch (error) {
    if (error instanceof OpenRouterApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new OpenRouterApiError(
        'OpenRouter isteği zaman aşımına uğradı.',
        504,
        'timeout',
      );
    }
    throw new OpenRouterApiError(
      error instanceof Error
        ? error.message
        : 'OpenRouter bağlantısı sırasında ağ hatası oluştu.',
      502,
      'network_error',
    );
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', forwardAbort);
  }
}
