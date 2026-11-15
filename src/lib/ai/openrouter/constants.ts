export const OPENROUTER_API_BASE_URL = 'https://openrouter.ai/api/v1';
export const OPENROUTER_CHAT_COMPLETIONS_PATH = '/chat/completions';
export const OPENROUTER_MODELS_PATH = '/models';
export const OPENROUTER_MODELS_COUNT_PATH = '/models/count';
export const OPENROUTER_MODELS_USER_PATH = '/models/user';
export const OPENROUTER_SINGLE_MODEL_PATH = '/model';

export const OPENROUTER_DEFAULT_TIMEOUT_MS = 45_000;
export const OPENROUTER_MODELS_CACHE_TTL_MS = 1000 * 60 * 15;

export const OPENROUTER_DEFAULT_VISION_MODEL =
  'inclusionai/ling-3.2-flash:free';

export const FALLBACK_VISION_MODEL_IDS: readonly string[] = [
  'inclusionai/ling-3.2-flash:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'particle-ai/particle-1:free',
  'dots-studio/dots-3-note-preview:free',
  'openrouter/free',
];
