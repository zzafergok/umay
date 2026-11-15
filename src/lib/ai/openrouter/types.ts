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
  | OpenRouterTextContentPart
  | OpenRouterImageUrlContentPart;

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
  effort?: 'xhigh' | 'high' | 'medium' | 'low' | 'minimal' | 'none';
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
  prompt_tokens_details?: {
    cached_tokens?: number;
    audio_tokens?: number;
  };
  completion_tokens_details?: {
    reasoning_tokens?: number;
    image_tokens?: number;
  };
}

export interface OpenRouterChoiceMessage {
  role: 'assistant';
  content: string | null;
  reasoning?: string | null;
  refusal?: string | null;
}

export interface OpenRouterChoice {
  index: number;
  message: OpenRouterChoiceMessage;
  finish_reason: string | null;
  native_finish_reason?: string | null;
}

export interface OpenRouterErrorMetadata {
  provider_name?: string;
  raw?: unknown;
  error_type?: string;
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
  error?: OpenRouterErrorPayload;
}

export interface OpenRouterModelArchitecture {
  modality?: string | null;
  input_modalities?: string[] | null;
  output_modalities?: string[] | null;
  tokenizer?: string | null;
  instruct_type?: string | null;
}

export interface OpenRouterModelPricing {
  prompt: string;
  completion: string;
  image?: string;
  request?: string;
  web_search?: string;
  internal_reasoning?: string;
  input_cache_read?: string;
  input_cache_write?: string;
}

export interface OpenRouterModelTopProvider {
  context_length?: number | null;
  max_completion_tokens?: number | null;
  is_moderated?: boolean;
}

export interface OpenRouterModel {
  id: string;
  canonical_slug?: string | null;
  hugging_face_id?: string | null;
  name: string;
  created?: number;
  description?: string;
  context_length: number | null;
  architecture?: OpenRouterModelArchitecture | null;
  pricing: OpenRouterModelPricing;
  top_provider?: OpenRouterModelTopProvider | null;
  per_request_limits?: Record<string, unknown> | null;
  supported_parameters?: string[] | null;
  default_parameters?: Record<string, unknown> | null;
  endpoints?: string[] | null;
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export interface OpenRouterFreeVisionModel {
  id: string;
  name: string;
  contextLength: number | null;
  supportsStructuredOutputs: boolean;
  supportsJsonObject: boolean;
  description?: string;
}
