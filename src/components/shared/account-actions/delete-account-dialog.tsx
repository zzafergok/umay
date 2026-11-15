'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { toast } from '@/components/core/toast';
import { Form, SubmitButton, TextField } from '@/components/forms';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import { useDeleteAccountMutation } from '@/hooks/use-auth-hooks';
import {
  createDeleteAccountSchema,
  type DeleteAccountFormData,
} from '@/lib/auth/auth-schema';
import { getAccountActionsCopy } from './i18n';
import type { DeleteAccountDialogProps } from './types';

export function DeleteAccountDialog({
  open,
  onOpenChange,
  userEmail,
  redirectTo = '/',
  onDeleted,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const copy = getAccountActionsCopy(locale);
  const deleteAccountMutation = useDeleteAccountMutation();

  const schema = useMemo(
    () => createDeleteAccountSchema(userEmail, copy.deleteConfirmMismatch),
    [userEmail, copy.deleteConfirmMismatch],
  );

  const isPending = deleteAccountMutation.isPending;

  const handleConfirm = async (data: DeleteAccountFormData) => {
    try {
      await deleteAccountMutation.mutateAsync(data);
      toast.success(copy.deleteSuccess);
      onOpenChange(false);
      onDeleted?.();
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : copy.deleteError;
      toast.error(message);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        dismissible={!isPending}
        className="border-danger/40 bg-surface-raised max-w-md"
      >
        <DialogHeader>
          <div className="border-danger/40 bg-danger-subtle text-danger mb-2 flex h-10 w-10 items-center justify-center rounded-md border">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogTitle>{copy.deleteDialogTitle}</DialogTitle>
          <DialogDescription>{copy.deleteDialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="border-danger/25 bg-danger-subtle/50 rounded-md border p-3.5">
          <p className="text-danger text-caption font-semibold">
            {copy.deleteScopeTitle}
          </p>
          <ul className="text-text-muted mt-2 space-y-1 text-caption">
            {copy.deleteScopeItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="bg-danger mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Form<DeleteAccountFormData>
          schema={schema}
          defaultValues={{ confirmEmail: '' }}
          onSubmit={handleConfirm}
          className="space-y-4"
        >
          <TextField
            name="confirmEmail"
            type="email"
            label={`${copy.deleteConfirmEmailLabel} (${userEmail})`}
            placeholder={userEmail || copy.deleteConfirmEmailPlaceholder}
            autoComplete="email"
            disabled={isPending}
            required
          />

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {copy.deleteCancelLabel}
            </Button>
            <SubmitButton
              variant="destructive"
              isLoading={isPending}
              loadingText={copy.deleteLoadingLabel}
              icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
            >
              {copy.deleteConfirmLabel}
            </SubmitButton>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
