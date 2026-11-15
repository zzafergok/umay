import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { getCurrentLocale } from '@/lib/i18n/server-locale';
import { AuthSettingsForm } from './components/auth-settings-form';
import { BackupAndExportCard } from './components/backup-export-card';
import { ThemeSelectorCard } from './components/theme-selector-card';
import { getAuthSettingsCopy } from './i18n';

export async function AuthSettingsScreen() {
  const locale = await getCurrentLocale();
  const copy = getAuthSettingsCopy(locale);

  return (
    <div className="max-w-3xl space-y-4">
      <ThemeSelectorCard />
      <Card>
        <CardHeader>
          <CardTitle>{copy.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthSettingsForm copy={copy} />
        </CardContent>
      </Card>
      <BackupAndExportCard />
    </div>
  );
}
