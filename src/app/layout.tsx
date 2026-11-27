import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
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

const THEME_INIT_SCRIPT = `(()=>{try{var t=localStorage.getItem('umay-theme')||'system';var d=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(d);r.style.colorScheme=d;}catch(e){}})();`;

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
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html
      lang={locale}
      className={`${fontBody.variable} ${fontHeading.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body>
        <ClientLocaleProvider initialLocale={locale}>
          <LocaleHtmlSync />
          <ThemeProvider nonce={nonce}>
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
