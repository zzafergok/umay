import { getOpenRouterConfig, isOpenRouterConfigured } from './config';
import {
  OPENROUTER_API_BASE_URL,
  OPENROUTER_CHAT_COMPLETIONS_PATH,
  OPENROUTER_DEFAULT_TIMEOUT_MS,
} from './constants';
import type {
  OpenRouterChatCompletionRequest,
  OpenRouterChatCompletionResponse,
  OpenRouterErrorPayload,
} from './types';

export class OpenRouterApiError extends Error {
  readonly status: number;
  readonly code: number | string;
  readonly providerName?: string;
  readonly metadata?: OpenRouterErrorPayload['metadata'];

  constructor(
    message: string,
    status: number,
    code: number | string = status,
    metadata?: OpenRouterErrorPayload['metadata'],
  ) {
    super(message);
    this.name = 'OpenRouterApiError';
    this.status = status;
    this.code = code;
    this.providerName = metadata?.provider_name;
    this.metadata = metadata;
  }
}

function parseErrorPayload(
  body: unknown,
): OpenRouterErrorPayload | undefined {
  if (typeof body !== 'object' || body === null) return undefined;
  const record = body as Record<string, unknown>;
  if (typeof record.error !== 'object' || record.error === null) {
    return undefined;
  }
  const err = record.error as Record<string, unknown>;
  const message =
    typeof err.message === 'string'
      ? err.message
      : 'OpenRouter API hatası oluştu.';
  const code =
    typeof err.code === 'number' || typeof err.code === 'string'
      ? err.code
      : 500;
  const metadata =
    typeof err.metadata === 'object' && err.metadata !== null
      ? (err.metadata as OpenRouterErrorPayload['metadata'])
      : undefined;

  return { code, message, metadata };
}

export interface OpenRouterRequestOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

export async function createOpenRouterChatCompletion(
  payload: OpenRouterChatCompletionRequest,
  options: OpenRouterRequestOptions = {},
): Promise<OpenRouterChatCompletionResponse> {
  if (!isOpenRouterConfigured()) {
    throw new OpenRouterApiError(
      'OPENROUTER_API_KEY tanımlı değil. Lütfen .env dosyasına OpenRouter API anahtarınızı ekleyin.',
      503,
      'missing_api_key',
    );
  }

  const config = getOpenRouterConfig();
  const timeoutMs = options.timeoutMs ?? OPENROUTER_DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const forwardAbort = () => controller.abort();
  options.signal?.addEventListener('abort', forwardAbort, { once: true });

  try {
    const response = await fetch(
      `${OPENROUTER_API_BASE_URL}${OPENROUTER_CHAT_COMPLETIONS_PATH}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.siteUrl,
          'X-OpenRouter-Title': config.appName,
          'X-Title': config.appName,
        },
        body: JSON.stringify({
          ...payload,
          stream: false,
        }),
        signal: controller.signal,
      },
    );

    const rawBody: unknown = await response.json().catch(() => null);
    const errorPayload = parseErrorPayload(rawBody);

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

    return rawBody as OpenRouterChatCompletionResponse;
  } catch (error) {
    if (error instanceof OpenRouterApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new OpenRouterApiError(
        'OpenRouter model yanıtı zaman aşımına uğradı.',
        504,
        'timeout',
      );
    }
    throw new OpenRouterApiError(
      error instanceof Error
        ? error.message
        : 'OpenRouter bağlantısı sırasında beklenmeyen bir hata oluştu.',
      502,
      'network_error',
    );
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', forwardAbort);
  }
}
