import { OPENROUTER_DEFAULT_VISION_MODEL } from './constants';

export interface OpenRouterConfig {
  apiKey: string;
  siteUrl: string;
  appName: string;
  defaultVisionModel: string;
}

export function isOpenRouterConfigured(): boolean {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  return Boolean(key && key.length > 0 && !key.startsWith('your-'));
}

export function getOpenRouterConfig(): OpenRouterConfig {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim() ?? '';
  const siteUrl =
    process.env.OPENROUTER_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    'http://localhost:3000';
  const appName = process.env.OPENROUTER_APP_NAME?.trim() || 'Umay';
  const defaultVisionModel =
    process.env.OPENROUTER_DEFAULT_VISION_MODEL?.trim() ||
    OPENROUTER_DEFAULT_VISION_MODEL;

  return {
    apiKey,
    siteUrl,
    appName,
    defaultVisionModel,
  };
}
