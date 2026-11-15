'use client';

import { Avatar, AvatarFallback } from '@/components/core/avatar';
import { Link } from '@/components/core/link';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import { useCurrentUserQuery } from '@/hooks/use-auth-hooks';
import { useAuthStore } from '@/stores/use-auth-store';
import { getAccountActionsCopy } from './i18n';
import { LogoutButton } from './logout-button';
import type { SidebarUserFooterProps } from './types';
import { getDisplayName, getUserInitials } from './utils';

export function SidebarUserFooter({
  collapsed = false,
}: SidebarUserFooterProps) {
  const locale = useCurrentLocale();
  const copy = getAccountActionsCopy(locale);
  const storeUser = useAuthStore((state) => state.user);
  const { data } = useCurrentUserQuery();

  const user = data?.user ?? storeUser;
  const displayName = getDisplayName(user, copy.fallbackName);
  const initials = getUserInitials(user);

  if (collapsed) {
    return (
      <div className="flex w-full flex-col items-center gap-2">
        <Link
          href="/profile"
          aria-label={copy.menuProfile}
          title={displayName}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Avatar size="sm" className="border-border">
            <AvatarFallback className="bg-accent-subtle text-accent text-caption font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <LogoutButton
          iconOnly
          variant="ghost"
          size="icon-xs"
          ariaLabel={copy.logoutLabel}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <Link
        href="/profile"
        className="hover:bg-surface-sunken flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors"
      >
        <Avatar size="sm" className="shrink-0 border-border">
          <AvatarFallback className="bg-accent-subtle text-accent text-caption font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-body-sm text-text truncate font-medium">
            {displayName}
          </p>
          {user?.email && (
            <p className="text-text-muted truncate text-caption">
              {user.email}
            </p>
          )}
        </div>
      </Link>
      <LogoutButton
        iconOnly
        variant="ghost"
        size="icon-sm"
        ariaLabel={copy.logoutLabel}
      />
    </div>
  );
}
