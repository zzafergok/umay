import type { MouseEvent } from 'react';
import type { PublicMobileTabKey } from './types';

export const PUBLIC_MOBILE_TAB_QUERY_PARAM = 'tab';

const TAB_VALUE_ALIASES: Record<string, PublicMobileTabKey> = {
  start: 'start',
  basla: 'start',
  preview: 'preview',
  onizle: 'preview',
  features: 'features',
  ozellikler: 'features',
  screens: 'screens',
  ekranlar: 'screens',
};

const ANCHOR_HASH_TO_TAB: Record<string, PublicMobileTabKey> = {
  '#nasil-calisir': 'start',
  '#start': 'start',
  '#basla': 'start',
  '#omurlu-parcalar': 'preview',
  '#preview': 'preview',
  '#onizle': 'preview',
  '#ozellikler': 'features',
  '#features': 'features',
  '#ekranlar': 'screens',
  '#screens': 'screens',
  '#sss': 'screens',
};

/**
 * Resolves a raw query string value (or alias) to a canonical mobile tab key.
 */
export function parsePublicMobileTabValue(
  raw?: string | string[] | null,
): PublicMobileTabKey | null {
  const candidate = Array.isArray(raw) ? raw[0] : raw;
  if (!candidate) return null;
  const normalized = candidate.trim().toLowerCase();
  return TAB_VALUE_ALIASES[normalized] ?? null;
}

/**
 * Resolves a `#hash` anchor expression to its matching mobile tab key.
 */
export function resolvePublicMobileTabFromHash(
  hash?: string | null,
): PublicMobileTabKey | null {
  if (!hash) return null;
  const trimmed = hash.trim().toLowerCase();
  if (!trimmed) return null;
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return ANCHOR_HASH_TO_TAB[normalized] ?? null;
}

/**
 * Resolves the active mobile tab from URL query params first, then hash anchors.
 */
export function resolvePublicMobileTabFromLocation(
  search: string,
  hash: string,
): PublicMobileTabKey {
  const params = new URLSearchParams(search);
  const queryTab = parsePublicMobileTabValue(
    params.get(PUBLIC_MOBILE_TAB_QUERY_PARAM),
  );
  if (queryTab) return queryTab;

  return resolvePublicMobileTabFromHash(hash) ?? 'start';
}

/**
 * Builds the public home URL for a given mobile tab while preserving unrelated params.
 */
export function getPublicMobileTabHref(
  tab: PublicMobileTabKey,
  currentSearch?: string,
): string {
  const params = new URLSearchParams(currentSearch ?? '');
  if (tab === 'start') {
    params.delete(PUBLIC_MOBILE_TAB_QUERY_PARAM);
  } else {
    params.set(PUBLIC_MOBILE_TAB_QUERY_PARAM, tab);
  }
  const query = params.toString();
  return query ? `/?${query}` : '/';
}

/**
 * Returns true when an anchor click should bypass default navigation and switch tabs inline.
 */
export function isPlainTabLinkClick(event: MouseEvent<HTMLElement>): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
