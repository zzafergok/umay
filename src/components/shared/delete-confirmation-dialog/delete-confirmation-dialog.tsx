'use client';

import { useState } from 'react';
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
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import { toBCP47Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { defaultCopy } from './constants';
import { DeleteAnimationStage } from './delete-animation-stage';
import type { DeleteConfirmationDialogProps, DeletePhase } from './types';

/** Shared destructive-action confirmation dialog for user-managed records. */
export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  entityLabel,
  itemName,
  itemIcon,
  itemColor,
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
  const isDeleting =
    phase === 'crumpling' || phase === 'tossing' || phase === 'waiting';

  const handleConfirm = async () => {
    if (isDeleting) return;
    setPhase('waiting');

    try {
      await onConfirm();
      setPhase('idle');
      onOpenChange(false);
    } catch {
      setPhase('error');
    }
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
        showCloseButton={!isDeleting}
        className="bg-surface-raised z-[60] max-w-[420px] gap-0 overflow-hidden rounded-2xl border-border p-0 sm:max-w-[420px] sm:p-0"
      >
        <div
          className={cn(
            'transition-opacity duration-150 motion-reduce:transition-none',
            isDeleting && 'pointer-events-none opacity-0',
          )}
          aria-hidden={isDeleting}
        >
          <DialogHeader className="space-y-1 px-5 pb-4 pr-11 pt-5 text-left">
            <DialogTitle className="font-heading text-text text-base font-semibold leading-snug tracking-tight">
              {title ?? dialogCopy.titleConfirm.replace('{label}', entityLabel)}
            </DialogTitle>
            <DialogDescription className="text-body-sm text-text-muted leading-relaxed">
              {description ??
                dialogCopy.description.replace('{label}', lowerEntityLabel)}
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 pb-4">
            <div className="bg-surface-sunken/70 rounded-xl border border-border/80 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-subtle text-[11px] font-medium uppercase tracking-wider">
                  {itemLabel ??
                    dialogCopy.itemLabel.replace('{label}', lowerEntityLabel)}
                </span>
                <span className="border-danger/20 bg-danger-subtle/80 text-danger inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium">
                  {dialogCopy.permanentBadge}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2.5">
                {itemIcon ? (
                  <div
                    className="bg-surface-raised flex size-8 shrink-0 items-center justify-center rounded-lg border border-border"
                    style={itemColor ? { color: itemColor } : undefined}
                  >
                    {itemIcon}
                  </div>
                ) : null}
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      !itemColor && 'bg-danger',
                    )}
                    style={
                      itemColor ? { backgroundColor: itemColor } : undefined
                    }
                    aria-hidden="true"
                  />
                  <p className="text-text truncate text-[15px] font-semibold">
                    {itemName}
                  </p>
                </div>
              </div>

              {details && details.length > 0 && (
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border/70 pt-2.5">
                  {details.map((detail) => (
                    <div key={detail.label} className="min-w-0">
                      <dt className="text-text-subtle text-[11px] font-medium">
                        {detail.label}
                      </dt>
                      <dd className="text-body-sm text-text mt-0.5 truncate font-semibold tabular-nums">
                        {detail.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {warning && (
              <div className="border-danger/20 bg-danger-subtle/50 text-danger mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-caption leading-relaxed">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <p>{warning}</p>
              </div>
            )}

            {phase === 'error' && (
              <div
                role="alert"
                className="border-danger/30 bg-danger-subtle text-danger mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-caption leading-relaxed"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <p>{dialogCopy.errorDescription}</p>
              </div>
            )}
          </div>

          <DialogFooter className="bg-surface-sunken/45 flex-col-reverse gap-2 border-t border-border/80 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => handleOpenChange(false)}
              className="h-9 rounded-lg px-4"
            >
              {dialogCopy.cancel}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirm}
              className="h-9 rounded-lg px-4 font-medium"
            >
              <Trash2 className="mr-1.5 size-4" aria-hidden="true" />
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
