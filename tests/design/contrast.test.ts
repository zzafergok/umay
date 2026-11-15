import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@/lib/design/contrast';
import {
  DARK_COLORS,
  LIGHT_COLORS,
  type ThemeColorPalette,
} from '@/lib/design/tokens/colors';

interface ContrastPair {
  name: string;
  fg: keyof ThemeColorPalette;
  bg: keyof ThemeColorPalette;
  minRatio: number;
}

const REQUIRED_PAIRS: ContrastPair[] = [
  { name: 'text on bg', fg: 'text', bg: 'bg', minRatio: 4.5 },
  { name: 'text on surface', fg: 'text', bg: 'surface', minRatio: 4.5 },
  {
    name: 'text on surfaceRaised',
    fg: 'text',
    bg: 'surfaceRaised',
    minRatio: 4.5,
  },
  {
    name: 'text on surfaceSunken',
    fg: 'text',
    bg: 'surfaceSunken',
    minRatio: 4.5,
  },
  { name: 'textMuted on bg', fg: 'textMuted', bg: 'bg', minRatio: 4.5 },
  {
    name: 'textMuted on surface',
    fg: 'textMuted',
    bg: 'surface',
    minRatio: 4.5,
  },
  {
    name: 'textMuted on surfaceRaised',
    fg: 'textMuted',
    bg: 'surfaceRaised',
    minRatio: 4.5,
  },
  {
    name: 'textMuted on surfaceSunken',
    fg: 'textMuted',
    bg: 'surfaceSunken',
    minRatio: 4.5,
  },
  { name: 'onAccent on accent', fg: 'onAccent', bg: 'accent', minRatio: 4.5 },
  { name: 'accent on bg', fg: 'accent', bg: 'bg', minRatio: 4.5 },
  { name: 'accent on surface', fg: 'accent', bg: 'surface', minRatio: 4.5 },
  {
    name: 'accent on accentSubtle',
    fg: 'accent',
    bg: 'accentSubtle',
    minRatio: 4.5,
  },
  {
    name: 'success on successSubtle',
    fg: 'success',
    bg: 'successSubtle',
    minRatio: 4.5,
  },
  {
    name: 'warning on warningSubtle',
    fg: 'warning',
    bg: 'warningSubtle',
    minRatio: 4.5,
  },
  {
    name: 'danger on dangerSubtle',
    fg: 'danger',
    bg: 'dangerSubtle',
    minRatio: 4.5,
  },
  { name: 'info on infoSubtle', fg: 'info', bg: 'infoSubtle', minRatio: 4.5 },
  { name: 'success on surface', fg: 'success', bg: 'surface', minRatio: 4.5 },
  { name: 'warning on surface', fg: 'warning', bg: 'surface', minRatio: 4.5 },
  { name: 'danger on surface', fg: 'danger', bg: 'surface', minRatio: 4.5 },
];

describe('Umay Design System WCAG AA Contrast', () => {
  for (const [themeName, palette] of [
    ['light', LIGHT_COLORS],
    ['dark', DARK_COLORS],
  ] as const) {
    describe(`${themeName} theme`, () => {
      for (const pair of REQUIRED_PAIRS) {
        it(`${pair.name} meets >= ${pair.minRatio}:1`, () => {
          const ratio = contrastRatio(palette[pair.fg], palette[pair.bg]);
          expect(ratio).toBeGreaterThanOrEqual(pair.minRatio);
        });
      }
    });
  }
});
