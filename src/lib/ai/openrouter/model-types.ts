export type OpenRouterInputModality =
  | 'text'
  | 'image'
  | 'file'
  | 'audio'
  | 'video'
  | (string & {});

export type OpenRouterOutputModality =
  | 'text'
  | 'image'
  | 'embeddings'
  | 'audio'
  | 'video'
  | 'rerank'
  | 'decisions'
  | 'speech'
  | 'transcription'
  | (string & {});

export type OpenRouterReasoningEffort =
  | 'max'
  | 'xhigh'
  | 'high'
  | 'medium'
  | 'low'
  | 'minimal'
  | 'none';

export type OpenRouterModelsSort =
  | 'most-popular'
  | 'newest'
  | 'top-weekly'
  | 'pricing-low-to-high'
  | 'pricing-high-to-low'
  | 'context-high-to-low'
  | 'throughput-high-to-low'
  | 'latency-low-to-high'
  | 'intelligence-high-to-low'
  | 'coding-high-to-low'
  | 'agentic-high-to-low'
  | 'design-arena-elo-high-to-low';

export interface OpenRouterModelArchitecture {
  modality?: string | null;
  input_modalities?: OpenRouterInputModality[] | null;
  output_modalities?: OpenRouterOutputModality[] | null;
  tokenizer?: string | null;
  instruct_type?: string | null;
  [key: string]: unknown;
}

export interface OpenRouterPricingOverride {
  prompt?: string;
  completion?: string;
  audio?: string;
  input_audio_cache?: string;
  input_cache_read?: string;
  input_cache_write?: string;
  input_cache_write_1h?: string;
  min_prompt_tokens?: number;
  utc_start?: number;
  utc_end?: number;
  utc_days?: string[];
  [key: string]: unknown;
}

export interface OpenRouterModelPricing {
  prompt: string;
  completion: string;
  discount?: number;
  image?: string;
  image_token?: string;
  image_output?: string;
  audio?: string;
  audio_output?: string;
  request?: string;
  web_search?: string;
  internal_reasoning?: string;
  input_audio_cache?: string;
  input_cache_read?: string;
  input_cache_write?: string;
  input_cache_write_1h?: string;
  overrides?: OpenRouterPricingOverride[];
  [key: string]: unknown;
}

export interface OpenRouterModelTopProvider {
  context_length?: number | null;
  max_completion_tokens?: number | null;
  is_moderated?: boolean;
  [key: string]: unknown;
}

export interface OpenRouterModelReasoning {
  mandatory?: boolean;
  default_enabled?: boolean;
  supported_efforts?: OpenRouterReasoningEffort[] | null;
  default_effort?: OpenRouterReasoningEffort | null;
  supports_max_tokens?: boolean;
  [key: string]: unknown;
}

export interface OpenRouterModelBenchmarks {
  artificial_analysis?: {
    agentic_index: number | null;
    coding_index: number | null;
    intelligence_index: number | null;
    [key: string]: unknown;
  };
  design_arena?: Array<{
    arena: string;
    category: string;
    elo: number;
    rank: number;
    win_rate: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface OpenRouterModel {
  id: string;
  canonical_slug?: string | null;
  hugging_face_id?: string | null;
  alias_target?: { name?: string; slug?: string } | null;
  name: string;
  created?: number;
  description?: string;
  context_length: number | null;
  architecture?: OpenRouterModelArchitecture | null;
  pricing: OpenRouterModelPricing;
  top_provider?: OpenRouterModelTopProvider | null;
  per_request_limits?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    [key: string]: unknown;
  } | null;
  supported_parameters?: string[] | null;
  default_parameters?: Record<string, number | null> | null;
  supported_voices?: string[] | null;
  knowledge_cutoff?: string | null;
  expiration_date?: string | null;
  links?: { details?: string | null; [key: string]: string | null | undefined } | null;
  endpoints?: string[] | null;
  benchmarks?: OpenRouterModelBenchmarks | null;
  reasoning?: OpenRouterModelReasoning | null;
  [key: string]: unknown;
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
  total_count?: number;
  links?: { next?: string | null; [key: string]: string | null | undefined };
  [key: string]: unknown;
}

export interface OpenRouterSingleModelResponse {
  data: OpenRouterModel;
  [key: string]: unknown;
}

export interface OpenRouterModelsCountResponse {
  data: {
    count: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface OpenRouterModelsQueryParams {
  offset?: number | null;
  limit?: number;
  category?: string;
  supported_parameters?: string;
  output_modalities?: string;
  sort?: OpenRouterModelsSort | (string & {});
  q?: string;
  input_modalities?: string;
  endpoints?: string;
  context?: number;
  min_price?: number | null;
  max_price?: number | null;
  arch?: string;
  model_authors?: string;
  providers?: string;
  distillable?: 'true' | 'false';
  zdr?: 'true';
  region?: 'eu' | 'us';
  min_output_price?: number | null;
  max_output_price?: number | null;
  min_age_days?: number | null;
  max_age_days?: number | null;
  min_intelligence_index?: number | null;
  max_intelligence_index?: number | null;
  min_coding_index?: number | null;
  max_coding_index?: number | null;
  min_agentic_index?: number | null;
  max_agentic_index?: number | null;
  min_tool_success_rate?: number | null;
  max_tool_success_rate?: number | null;
}

export interface OpenRouterUserModelsQueryParams {
  offset?: number | null;
  limit?: number;
  output_modalities?: string;
  sort?: OpenRouterModelsSort | (string & {});
  client?: 'claude_code' | 'claude_desktop' | 'codex' | (string & {});
}
