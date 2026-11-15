import type { OpenRouterReasoningEffort } from './model-types';

export type {
  OpenRouterInputModality,
  OpenRouterModel,
  OpenRouterModelArchitecture,
  OpenRouterModelBenchmarks,
  OpenRouterModelPricing,
  OpenRouterModelReasoning,
  OpenRouterModelsCountResponse,
  OpenRouterModelsQueryParams,
  OpenRouterModelsSort,
  OpenRouterModelsResponse,
  OpenRouterModelTopProvider,
  OpenRouterOutputModality,
  OpenRouterPricingOverride,
  OpenRouterReasoningEffort,
  OpenRouterSingleModelResponse,
  OpenRouterUserModelsQueryParams,
} from './model-types';

export type OpenRouterRole = 'system' | 'user' | 'assistant' | 'tool';

export interface OpenRouterTextContentPart {
  type: 'text';
  text: string;
}

export interface OpenRouterImageUrlContentPart {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'auto' | 'low' | 'high';
  };
}

export type OpenRouterContentPart =
  OpenRouterTextContentPart | OpenRouterImageUrlContentPart;

export interface OpenRouterMessage {
  role: OpenRouterRole;
  content: string | OpenRouterContentPart[];
  name?: string;
}

export type OpenRouterResponseFormat =
  | { type: 'text' }
  | { type: 'json_object' }
  | {
      type: 'json_schema';
      json_schema: {
        name: string;
        strict?: boolean;
        schema: Record<string, unknown>;
      };
    };

export interface OpenRouterProviderPreferences {
  order?: string[];
  allow_fallbacks?: boolean;
  require_parameters?: boolean;
  data_collection?: 'allow' | 'deny';
  only?: string[];
  ignore?: string[];
}

export interface OpenRouterReasoningConfig {
  effort?: OpenRouterReasoningEffort;
  max_tokens?: number;
  exclude?: boolean;
  enabled?: boolean;
}

export interface OpenRouterChatCompletionRequest {
  model?: string;
  models?: string[];
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  response_format?: OpenRouterResponseFormat;
  provider?: OpenRouterProviderPreferences;
  reasoning?: OpenRouterReasoningConfig;
  seed?: number;
  stop?: string | string[];
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost?: number;
  is_byok?: boolean;
  prompt_tokens_details?: Record<string, unknown>;
  completion_tokens_details?: Record<string, unknown>;
  cost_details?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface OpenRouterChoiceMessage {
  role: 'assistant';
  content: string | null;
  reasoning?: string | null;
  reasoning_details?: Array<Record<string, unknown>>;
  refusal?: string | null;
  [key: string]: unknown;
}

export interface OpenRouterChoice {
  index: number;
  message: OpenRouterChoiceMessage;
  finish_reason: string | null;
  native_finish_reason?: string | null;
  logprobs?: unknown;
  [key: string]: unknown;
}

export interface OpenRouterErrorMetadata {
  provider_name?: string;
  raw?: unknown;
  error_type?: string;
  [key: string]: unknown;
}

export interface OpenRouterErrorPayload {
  code: number | string;
  message: string;
  metadata?: OpenRouterErrorMetadata;
}

export interface OpenRouterChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  provider?: string;
  choices: OpenRouterChoice[];
  usage?: OpenRouterUsage;
  system_fingerprint?: string | null;
  service_tier?: string | null;
  error?: OpenRouterErrorPayload;
  openrouter_metadata?: Record<string, unknown> | null;
  user_id?: string | null;
  [key: string]: unknown;
}
