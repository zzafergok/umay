import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/request-user';
import { getCurrentLocale } from '@/lib/i18n/server-locale';
import { getUserSettings } from '@/lib/inventory/repo';
import {
  AccountActionsCard,
  InventoryRulesCard,
  QuickToolsCard,
  SettingsOverviewCard,
  ThemeSelectorCard,
} from './components';
import { getAuthSettingsCopy } from './i18n';
import type { SettingsSnapshot } from './types';

export async function AuthSettingsScreen() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/');
  }

  const [locale, settings] = await Promise.all([
    getCurrentLocale(),
    getUserSettings(user.uid),
  ]);

  const copy = getAuthSettingsCopy(locale);
  const initialSettings: SettingsSnapshot = {
    currency: settings.currency,
    dateFormat: settings.dateFormat,
    defaultUnit: settings.defaultUnit ?? 'adet',
    compactMode: settings.compactMode ?? false,
  };

  return (
    <div className="space-y-6">
      <SettingsOverviewCard
        initialSettings={initialSettings}
        openProfileLabel={copy.openProfileLabel}
        copy={copy.overview}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <ThemeSelectorCard
            initialCompactMode={initialSettings.compactMode}
            copy={copy.appearance}
          />
        </div>
        <div className="xl:col-span-5">
          <QuickToolsCard copy={copy.quickTools} />
        </div>
        <div className="xl:col-span-7">
          <InventoryRulesCard
            initialSettings={initialSettings}
            copy={copy.inventoryRules}
          />
        </div>
        <div className="xl:col-span-5">
          <AccountActionsCard copy={copy} />
        </div>
      </div>
    </div>
  );
}
