export interface TypographyStep {
  token: string;
  sizePx: number;
  lineHeightPx: number;
  weight: string;
  family: 'heading' | 'body' | 'mono';
  letterSpacing?: string;
  usage: string;
}

export const FONT_FAMILIES = {
  heading: 'Manrope',
  body: 'Inter',
  mono: 'JetBrains Mono',
} as const;

export const TYPOGRAPHY_SCALE: TypographyStep[] = [
  {
    token: 'display',
    sizePx: 28,
    lineHeightPx: 36,
    weight: '700',
    family: 'heading',
    letterSpacing: '-0.01em',
    usage: 'Sayfa başlığı (mobilde 24/32)',
  },
  {
    token: 'title',
    sizePx: 20,
    lineHeightPx: 28,
    weight: '600',
    family: 'heading',
    usage: 'Bölüm ve kart başlığı, sheet başlığı',
  },
  {
    token: 'body',
    sizePx: 16,
    lineHeightPx: 24,
    weight: '400',
    family: 'body',
    usage: 'Okuma metni, form girdileri',
  },
  {
    token: 'body-sm',
    sizePx: 14,
    lineHeightPx: 20,
    weight: '400 / 500',
    family: 'body',
    usage: 'Varsayılan arayüz metni, liste satırı',
  },
  {
    token: 'caption',
    sizePx: 12,
    lineHeightPx: 16,
    weight: '500',
    family: 'body',
    usage: 'Etiket, meta, zaman damgası',
  },
  {
    token: 'metric',
    sizePx: 28,
    lineHeightPx: 32,
    weight: '700',
    family: 'heading',
    usage: 'Kartın birincil metriği (stok sayısı, kalan gün)',
  },
];
