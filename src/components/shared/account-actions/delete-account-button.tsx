'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/core/button';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import { useCurrentUserQuery } from '@/hooks/use-auth-hooks';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/use-auth-store';
import { DeleteAccountDialog } from './delete-account-dialog';
import { getAccountActionsCopy } from './i18n';
import type { DeleteAccountButtonProps } from './types';

export function DeleteAccountButton({
  userEmail,
  label,
  redirectTo = '/',
  variant = 'danger',
  size = 'default',
  fullWidth = false,
  className,
  onDeleted,
}: DeleteAccountButtonProps) {
  const [open, setOpen] = useState(false);
  const locale = useCurrentLocale();
  const copy = getAccountActionsCopy(locale);
  const storeEmail = useAuthStore((state) => state.user?.email);
  const { data } = useCurrentUserQuery(!userEmail && !storeEmail);

  const resolvedEmail = userEmail ?? storeEmail ?? data?.user?.email ?? '';

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={!resolvedEmail}
        onClick={() => setOpen(true)}
        className={cn(fullWidth && 'w-full', className)}
      >
        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
        <span>{label ?? copy.deleteLabel}</span>
      </Button>

      {resolvedEmail && (
        <DeleteAccountDialog
          open={open}
          onOpenChange={setOpen}
          userEmail={resolvedEmail}
          redirectTo={redirectTo}
          onDeleted={onDeleted}
        />
      )}
    </>
  );
}
