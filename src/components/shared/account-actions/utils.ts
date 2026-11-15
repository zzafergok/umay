import type { AuthUser } from '@/stores/use-auth-store';

export function getDisplayName(
  user: Pick<AuthUser, 'name' | 'email'> | null | undefined,
  fallback: string,
): string {
  const trimmedName = user?.name?.trim();
  if (trimmedName) return trimmedName;
  if (user?.email) return user.email.split('@')[0] || fallback;
  return fallback;
}

export function getUserInitials(
  user: Pick<AuthUser, 'name' | 'email'> | null | undefined,
): string {
  const source = user?.name?.trim() || user?.email?.split('@')[0] || 'U';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}
