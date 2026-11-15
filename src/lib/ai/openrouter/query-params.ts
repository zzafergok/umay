import type {
  OpenRouterModelsQueryParams,
  OpenRouterUserModelsQueryParams,
} from './types';

const MODELS_STRING_QUERY_KEYS = [
  'category',
  'supported_parameters',
  'output_modalities',
  'sort',
  'q',
  'input_modalities',
  'endpoints',
  'arch',
  'model_authors',
  'providers',
  'distillable',
  'zdr',
  'region',
] as const;

const MODELS_NUMBER_QUERY_KEYS = [
  'offset',
  'limit',
  'context',
  'min_price',
  'max_price',
  'min_output_price',
  'max_output_price',
  'min_age_days',
  'max_age_days',
  'min_intelligence_index',
  'max_intelligence_index',
  'min_coding_index',
  'max_coding_index',
  'min_agentic_index',
  'max_agentic_index',
  'min_tool_success_rate',
  'max_tool_success_rate',
] as const;

export function parseOpenRouterModelsQuery(
  searchParams: URLSearchParams,
): OpenRouterModelsQueryParams {
  const query: Record<string, string | number> = {};

  for (const key of MODELS_STRING_QUERY_KEYS) {
    const val = searchParams.get(key)?.trim();
    if (val) query[key] = val;
  }

  for (const key of MODELS_NUMBER_QUERY_KEYS) {
    const raw = searchParams.get(key)?.trim();
    if (!raw) continue;
    const num = Number(raw);
    if (!Number.isFinite(num)) continue;
    query[key] =
      key === 'limit' ? Math.min(1000, Math.max(1, Math.trunc(num))) : num;
  }

  return query as OpenRouterModelsQueryParams;
}

export function parseOpenRouterUserModelsQuery(
  searchParams: URLSearchParams,
): OpenRouterUserModelsQueryParams {
  const query: OpenRouterUserModelsQueryParams = {};
  const offset = searchParams.get('offset');
  const limit = searchParams.get('limit');
  const outputModalities = searchParams.get('output_modalities')?.trim();
  const sort = searchParams.get('sort')?.trim();
  const client = searchParams.get('client')?.trim();

  if (offset !== null && Number.isFinite(Number(offset))) {
    query.offset = Math.max(0, Math.trunc(Number(offset)));
  }
  if (limit !== null && Number.isFinite(Number(limit))) {
    query.limit = Math.min(1000, Math.max(1, Math.trunc(Number(limit))));
  }
  if (outputModalities) query.output_modalities = outputModalities;
  if (sort) query.sort = sort;
  if (client) query.client = client;

  return query;
}
