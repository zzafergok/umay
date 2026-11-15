import { enRouteMetadata, trRouteMetadata } from './dictionaries';
import type { MetadataRouteId, RouteMetadataDescriptor } from './types';

export const routeMetadata: Record<MetadataRouteId, RouteMetadataDescriptor> = {
  publicHome: {
    path: '/',
    section: 'public',
    robots: { index: true, follow: true },
    locale: {
      en: enRouteMetadata.publicHome,
      tr: trRouteMetadata.publicHome,
    },
  },
  authHome: {
    path: '/home',
    section: 'auth',
    robots: { index: false, follow: false },
    locale: {
      en: enRouteMetadata.authHome,
      tr: trRouteMetadata.authHome,
    },
  },
  authWorkspace: {
    path: '/workspace',
    section: 'auth',
    robots: { index: false, follow: false },
    locale: {
      en: enRouteMetadata.authWorkspace,
      tr: trRouteMetadata.authWorkspace,
    },
  },
  authSettings: {
    path: '/settings',
    section: 'auth',
    robots: { index: false, follow: false },
    locale: {
      en: enRouteMetadata.authSettings,
      tr: trRouteMetadata.authSettings,
    },
  },
  authProfile: {
    path: '/profile',
    section: 'auth',
    robots: { index: false, follow: false },
    locale: {
      en: enRouteMetadata.authProfile,
      tr: trRouteMetadata.authProfile,
    },
  },
};
