import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/request-user';
import { getCurrentLocale } from '@/lib/i18n/server-locale';
import { getUserSettings } from '@/lib/inventory/repo';
import { SettingsClientView } from './components';
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

  return <SettingsClientView initialSettings={initialSettings} copy={copy} />;
}
