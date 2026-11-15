import { Inter, JetBrains_Mono, Manrope } from 'next/font/google';

export const fontBody = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

export const fontHeading = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
