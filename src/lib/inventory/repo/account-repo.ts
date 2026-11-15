import {
  getAdminFirestore,
  getAdminStorage,
  isFirebaseConfigured,
} from '@/lib/firebase/admin';
import { clearMemoryStore } from '@/lib/inventory/memory-store';

function isDemoFallbackAllowed(): boolean {
  return process.env.ALLOW_DEMO_AUTH !== 'false';
}

export async function deleteAllUserData(uid: string): Promise<void> {
  clearMemoryStore(uid);

  if (!isFirebaseConfigured()) {
    return;
  }

  try {
    const db = getAdminFirestore();
    await db.recursiveDelete(db.collection('users').doc(uid));
  } catch (error) {
    if (!isDemoFallbackAllowed()) {
      throw error;
    }
    console.warn('Firestore user cleanup skipped in demo mode:', error);
  }

  try {
    const bucket = getAdminStorage().bucket();
    await bucket.deleteFiles({ prefix: `users/${uid}/` });
  } catch {
    // Storage bucket may be unconfigured or empty; non-fatal during account deletion.
  }
}
