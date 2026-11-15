'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/core/button';
import { LoadingSpinner } from '@/components/core/spinner';
import { toast } from '@/components/core/toast';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import { useLogoutMutation } from '@/hooks/use-auth-hooks';
import { cn } from '@/lib/utils';
import { getAccountActionsCopy } from './i18n';
import type { LogoutButtonProps } from './types';

export function LogoutButton({
  label,
  loadingLabel,
  redirectTo = '/',
  variant = 'secondary',
  size = 'default',
  fullWidth = false,
  showIcon = true,
  iconOnly = false,
  className,
  ariaLabel,
  onLoggedOut,
}: LogoutButtonProps) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const copy = getAccountActionsCopy(locale);
  const logoutMutation = useLogoutMutation();

  const resolvedLabel = label ?? copy.logoutLabel;
  const resolvedLoadingLabel = loadingLabel ?? copy.logoutLoadingLabel;

  const handleLogout = async () => {
    if (logoutMutation.isPending) return;
    try {
      await logoutMutation.mutateAsync();
      toast.success(copy.logoutSuccess);
    } catch {
      toast.warning(copy.logoutError);
    } finally {
      onLoggedOut?.();
      router.replace(redirectTo);
      router.refresh();
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={iconOnly && size === 'default' ? 'icon-sm' : size}
      disabled={logoutMutation.isPending}
      onClick={() => void handleLogout()}
      aria-label={ariaLabel ?? resolvedLabel}
      title={iconOnly ? resolvedLabel : undefined}
      className={cn(fullWidth && 'w-full', className)}
    >
      {logoutMutation.isPending ? (
        <>
          <LoadingSpinner size="sm" className={cn(!iconOnly && 'mr-2')} />
          {!iconOnly && <span>{resolvedLoadingLabel}</span>}
        </>
      ) : (
        <>
          {showIcon && (
            <LogOut
              className={cn('h-4 w-4', !iconOnly && 'mr-2')}
              aria-hidden="true"
            />
          )}
          {!iconOnly && <span>{resolvedLabel}</span>}
        </>
      )}
    </Button>
  );
}
