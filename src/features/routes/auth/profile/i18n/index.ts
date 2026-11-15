import { routing, type Locale } from '@/i18n/routing';
import en from './en.json';
import tr from './tr.json';
import type { AuthProfileCopy } from '../types';

const messages: Record<Locale, AuthProfileCopy> = {
  tr,
  en,
};

export function getAuthProfileCopy(
  locale: Locale = routing.defaultLocale,
): AuthProfileCopy {
  return messages[locale] ?? messages.tr;
}
