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
      className="bg-surface-raised/95 absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-6 text-center backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-label={`${itemName} ${dialogCopy.deleting}`}
    >
      <div className="border-danger/20 bg-danger-subtle text-danger ring-danger/10 flex size-12 items-center justify-center rounded-2xl border ring-4">
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
        <p className="text-text-subtle font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
          {upperEntityLabel} · {dialogCopy.deletingStatus}
        </p>
        <p className="text-body-sm text-text break-words font-semibold">
          {itemName}
        </p>
        <p className="text-text-muted text-caption">
          {phase === 'waiting'
            ? dialogCopy.completingText
            : dialogCopy.movingToTrashText}
        </p>
      </div>
    </div>
  );
}
