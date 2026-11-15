import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/request-user';
import { getCurrentLocale } from '@/lib/i18n/server-locale';
import { listItems, listLocations, listParts } from '@/lib/inventory/repo';
import {
  ProfileDangerZoneCard,
  ProfileEditForm,
  ProfileOverviewCard,
  ProfileSessionCard,
} from './components';
import { getAuthProfileCopy } from './i18n';

export async function AuthProfileScreen() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/');
  }

  const [locale, items, locations, parts] = await Promise.all([
    getCurrentLocale(),
    listItems(user.uid),
    listLocations(user.uid),
    listParts(user.uid),
  ]);

  const copy = getAuthProfileCopy(locale);
  const userSnapshot = {
    id: user.uid,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return (
    <div className="max-w-4xl space-y-6">
      <ProfileOverviewCard
        initialUser={userSnapshot}
        stats={{
          items: items.length,
          locations: locations.length,
          parts: parts.length,
        }}
        copy={copy.overview}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileEditForm initialUser={userSnapshot} copy={copy.editForm} />
        <ProfileSessionCard
          userEmail={userSnapshot.email}
          copy={copy.sessionCard}
        />
      </div>

      <ProfileDangerZoneCard
        userEmail={userSnapshot.email}
        copy={copy.dangerZone}
      />
    </div>
  );
}
