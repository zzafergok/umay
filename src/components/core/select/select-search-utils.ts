'use client';

import * as React from 'react';

export const DEFAULT_SELECT_SEARCH_THRESHOLD = 4;

const TURKISH_FOLD_MAP: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  i: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  â: 'a',
  î: 'i',
  û: 'u',
};

/**
 * Türkçe ve İngilizce karakter duyarsız (diacritic-insensitive) arama normalizasyonu.
 * Örn: "Ücretsiz Görsel" -> "ucretsiz gorsel", "İçecek" -> "icecek"
 */
export function normalizeSelectSearchText(input: string): string {
  if (!input) return '';
  return input
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıiöşüâîû]/g, (ch) => TURKISH_FOLD_MAP[ch] ?? ch)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Çoklu kelime (token) destekli arama eşleştirici.
 * Kullanıcının yazdığı her kelime (token) hedef metin içinde geçiyorsa eşleşir.
 */
export function matchesSelectSearch(
  targetText: string,
  rawQuery: string,
): boolean {
  const normalizedQuery = normalizeSelectSearchText(rawQuery);
  if (!normalizedQuery) return true;

  const normalizedTarget = normalizeSelectSearchText(targetText);
  if (!normalizedTarget) return false;

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  return tokens.every((token) => normalizedTarget.includes(token));
}

/**
 * React düğüm ağacından (children / endAdornment) düz metin çıkarır.
 */
export function extractTextFromReactNode(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextFromReactNode).filter(Boolean).join(' ');
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractTextFromReactNode(node.props.children);
  }
  return '';
}

interface SelectItemLikeProps {
  value?: unknown;
  textValue?: string;
  searchValue?: string;
  children?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export function buildSelectItemSearchCorpus(
  props: SelectItemLikeProps,
): string {
  const parts: string[] = [];
  if (props.children !== undefined) {
    parts.push(extractTextFromReactNode(props.children));
  }
  if (props.endAdornment !== undefined) {
    parts.push(extractTextFromReactNode(props.endAdornment));
  }
  if (typeof props.textValue === 'string' && props.textValue) {
    parts.push(props.textValue);
  }
  if (typeof props.searchValue === 'string' && props.searchValue) {
    parts.push(props.searchValue);
  }
  if (typeof props.value === 'string' && props.value) {
    parts.push(props.value);
  }
  return parts.filter(Boolean).join(' ');
}

/**
 * SelectContent altındaki tüm SelectItem elemanlarının arama metinlerini递归 olarak toplar.
 */
export function collectSelectItemsSearchCorpora(
  children: React.ReactNode,
): string[] {
  const corpora: string[] = [];

  const visit = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement<SelectItemLikeProps>(child)) return;

      const isSelectItem =
        typeof child.props.value === 'string' &&
        (child.type as { displayName?: string })?.displayName !== 'SelectGroup';

      if (isSelectItem) {
        corpora.push(buildSelectItemSearchCorpus(child.props));
        return;
      }

      if (child.props.children) {
        visit(child.props.children);
      }
    });
  };

  visit(children);
  return corpora;
}

export interface SelectSearchContextValue {
  isSearchEnabled: boolean;
  query: string;
  hasActiveQuery: boolean;
}

export const SelectSearchContext =
  React.createContext<SelectSearchContextValue>({
    isSearchEnabled: false,
    query: '',
    hasActiveQuery: false,
  });

export function useSelectSearchContext(): SelectSearchContextValue {
  return React.useContext(SelectSearchContext);
}
