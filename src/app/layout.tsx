import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/core/toast';
import { fontBody, fontHeading, fontMono } from '@/lib/fonts';
import { getCurrentLocale } from '@/lib/i18n/server-locale';
import { buildRootMetadata } from '@/lib/metadata/site-metadata';
import {
  ClientLocaleProvider,
  LocaleHtmlSync,
  QueryProvider,
  ThemeProvider,
} from '@/components/providers';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#121110' },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  return buildRootMetadata(locale);
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getCurrentLocale();

  return (
    <html
      lang={locale}
      className={`${fontBody.variable} ${fontHeading.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ClientLocaleProvider initialLocale={locale}>
          <LocaleHtmlSync />
          <ThemeProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </ClientLocaleProvider>
      </body>
    </html>
  );
}
