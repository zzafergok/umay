'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/core/avatar';
import { Button } from '@/components/core/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/core/dropdown-menu';
import { Link } from '@/components/core/link';
import { toast } from '@/components/core/toast';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import { useCurrentUserQuery, useLogoutMutation } from '@/hooks/use-auth-hooks';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/use-auth-store';
import { getAccountActionsCopy } from './i18n';
import type { UserAccountMenuProps } from './types';
import { getDisplayName, getUserInitials } from './utils';

export function UserAccountMenu({ className }: UserAccountMenuProps) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const copy = getAccountActionsCopy(locale);
  const storeUser = useAuthStore((state) => state.user);
  const { data } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();

  const user = data?.user ?? storeUser;
  const displayName = getDisplayName(user, copy.fallbackName);
  const initials = getUserInitials(user);

  const handleLogout = async () => {
    if (logoutMutation.isPending) return;
    try {
      await logoutMutation.mutateAsync();
      toast.success(copy.logoutSuccess);
    } catch {
      toast.warning(copy.logoutError);
    } finally {
      router.replace('/');
      router.refresh();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-label={displayName}
          className={cn('gap-2 px-2 sm:px-2.5', className)}
        >
          <Avatar size="sm" className="size-6 border-border">
            <AvatarFallback className="bg-accent-subtle text-caption font-semibold text-accent">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[120px] truncate text-caption font-medium sm:inline">
            {displayName}
          </span>
          <ChevronDown
            className="hidden h-3.5 w-3.5 text-text-muted sm:inline"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-0.5">
            <span className="truncate text-body-sm font-semibold text-text">
              {displayName}
            </span>
            {user?.email && (
              <span className="truncate text-caption text-text-muted">
                {user.email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            <span>{copy.menuProfile}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" aria-hidden="true" />
            <span>{copy.menuSettings}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logoutMutation.isPending}
          onSelect={() => void handleLogout()}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>
            {logoutMutation.isPending
              ? copy.logoutLoadingLabel
              : copy.logoutLabel}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
