import { OpenRouterApiError } from './client';
import {
  OPENROUTER_MODELS_CACHE_TTL_MS,
  OPENROUTER_MODELS_COUNT_PATH,
  OPENROUTER_MODELS_PATH,
  OPENROUTER_MODELS_USER_PATH,
  OPENROUTER_SINGLE_MODEL_PATH,
} from './constants';
import { buildQueryString, requestOpenRouterGet } from './request';
import type {
  OpenRouterModelsCountResponse,
  OpenRouterModelsQueryParams,
  OpenRouterModelsResponse,
  OpenRouterSingleModelResponse,
  OpenRouterUserModelsQueryParams,
} from './types';

interface CachedModelsEntry {
  expiresAt: number;
  response: OpenRouterModelsResponse;
}

const MAX_CACHE_ENTRIES = 20;
const cachedModelsMap = new Map<string, CachedModelsEntry>();

function resolveNextPagePath(
  nextLink: string | null | undefined,
): string | null {
  if (!nextLink) return null;
  if (nextLink.startsWith('/api/v1/')) {
    return nextLink.slice('/api/v1'.length);
  }
  if (nextLink.startsWith('/models')) {
    return nextLink;
  }
  return null;
}

export interface FetchOpenRouterModelsOptions {
  limit?: number;
  query?: OpenRouterModelsQueryParams;
  forceRefresh?: boolean;
  signal?: AbortSignal;
}

export async function fetchOpenRouterModels(
  options: FetchOpenRouterModelsOptions = {},
): Promise<OpenRouterModelsResponse> {
  const effectiveQuery: Record<string, unknown> = {
    ...(options.query ?? {}),
  };
  if (options.limit !== undefined && effectiveQuery.limit === undefined) {
    effectiveQuery.limit = options.limit;
  }

  const fetchFullList =
    effectiveQuery.limit === undefined && effectiveQuery.offset === undefined;
  const queryString = buildQueryString(effectiveQuery);
  const now = Date.now();
  const cached = cachedModelsMap.get(queryString);

  if (!options.forceRefresh && cached && cached.expiresAt > now) {
    return cached.response;
  }

  const firstPage = await requestOpenRouterGet<OpenRouterModelsResponse>(
    `${OPENROUTER_MODELS_PATH}${queryString}`,
    { signal: options.signal },
  );

  if (!Array.isArray(firstPage.data)) {
    throw new OpenRouterApiError(
      'OpenRouter models yanıtı beklenen formatta değil.',
      502,
      'invalid_models_response',
    );
  }

  let response = firstPage;
  if (fetchFullList && firstPage.links?.next) {
    const allData = [...firstPage.data];
    let nextPath = resolveNextPagePath(firstPage.links.next);
    let lastLinks = firstPage.links;
    for (let page = 0; page < 10 && nextPath; page += 1) {
      const nextPage = await requestOpenRouterGet<OpenRouterModelsResponse>(
        nextPath,
        { signal: options.signal },
      );
      if (Array.isArray(nextPage.data)) {
        allData.push(...nextPage.data);
      }
      lastLinks = nextPage.links ?? { next: null };
      nextPath = resolveNextPagePath(nextPage.links?.next);
    }
    response = {
      ...firstPage,
      data: allData,
      total_count: firstPage.total_count ?? allData.length,
      links: lastLinks,
    };
  }

  if (cachedModelsMap.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cachedModelsMap.keys().next().value;
    if (oldestKey !== undefined) cachedModelsMap.delete(oldestKey);
  }
  cachedModelsMap.set(queryString, {
    expiresAt: now + OPENROUTER_MODELS_CACHE_TTL_MS,
    response,
  });

  return response;
}

export interface FetchOpenRouterUserModelsOptions {
  query?: OpenRouterUserModelsQueryParams;
  signal?: AbortSignal;
}

export async function fetchOpenRouterUserModels(
  options: FetchOpenRouterUserModelsOptions = {},
): Promise<OpenRouterModelsResponse> {
  const queryString = buildQueryString({ ...(options.query ?? {}) });
  const response = await requestOpenRouterGet<OpenRouterModelsResponse>(
    `${OPENROUTER_MODELS_USER_PATH}${queryString}`,
    { requireAuth: true, signal: options.signal },
  );
  if (!Array.isArray(response.data)) {
    throw new OpenRouterApiError(
      'OpenRouter user models yanıtı beklenen formatta değil.',
      502,
      'invalid_models_response',
    );
  }
  return response;
}

export async function fetchOpenRouterModelsCount(
  options: { outputModalities?: string; signal?: AbortSignal } = {},
): Promise<OpenRouterModelsCountResponse> {
  const queryString = buildQueryString({
    output_modalities: options.outputModalities,
  });
  return requestOpenRouterGet<OpenRouterModelsCountResponse>(
    `${OPENROUTER_MODELS_COUNT_PATH}${queryString}`,
    { signal: options.signal },
  );
}

export async function fetchOpenRouterModelBySlug(
  author: string,
  slug: string,
  options: { signal?: AbortSignal } = {},
): Promise<OpenRouterSingleModelResponse> {
  const safeAuthor = encodeURIComponent(author.trim());
  const safeSlug = encodeURIComponent(slug.trim()).replace(/%3A/gi, ':');
  if (!safeAuthor || !safeSlug) {
    throw new OpenRouterApiError(
      'Geçerli bir model author ve slug belirtilmelidir.',
      400,
      'invalid_model_slug',
    );
  }
  return requestOpenRouterGet<OpenRouterSingleModelResponse>(
    `${OPENROUTER_SINGLE_MODEL_PATH}/${safeAuthor}/${safeSlug}`,
    { signal: options.signal },
  );
}

export function resetOpenRouterModelsCache(): void {
  cachedModelsMap.clear();
}
