'use client';

import { Loader2, Trash2 } from 'lucide-react';
import type { DeletePhase } from './types';

interface DeleteAnimationStageProps {
  itemName: string;
  upperEntityLabel: string;
  phase: DeletePhase;
  dialogCopy: {
    deleting: string;
    deletingStatus: string;
    movingToTrashText: string;
    completingText: string;
  };
}

/** Calm, accessible overlay displayed while an irreversible deletion runs. */
export function DeleteAnimationStage({
  itemName,
  upperEntityLabel,
  phase,
  dialogCopy,
}: DeleteAnimationStageProps) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface-raised/95 p-6 text-center backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-label={`${itemName} ${dialogCopy.deleting}`}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl border border-danger/20 bg-danger-subtle text-danger">
        {phase === 'waiting' ? (
          <Loader2
            className="size-5 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <Trash2 className="size-5" aria-hidden="true" />
        )}
      </div>

      <div className="max-w-sm space-y-1">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">
          {upperEntityLabel} · {dialogCopy.deletingStatus}
        </p>
        <p className="break-words text-body-sm font-semibold text-text">
          {itemName}
        </p>
        <p className="text-caption text-text-muted">
          {phase === 'waiting'
            ? dialogCopy.completingText
            : dialogCopy.movingToTrashText}
        </p>
      </div>
    </div>
  );
}
