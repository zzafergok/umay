import { getCurrentLocale } from '@/lib/i18n/server-locale';
import { PublicHomeClient } from './components/public-home-client';
import { getPublicHomeCopy } from './i18n';
import type { PublicMobileTabKey } from './types';

export interface PublicHomeScreenProps {
  initialTab?: PublicMobileTabKey;
}

export async function PublicHomeScreen({
  initialTab = 'start',
}: PublicHomeScreenProps) {
  const locale = await getCurrentLocale();
  return (
    <PublicHomeClient
      copy={getPublicHomeCopy(locale)}
      initialTab={initialTab}
    />
  );
}
