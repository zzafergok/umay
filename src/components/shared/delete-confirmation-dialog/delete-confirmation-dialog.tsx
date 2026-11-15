'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { cn } from '@/lib/utils';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import { toBCP47Locale } from '@/i18n/routing';
import { DeleteAnimationStage } from './delete-animation-stage';
import { defaultCopy, wait } from './constants';
import type { DeleteConfirmationDialogProps, DeletePhase } from './types';

/** Shared destructive-action confirmation dialog for user-managed records. */
export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  entityLabel,
  itemName,
  title,
  description,
  itemLabel,
  details,
  warning,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const locale = useCurrentLocale();
  const bcp47Locale = toBCP47Locale(locale);
  const dialogCopy = defaultCopy[locale === 'tr' ? 'tr' : 'en'];

  const [phase, setPhase] = useState<DeletePhase>('idle');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const isDeleting =
    phase === 'crumpling' || phase === 'tossing' || phase === 'waiting';

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);
    return () => mediaQuery.removeEventListener('change', syncPreference);
  }, []);

  const handleConfirm = async () => {
    if (isDeleting) return;

    const deletionResult = Promise.resolve()
      .then(() => onConfirm())
      .then(
        () => true,
        () => false,
      );

    if (prefersReducedMotion) {
      setPhase('waiting');
    } else {
      setPhase('crumpling');
      await wait(420);
      setPhase('tossing');
      await wait(760);
      setPhase('waiting');
    }

    const wasDeleted = await deletionResult;
    if (wasDeleted) {
      onOpenChange(false);
      return;
    }

    setPhase('error');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return;
    if (!nextOpen) setPhase('idle');
    onOpenChange(nextOpen);
  };

  const lowerEntityLabel = entityLabel.toLocaleLowerCase(bcp47Locale);
  const upperEntityLabel = entityLabel.toLocaleUpperCase(bcp47Locale);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dismissible={!isDeleting}
        hideCloseButton
        className="bg-surface-raised border-danger/50 z-[60] max-w-md overflow-hidden rounded-lg p-0"
      >
        <div
          className={cn(
            'opacity-100 transition-[opacity,transform] duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-none',
            isDeleting && 'pointer-events-none scale-[0.985] opacity-0',
          )}
          aria-hidden={isDeleting}
        >
          <DialogHeader className="border-b border-border p-6 text-left">
            <div className="border-danger/40 bg-danger-subtle text-danger mb-3 flex h-10 w-10 items-center justify-center rounded-md border">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <DialogTitle className="font-heading text-title text-text text-left">
              {title ?? dialogCopy.titleConfirm.replace('{label}', entityLabel)}
            </DialogTitle>
            <DialogDescription className="text-body-sm text-text-muted pt-2 text-left leading-relaxed">
              {phase === 'error'
                ? dialogCopy.errorDescription
                : (description ??
                  dialogCopy.description.replace('{label}', lowerEntityLabel))}
            </DialogDescription>
          </DialogHeader>

          <div className="border-danger/30 bg-danger-subtle/50 mx-6 my-4 rounded-md border px-4 py-3">
            <p className="text-text-muted text-caption">
              {itemLabel ??
                dialogCopy.itemLabel.replace('{label}', lowerEntityLabel)}
            </p>
            <p className="text-body-sm text-danger mt-1 truncate font-semibold">
              {itemName}
            </p>
            {details && details.length > 0 && (
              <dl className="border-danger/20 mt-3 grid gap-2 border-t pt-3 text-caption sm:grid-cols-2">
                {details.map((detail) => (
                  <div key={detail.label}>
                    <dt className="text-text-muted text-caption">
                      {detail.label}
                    </dt>
                    <dd className="text-text mt-0.5 font-semibold">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {warning && (
            <p className="border-danger/30 bg-danger-subtle text-danger mx-6 mb-4 rounded-md border px-4 py-3 text-caption leading-relaxed">
              {warning}
            </p>
          )}

          <DialogFooter className="border-t border-border px-6 py-4 sm:space-x-3">
            <Button
              type="button"
              variant="secondary"
              disabled={isDeleting}
              onClick={() => handleOpenChange(false)}
            >
              {dialogCopy.cancel}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isDeleting}
              onClick={handleConfirm}
            >
              {isDeleting ? dialogCopy.deleting : dialogCopy.confirm}
            </Button>
          </DialogFooter>
        </div>

        {isDeleting && (
          <DeleteAnimationStage
            itemName={itemName}
            upperEntityLabel={upperEntityLabel}
            phase={phase}
            dialogCopy={dialogCopy}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
