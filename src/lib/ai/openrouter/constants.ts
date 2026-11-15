import type { OpenRouterFreeVisionModel } from './types';

export const OPENROUTER_API_BASE_URL = 'https://openrouter.ai/api/v1';
export const OPENROUTER_CHAT_COMPLETIONS_PATH = '/chat/completions';
export const OPENROUTER_MODELS_PATH = '/models';

export const OPENROUTER_DEFAULT_TIMEOUT_MS = 45_000;
export const OPENROUTER_MODELS_CACHE_TTL_MS = 1000 * 60 * 15;

export const OPENROUTER_DEFAULT_VISION_MODEL =
  'nvidia/nemotron-3.5-super-vl:free';

/**
 * Statik yedek (fallback) liste.
 * Ana akış canlı OpenRouter `/api/v1/models` yanıtından dinamik beslenir;
 * yalnızca ağ hatası veya boş yanıt durumunda bu liste devreye girer.
 */
export const FALLBACK_FREE_VISION_MODELS: OpenRouterFreeVisionModel[] = [
  {
    id: 'nvidia/nemotron-3.5-super-vl:free',
    name: 'NVIDIA: Nemotron 3.5 Super VL (free)',
    contextLength: 1000000,
    supportsStructuredOutputs: true,
    supportsJsonObject: true,
    description: 'Belge, fiş ve görsel analizinde yüksek doğruluklu ücretsiz VLM.',
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Google: Gemma 4 31B (free)',
    contextLength: 262144,
    supportsStructuredOutputs: false,
    supportsJsonObject: true,
    description: 'Çok dilli metin ve görsel anlama yeteneğine sahip Gemma 4 31B.',
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Google: Gemma 4 26B A4B (free)',
    contextLength: 262144,
    supportsStructuredOutputs: false,
    supportsJsonObject: true,
    description: 'Hızlı çıkarım için MoE tabanlı Gemma 4 26B vision modeli.',
  },
  {
    id: 'inclusionai/ling-3.2-flash:free',
    name: 'inclusionAI: Ling 3.2 Flash (free)',
    contextLength: 1048576,
    supportsStructuredOutputs: true,
    supportsJsonObject: true,
    description: '1M bağlam pencereli hızlı görsel + metin modeli.',
  },
  {
    id: 'particle-ai/particle-1:free',
    name: 'Particle AI: Particle-1 (free)',
    contextLength: 1048576,
    supportsStructuredOutputs: true,
    supportsJsonObject: true,
    description: 'Structured output destekli ücretsiz multimodal model.',
  },
  {
    id: 'dots-studio/dots-3-note-preview:free',
    name: 'Dots Studio: Dots3-Note Preview (free)',
    contextLength: 512000,
    supportsStructuredOutputs: true,
    supportsJsonObject: true,
    description: 'Not ve belge çıkarımı odaklı ücretsiz multimodal model.',
  },
  {
    id: 'openrouter/free',
    name: 'OpenRouter Free Models Router',
    contextLength: 200000,
    supportsStructuredOutputs: true,
    supportsJsonObject: true,
    description: 'Uygun ücretsiz vision modeline otomatik yönlendirme yapar.',
  },
];

export const FALLBACK_VISION_MODEL_IDS: readonly string[] =
  FALLBACK_FREE_VISION_MODELS.map((m) => m.id);
