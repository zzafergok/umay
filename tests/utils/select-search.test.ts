import * as React from 'react';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SELECT_SEARCH_THRESHOLD,
  matchesSelectSearch,
  normalizeSelectSearchText,
  SelectGroup,
  SelectItem,
} from '@/components/core/select';
import { collectSelectItemsSearchCorpora } from '@/components/core/select/select-search-utils';

describe('Global Select search engine (>4 threshold & Turkish normalization)', () => {
  it('defaults search threshold to 4 so lists with 5+ options enable search automatically', () => {
    expect(DEFAULT_SELECT_SEARCH_THRESHOLD).toBe(4);
  });

  it('normalizes Turkish characters and matches multi-word search queries', () => {
    expect(normalizeSelectSearchText('Ücretsiz Görsel İçecek Şablonu')).toBe(
      'ucretsiz gorsel icecek sablonu',
    );
    expect(
      matchesSelectSearch(
        'Google: Gemini 4 Hydrogen $1.50 / $7.50 per 1M',
        'gemini 1.50',
      ),
    ).toBe(true);
    expect(
      matchesSelectSearch(
        'NVIDIA: Nemotron 3.5 Super VL (Ücretsiz)',
        'ucretsiz nemotron',
      ),
    ).toBe(true);
    expect(
      matchesSelectSearch('OpenAI: GPT-6.2 Sol', 'anthropic'),
    ).toBe(false);
  });

  it('recursively collects searchable text from SelectItem children, endAdornment, and SelectGroup', () => {
    const tree = React.createElement(
      React.Fragment,
      null,
      React.createElement(
        SelectItem,
        {
          value: 'google/gemini-4-hydrogen',
          endAdornment: React.createElement('span', null, '$1.50 / $7.50 per 1M'),
        },
        'Google: Gemini 4 Hydrogen',
      ),
      React.createElement(
        SelectGroup,
        null,
        React.createElement(
          SelectItem,
          {
            value: 'nvidia/nemotron-3.5-super-vl:free',
            endAdornment: React.createElement('span', null, 'Ücretsiz'),
          },
          'NVIDIA: Nemotron 3.5 Super VL',
        ),
      ),
    );

    const corpora = collectSelectItemsSearchCorpora(tree);
    expect(corpora).toHaveLength(2);
    expect(corpora[0]).toContain('Google: Gemini 4 Hydrogen');
    expect(corpora[0]).toContain('$1.50 / $7.50 per 1M');
    expect(corpora[1]).toContain('NVIDIA: Nemotron 3.5 Super VL');
    expect(corpora[1]).toContain('Ücretsiz');
  });
});
