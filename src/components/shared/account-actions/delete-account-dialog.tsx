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
        showCloseButton={!isPending}
        mobilePresentation="sheet"
        className="max-h-[92dvh] gap-0 overflow-y-auto overflow-x-hidden border-border bg-surface-raised p-0 sm:max-w-[460px] sm:p-0"
      >
        <DialogHeader className="flex-row items-start gap-3 space-y-0 px-5 pb-4 pr-11 pt-5 text-left">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-danger/20 bg-danger-subtle text-danger">
            <AlertTriangle className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <DialogTitle className="font-heading text-base font-semibold leading-snug tracking-tight text-text">
              {copy.deleteDialogTitle}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-text-muted">
              {copy.deleteDialogDescription}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form<DeleteAccountFormData>
          schema={schema}
          defaultValues={{ confirmEmail: '' }}
          onSubmit={handleConfirm}
          className="space-y-4"
        >
          <div className="space-y-3.5 px-5 pb-1">
            <div className="rounded-xl border border-border/80 bg-surface-sunken/70 p-3.5">
              <p className="text-caption font-semibold text-text">
                {copy.deleteScopeTitle}
              </p>
              <ul className="mt-2 space-y-1.5 text-caption text-text-muted">
                {copy.deleteScopeItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <TextField
              name="confirmEmail"
              type="email"
              label={`${copy.deleteConfirmEmailLabel} (${userEmail})`}
              placeholder={userEmail || copy.deleteConfirmEmailPlaceholder}
              autoComplete="email"
              disabled={isPending}
              required
            />
          </div>

          <DialogFooter className="flex-col-reverse gap-2 border-t border-border/80 bg-surface-sunken/45 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-lg px-4"
            >
              {copy.deleteCancelLabel}
            </Button>
            <SubmitButton
              variant="destructive"
              size="sm"
              isLoading={isPending}
              loadingText={copy.deleteLoadingLabel}
              icon={<Trash2 className="size-4" aria-hidden="true" />}
              className="h-9 rounded-lg px-4 font-medium"
            >
              {copy.deleteConfirmLabel}
            </SubmitButton>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
