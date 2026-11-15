import { describe, expect, it } from 'vitest';
import { getAccountActionsCopy } from '@/components/shared/account-actions/i18n';
import { getShellCopy } from '@/features/routes/_shared/layouts/i18n';
import { getAuthHomeCopy } from '@/features/routes/auth/home/i18n';
import { getAuthProfileCopy } from '@/features/routes/auth/profile/i18n';
import { getAuthSettingsCopy } from '@/features/routes/auth/settings/i18n';
import { getAuthWorkspaceCopy } from '@/features/routes/auth/workspace/i18n';
import { getPublicHomeCopy } from '@/features/routes/public/home/i18n';
import {
  enRouteMetadata,
  routeMetadata,
  trRouteMetadata,
} from '@/lib/metadata/site-metadata';

describe('i18n JSON Dictionaries & Copy Loaders', () => {
  const locales = ['tr', 'en'] as const;

  it('loads shell copy for all locales without missing keys', () => {
    for (const locale of locales) {
      const copy = getShellCopy(locale);
      expect(copy).toBeDefined();
      expect(copy.brand.title).toBe('Umay');
      expect(copy.authNav.length).toBeGreaterThan(0);
      expect(copy.accountNav?.some((item) => item.href === '/profile')).toBe(
        true,
      );
      expect(copy.preferenceControls?.themeLight).toBeTruthy();
      expect(copy.preferenceControls?.themeDark).toBeTruthy();
    }
  });

  it('loads auth route copies with valid content for tr and en', () => {
    for (const locale of locales) {
      const home = getAuthHomeCopy(locale);
      expect(home.title).toBeTruthy();
      expect(home.metrics.length).toBe(3);

      const settings = getAuthSettingsCopy(locale);
      expect(settings.title).toBeTruthy();
      expect(settings.displayNameLabel).toBeTruthy();
      expect(settings.openProfileLabel).toBeTruthy();
      expect(settings.overview.activeConfigTitle).toBeTruthy();
      expect(settings.appearance.title).toBeTruthy();
      expect(settings.inventoryRules.submitLabel).toBeTruthy();
      expect(settings.quickTools.title).toBeTruthy();

      const profile = getAuthProfileCopy(locale);
      expect(profile.title).toBeTruthy();
      expect(profile.editForm.submitLabel).toBeTruthy();
      expect(profile.preferences.submitLabel).toBeTruthy();
      expect(profile.recentActivity.title).toBeTruthy();
      expect(profile.dangerZone.title).toBeTruthy();

      const accountActions = getAccountActionsCopy(locale);
      expect(accountActions.logoutLabel).toBeTruthy();
      expect(accountActions.deleteLabel).toBeTruthy();
      expect(accountActions.deleteScopeItems.length).toBeGreaterThan(0);

      const workspace = getAuthWorkspaceCopy(locale);
      expect(workspace.title).toBeTruthy();
      expect(workspace.lanes.length).toBe(3);
    }
  });

  it('loads public route copies with rich content for tr and en', () => {
    for (const locale of locales) {
      const home = getPublicHomeCopy(locale);
      expect(home.hero.title).toBeTruthy();
      expect(home.featuresSection.cards.length).toBe(6);
      expect(home.quickRoutesSection.routes.length).toBe(5);
    }
  });

  it('validates site metadata dictionaries in JSON format', () => {
    const routeKeys = Object.keys(routeMetadata);
    expect(routeKeys.length).toBeGreaterThan(0);

    for (const key of routeKeys) {
      const trMeta = trRouteMetadata[key as keyof typeof trRouteMetadata];
      const enMeta = enRouteMetadata[key as keyof typeof enRouteMetadata];

      expect(trMeta).toBeDefined();
      expect(enMeta).toBeDefined();
      expect(trMeta.title).toBeTruthy();
      expect(enMeta.title).toBeTruthy();
      expect(trMeta.description).toBeTruthy();
      expect(enMeta.description).toBeTruthy();
    }
  });
});
