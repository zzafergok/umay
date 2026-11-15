export type ThemeMode = 'light' | 'dark';

export interface ThemeColorPalette {
  bg: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentHover: string;
  accentSubtle: string;
  onAccent: string;
  ember: string;
  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;
  danger: string;
  dangerSubtle: string;
  info: string;
  infoSubtle: string;
}

export const LIGHT_COLORS: ThemeColorPalette = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSunken: '#F3F0EB',
  border: '#E5E0D8',
  borderStrong: '#CFC8BD',
  text: '#1C1A17',
  textMuted: '#5F5A52',
  textSubtle: '#8A847A',
  accent: '#2B59C3',
  accentHover: '#234AA3',
  accentSubtle: '#E8EEFB',
  onAccent: '#FFFFFF',
  ember: '#D9622B',
  success: '#1F7A4D',
  successSubtle: '#E3F3EA',
  warning: '#A15C07',
  warningSubtle: '#FBF0DC',
  danger: '#B3261E',
  dangerSubtle: '#FBE5E3',
  info: '#2B59C3',
  infoSubtle: '#E8EEFB',
};

export const DARK_COLORS: ThemeColorPalette = {
  bg: '#121110',
  surface: '#1A1816',
  surfaceRaised: '#211F1C',
  surfaceSunken: '#0D0C0B',
  border: '#2E2B27',
  borderStrong: '#433F39',
  text: '#F3EFE9',
  textMuted: '#B5AEA3',
  textSubtle: '#8A8379',
  accent: '#7A9CFF',
  accentHover: '#98B3FF',
  accentSubtle: '#1B2540',
  onAccent: '#0B1020',
  ember: '#F08A4B',
  success: '#4CC38A',
  successSubtle: '#12281E',
  warning: '#E8A33D',
  warningSubtle: '#2C2210',
  danger: '#F2766E',
  dangerSubtle: '#301615',
  info: '#7A9CFF',
  infoSubtle: '#1B2540',
};

export interface CategoryColorToken {
  id: string;
  cssVar: `--cat-${number}`;
  name: string;
  light: string;
  dark: string;
  defaultCategoryMatch: string[];
}

export const CATEGORY_COLORS: CategoryColorToken[] = [
  {
    id: 'cat-1',
    cssVar: '--cat-1',
    name: 'Terakota',
    light: '#C4622D',
    dark: '#D97C49',
    defaultCategoryMatch: ['mutfak', 'kitchen'],
  },
  {
    id: 'cat-2',
    cssVar: '--cat-2',
    name: 'Zeytin',
    light: '#7A8B2E',
    dark: '#93A446',
    defaultCategoryMatch: ['kiler', 'pantry', 'gıda', 'food'],
  },
  {
    id: 'cat-3',
    cssVar: '--cat-3',
    name: 'Camgöbeği',
    light: '#1E8A8A',
    dark: '#38A2A2',
    defaultCategoryMatch: ['temizlik', 'cleaning'],
  },
  {
    id: 'cat-4',
    cssVar: '--cat-4',
    name: 'Gök',
    light: '#3D7FD0',
    dark: '#5C96DE',
    defaultCategoryMatch: ['elektronik', 'electronics'],
  },
  {
    id: 'cat-5',
    cssVar: '--cat-5',
    name: 'Mor',
    light: '#7A5BC4',
    dark: '#9377D4',
    defaultCategoryMatch: ['banyo', 'bathroom', 'kişisel bakım'],
  },
  {
    id: 'cat-6',
    cssVar: '--cat-6',
    name: 'Gül',
    light: '#C2487A',
    dark: '#D36693',
    defaultCategoryMatch: ['sağlık', 'eczane', 'health'],
  },
  {
    id: 'cat-7',
    cssVar: '--cat-7',
    name: 'Aklar',
    light: '#B8892B',
    dark: '#CCA047',
    defaultCategoryMatch: ['yedek parça', 'parça', 'spare', 'parts'],
  },
  {
    id: 'cat-8',
    cssVar: '--cat-8',
    name: 'Arduvaz',
    light: '#5F7185',
    dark: '#7A8B9E',
    defaultCategoryMatch: ['kablo', 'aksesuar', 'cable', 'accessories'],
  },
];

export function resolveCategoryCssVar(categoryName?: string | null): string {
  if (!categoryName) return 'rgb(var(--cat-8))';
  const normalized = categoryName.toLocaleLowerCase('tr-TR');
  const found = CATEGORY_COLORS.find((entry) =>
    entry.defaultCategoryMatch.some((keyword) => normalized.includes(keyword)),
  );
  return found ? `rgb(var(${found.cssVar}))` : 'rgb(var(--cat-8))';
}
