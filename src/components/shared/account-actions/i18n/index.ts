import { routing, type Locale } from '@/i18n/routing';
import en from './en.json';
import tr from './tr.json';
import type { AccountActionsCopy } from '../types';

const messages: Record<Locale, AccountActionsCopy> = {
  tr,
  en,
};

export function getAccountActionsCopy(
  locale: Locale = routing.defaultLocale,
): AccountActionsCopy {
  return messages[locale] ?? messages.tr;
}
