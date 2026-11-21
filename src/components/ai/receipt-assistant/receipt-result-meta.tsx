'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/core/alert';
import { Badge } from '@/components/core/badge';
import type { ReceiptAnalysisResult } from '@/lib/ai/receipt-analyzer';

interface ReceiptResultMetaProps {
  analysis: ReceiptAnalysisResult;
}

export function formatReceiptMoney(
  value: number | null,
  currency: string,
): string {
  if (value === null) return '—';
  return `${value.toFixed(2)} ${currency}`;
}

export function ReceiptResultMeta({ analysis }: ReceiptResultMetaProps) {
  const check = analysis.totalsCheck;
  const mismatch =
    check?.status === 'mismatch' &&
    check.printedSubtotal !== null &&
    check.difference !== null
      ? check
      : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {analysis.date && (
          <Badge variant="outline" className="font-mono tabular-nums">
            Tarih: {analysis.date}
            {analysis.time ? ` ${analysis.time}` : ''}
          </Badge>
        )}
        {analysis.grandTotal !== null && (
          <Badge variant="default" className="font-mono tabular-nums">
            Toplam: {formatReceiptMoney(analysis.grandTotal, analysis.currency)}
          </Badge>
        )}
        {analysis.taxTotal !== null && (
          <Badge variant="secondary" className="font-mono tabular-nums">
            Toplam KDV:{' '}
            {formatReceiptMoney(analysis.taxTotal, analysis.currency)}
          </Badge>
        )}
      </div>
      {mismatch && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Ürün toplamı fişteki ara toplamla uyuşmuyor (fiş:{' '}
            {formatReceiptMoney(mismatch.printedSubtotal, analysis.currency)},
            okunan: {formatReceiptMoney(mismatch.itemsSum, analysis.currency)},
            fark: {mismatch.difference! > 0 ? '+' : ''}
            {mismatch.difference!.toFixed(2)}).{' '}
            {mismatch.difference! < 0 ? 'Eksik' : 'Fazla'} kalem olabilir;
            lütfen kalemleri fişle karşılaştırın.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
