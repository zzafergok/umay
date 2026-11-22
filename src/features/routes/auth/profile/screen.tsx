import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/request-user';
import { getAdminAuth, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getCurrentLocale } from '@/lib/i18n/server-locale';
import {
  listCategories,
  listItems,
  listLocations,
  listParts,
  listShoppingItems,
  listStockMovements,
} from '@/lib/inventory/repo';
import {
  ProfileDangerZoneCard,
  ProfileEditForm,
  ProfileOverviewCard,
  ProfileRecentActivityCard,
  ProfileSessionCard,
} from './components';
import { getAuthProfileCopy } from './i18n';
import type { ProfileRecentMovement, ProfileSessionMeta } from './types';

async function resolveSessionMeta(
  user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>,
): Promise<ProfileSessionMeta> {
  const baseMeta: ProfileSessionMeta = {
    provider: user.uid.startsWith('demo_') ? 'demo' : 'firebase',
    emailVerified: null,
    sessionIssuedAt: user.sessionIssuedAt,
    sessionExpiresAt: user.sessionExpiresAt,
  };

  if (!isFirebaseConfigured() || user.uid.startsWith('demo_')) {
    return baseMeta;
  }

  try {
    const record = await getAdminAuth().getUser(user.uid);
    const providerIds = record.providerData.map((entry) => entry.providerId);
    const provider: ProfileSessionMeta['provider'] = providerIds.includes(
      'google.com',
    )
      ? 'google'
      : providerIds.includes('password')
        ? 'password'
        : 'firebase';

    return {
      ...baseMeta,
      provider,
      emailVerified: record.emailVerified,
      accountCreatedAt: record.metadata.creationTime,
      lastSignInAt: record.metadata.lastSignInTime,
    };
  } catch {
    return baseMeta;
  }
}

export async function AuthProfileScreen() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/');
  }

  const [
    locale,
    items,
    allItems,
    locations,
    parts,
    categories,
    shoppingItems,
    movements,
    sessionMeta,
  ] = await Promise.all([
    getCurrentLocale(),
    listItems(user.uid),
    listItems(user.uid, true),
    listLocations(user.uid),
    listParts(user.uid),
    listCategories(user.uid),
    listShoppingItems(user.uid),
    listStockMovements(user.uid),
    resolveSessionMeta(user),
  ]);

  const copy = getAuthProfileCopy(locale);
  const userSnapshot = {
    id: user.uid,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const itemNameMap = new Map(allItems.map((item) => [item.id, item.name]));
  const recentMovements: ProfileRecentMovement[] = movements
    .slice(0, 5)
    .map((movement) => ({
      id: movement.id,
      itemId: movement.itemId,
      itemName:
        itemNameMap.get(movement.itemId) ??
        copy.recentActivity.fallbackItemName,
      type: movement.type,
      delta: movement.delta,
      quantityAfter: movement.quantityAfter,
      reason: movement.reason,
      at: movement.at,
    }));

  return (
    <div className="space-y-6">
      <ProfileOverviewCard
        initialUser={userSnapshot}
        stats={{
          items: items.length,
          locations: locations.length,
          parts: parts.length,
          categories: categories.length,
          shopping: shoppingItems.filter((entry) => !entry.done).length,
        }}
        sessionMeta={sessionMeta}
        copy={copy.overview}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <ProfileEditForm initialUser={userSnapshot} copy={copy.editForm} />
          <ProfileRecentActivityCard
            movements={recentMovements}
            copy={copy.recentActivity}
          />
        </div>

        <div className="space-y-6 xl:col-span-5">
          <ProfileSessionCard
            userEmail={userSnapshot.email}
            sessionMeta={sessionMeta}
            providerLabels={copy.overview.providers}
            copy={copy.sessionCard}
          />
          <ProfileDangerZoneCard
            userEmail={userSnapshot.email}
            copy={copy.dangerZone}
          />
        </div>
      </div>
    </div>
  );
}
