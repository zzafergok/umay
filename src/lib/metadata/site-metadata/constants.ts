const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  'https://umay.app';

export const siteMetadata = {
  name: 'Umay',
  legalName: 'Umay',
  description:
    'Evin bereketi, kayıt altında. Mutfak, elektronik eşya, kablo ve ömürlü yedek parçalar için mobil öncelikli ev envanter ve stok takip uygulaması.',
  url: new URL(siteUrl),
  creator: 'Umay',
  publisher: 'Umay',
  keywords: [
    'Umay',
    'ev envanteri',
    'stok takibi',
    'ömürlü parça',
    'home inventory',
    'stock tracking',
    'PWA',
  ],
  assets: {
    icon16: '/assets/images/favicon-16x16.png',
    icon32: '/assets/images/favicon-32x32.png',
    icon48: '/assets/images/favicon-48x48.png',
    shortcutIcon: '/favicon.ico',
    appleTouchIcon: '/assets/images/apple-touch-icon.png',
    android192: '/assets/images/android-chrome-192x192.png',
    android512: '/assets/images/android-chrome-512x512.png',
    logo: '/umay-icon.svg',
    openGraph: '/assets/images/android-chrome-512x512.png',
  },
  aiSummary:
    'Umay is a mobile-first home inventory, stock ledger, and lifecycle-aware spare parts tracking PWA built on Next.js App Router and Firebase.',
} as const;
