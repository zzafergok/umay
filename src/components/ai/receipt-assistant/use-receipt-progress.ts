import * as React from 'react';

/** Fiş analizinin ekranda gösterilen aşamaları (`idle`: işlem yok). */
export type ReceiptStage = 'idle' | 'reading' | 'enriching';

const TICK_MS = 250;

/** `floor`'dan başlayıp `floor + span` değerine asimptotik yaklaşan ilerleme (sahte %100 yok). */
function easeTo(
  floor: number,
  span: number,
  seconds: number,
  tau: number,
): number {
  return floor + span * (1 - Math.exp(-seconds / tau));
}

/**
 * Sunucu ilerleme akışı göndermediği için aşama içi yüzde, geçen süreye göre tahmin edilir;
 * aşama geçişleri ise gerçek yanıtlara bağlıdır (okuma → %86 → düzenleme → %97).
 */
export function computeReceiptProgress(
  stage: ReceiptStage,
  elapsedSec: number,
): number {
  if (stage === 'reading') return easeTo(4, 78, elapsedSec, 40);
  if (stage === 'enriching') return easeTo(86, 11, elapsedSec, 12);
  return 0;
}

/** Bileşen mount olduğundan beri geçen saniye (aşama değişince `key` ile sıfırlanır). */
export function useElapsedSeconds(): number {
  const [elapsedMs, setElapsedMs] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(
      () => setElapsedMs((previous) => previous + TICK_MS),
      TICK_MS,
    );
    return () => window.clearInterval(id);
  }, []);
  return elapsedMs / 1000;
}
