export { getOpenRouterConfig, isOpenRouterConfigured } from './config';
export type { OpenRouterConfig } from './config';

export {
  FALLBACK_FREE_VISION_MODELS,
  FALLBACK_VISION_MODEL_IDS,
  OPENROUTER_API_BASE_URL,
  OPENROUTER_DEFAULT_TIMEOUT_MS,
  OPENROUTER_DEFAULT_VISION_MODEL,
} from './constants';

export {
  fetchOpenRouterModels,
  getFreeVisionModels,
  isFreeVisionTextModel,
  mapToFreeVisionModel,
  resetOpenRouterModelsCache,
  resolveDefaultVisionModel,
} from './models';

export {
  createOpenRouterChatCompletion,
  OpenRouterApiError,
} from './client';
export type { OpenRouterRequestOptions } from './client';

export type {
  OpenRouterChatCompletionRequest,
  OpenRouterChatCompletionResponse,
  OpenRouterChoice,
  OpenRouterChoiceMessage,
  OpenRouterContentPart,
  OpenRouterErrorMetadata,
  OpenRouterErrorPayload,
  OpenRouterFreeVisionModel,
  OpenRouterImageUrlContentPart,
  OpenRouterMessage,
  OpenRouterModel,
  OpenRouterModelArchitecture,
  OpenRouterModelPricing,
  OpenRouterModelsResponse,
  OpenRouterModelTopProvider,
  OpenRouterProviderPreferences,
  OpenRouterReasoningConfig,
  OpenRouterResponseFormat,
  OpenRouterRole,
  OpenRouterTextContentPart,
  OpenRouterUsage,
} from './types';
