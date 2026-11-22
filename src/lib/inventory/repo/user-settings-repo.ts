import type { UserSettings } from '@/features/inventory/types';
import type { UserSettingsInput } from '@/features/inventory/schemas';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getUserVault } from '@/lib/inventory/memory-store';

function omitUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as T;
}

const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'updatedAt'> = {
  currency: 'TRY',
  dateFormat: 'dd.MM.yyyy',
  defaultUnit: 'adet',
  compactMode: false,
};

export async function getUserSettings(uid: string): Promise<UserSettings> {
  if (!isFirebaseConfigured()) {
    return {
      ...DEFAULT_USER_SETTINGS,
      ...getUserVault(uid).settings,
    };
  }
  const doc = await getAdminFirestore()
    .collection('users')
    .doc(uid)
    .collection('settings')
    .doc('preferences')
    .get();
  if (!doc.exists) {
    return {
      ...DEFAULT_USER_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
  }
  const docData = doc.data() as Partial<UserSettings>;
  return {
    ...DEFAULT_USER_SETTINGS,
    ...docData,
    updatedAt: docData.updatedAt ?? new Date().toISOString(),
  };
}

export async function updateUserSettings(
  uid: string,
  input: UserSettingsInput,
): Promise<UserSettings> {
  const current = await getUserSettings(uid);
  const updated: UserSettings = omitUndefined<UserSettings>({
    ...DEFAULT_USER_SETTINGS,
    ...current,
    ...omitUndefined(input),
    updatedAt: new Date().toISOString(),
  });
  if (!isFirebaseConfigured()) {
    getUserVault(uid).settings = updated;
    return updated;
  }
  await getAdminFirestore()
    .collection('users')
    .doc(uid)
    .collection('settings')
    .doc('preferences')
    .set(updated);
  return updated;
}
