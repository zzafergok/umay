'use client';

import { AlertTriangle, Check, Circle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/core/progress';
import type { ReceiptTotalsCheck } from '@/lib/ai/receipt-analyzer';
import { cn } from '@/lib/utils';
import {
  computeReceiptProgress,
  useElapsedSeconds,
  type ReceiptStage,
} from './use-receipt-progress';

type StepState = 'done' | 'active' | 'pending' | 'warning';

interface StepView {
  key: string;
  label: string;
  state: StepState;
  detail?: string;
}

function describeTotals(check?: ReceiptTotalsCheck): {
  state: StepState;
  detail: string;
} {
  if (check?.status === 'match') {
    return { state: 'done', detail: 'Ara toplam fişle eşleşti' };
  }
  if (check?.status === 'mismatch' && check.difference !== null) {
    const sign = check.difference > 0 ? '+' : '';
    return {
      state: 'warning',
      detail: `Fiş ara toplamıyla fark: ${sign}${check.difference.toFixed(2)}`,
    };
  }
  return { state: 'done', detail: 'Fişte ara toplam bulunamadı, doğrulanamadı' };
}

function buildSteps(
  stage: ReceiptStage,
  check?: ReceiptTotalsCheck,
): StepView[] {
  const afterReading = stage === 'enriching';
  const totals = describeTotals(check);
  return [
    {
      key: 'reading',
      label: 'Fiş görselleri okunuyor (AI)',
      state: afterReading ? 'done' : 'active',
    },
    {
      key: 'verifying',
      label: 'Toplamlar doğrulanıyor',
      state: afterReading ? totals.state : 'pending',
      detail: afterReading ? totals.detail : undefined,
    },
    {
      key: 'enriching',
      label: 'Ürün adları ve kategoriler düzenleniyor',
      state: afterReading ? 'active' : 'pending',
    },
  ];
}

const STEP_ICON_CLASS = 'h-3.5 w-3.5 shrink-0';

function StepIcon({ state }: { state: StepState }) {
  if (state === 'done') {
    return <Check className={cn(STEP_ICON_CLASS, 'text-accent')} aria-hidden />;
  }
  if (state === 'active') {
    return (
      <Loader2
        className={cn(STEP_ICON_CLASS, 'text-accent animate-spin')}
        aria-hidden
      />
    );
  }
  if (state === 'warning') {
    return (
      <AlertTriangle
        className={cn(STEP_ICON_CLASS, 'text-amber-600')}
        aria-hidden
      />
    );
  }
  return (
    <Circle className={cn(STEP_ICON_CLASS, 'text-text-muted')} aria-hidden />
  );
}

interface ReceiptProgressBodyProps {
  stage: Exclude<ReceiptStage, 'idle'>;
  totalsCheck?: ReceiptTotalsCheck;
}

function ReceiptProgressBody({ stage, totalsCheck }: ReceiptProgressBodyProps) {
  const elapsedSec = useElapsedSeconds();
  const percent = Math.round(computeReceiptProgress(stage, elapsedSec));
  const steps = buildSteps(stage, totalsCheck);

  return (
    <div
      className="border-border/70 space-y-2.5 rounded-lg border p-3"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2 text-caption">
        <span className="font-medium">Fiş analiz ediliyor</span>
        <span className="text-text-muted font-mono tabular-nums">
          %{percent} · {Math.floor(elapsedSec)} sn
        </span>
      </div>
      <Progress value={percent} aria-label="Fiş analiz ilerlemesi" />
      <ol className="space-y-1.5">
        {steps.map((step) => (
          <li key={step.key} className="flex items-start gap-2 text-caption">
            <span className="mt-0.5">
              <StepIcon state={step.state} />
            </span>
            <span
              className={cn(
                step.state === 'pending' && 'text-text-muted',
                step.state === 'active' && 'font-medium',
              )}
            >
              {step.label}
              {step.detail && (
                <span className="text-text-muted block font-normal">
                  {step.detail}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
      {stage === 'reading' && (
        <p className="text-text-muted text-caption">
          Uzun fişlerde model ve parça sayısına göre genellikle 20–90 sn sürer.
        </p>
      )}
    </div>
  );
}

interface ReceiptProgressProps {
  stage: ReceiptStage;
  totalsCheck?: ReceiptTotalsCheck;
}

export function ReceiptProgress({ stage, totalsCheck }: ReceiptProgressProps) {
  if (stage === 'idle') return null;
  // `key` aşama değişince sayaç ve yüzdeyi sıfırlar.
  return (
    <ReceiptProgressBody key={stage} stage={stage} totalsCheck={totalsCheck} />
  );
}
