export { getOpenRouterConfig, isOpenRouterConfigured } from './config';
export type { OpenRouterConfig } from './config';

export {
  FALLBACK_VISION_MODEL_IDS,
  OPENROUTER_API_BASE_URL,
  OPENROUTER_DEFAULT_TIMEOUT_MS,
  OPENROUTER_DEFAULT_VISION_MODEL,
  OPENROUTER_MODELS_COUNT_PATH,
  OPENROUTER_MODELS_PATH,
  OPENROUTER_MODELS_USER_PATH,
  OPENROUTER_SINGLE_MODEL_PATH,
} from './constants';

export {
  fetchOpenRouterModelBySlug,
  fetchOpenRouterModels,
  fetchOpenRouterModelsCount,
  fetchOpenRouterUserModels,
  resetOpenRouterModelsCache,
} from './models';
export type {
  FetchOpenRouterModelsOptions,
  FetchOpenRouterUserModelsOptions,
} from './models';

export {
  createOpenRouterChatCompletion,
  OpenRouterApiError,
  parseOpenRouterErrorPayload,
} from './client';
export type { OpenRouterRequestOptions } from './client';

export {
  parseOpenRouterModelsQuery,
  parseOpenRouterUserModelsQuery,
} from './query-params';

export type {
  OpenRouterChatCompletionRequest,
  OpenRouterChatCompletionResponse,
  OpenRouterChoice,
  OpenRouterChoiceMessage,
  OpenRouterContentPart,
  OpenRouterErrorMetadata,
  OpenRouterErrorPayload,
  OpenRouterImageUrlContentPart,
  OpenRouterInputModality,
  OpenRouterMessage,
  OpenRouterModel,
  OpenRouterModelArchitecture,
  OpenRouterModelBenchmarks,
  OpenRouterModelPricing,
  OpenRouterModelReasoning,
  OpenRouterModelsCountResponse,
  OpenRouterModelsQueryParams,
  OpenRouterModelsResponse,
  OpenRouterModelsSort,
  OpenRouterModelTopProvider,
  OpenRouterOutputModality,
  OpenRouterPricingOverride,
  OpenRouterProviderPreferences,
  OpenRouterReasoningConfig,
  OpenRouterReasoningEffort,
  OpenRouterResponseFormat,
  OpenRouterRole,
  OpenRouterSingleModelResponse,
  OpenRouterTextContentPart,
  OpenRouterUsage,
  OpenRouterUserModelsQueryParams,
} from './types';
