'use client';

import { Badge } from '@/components/core/badge';
import { StatusPill } from '@/components/core/status-pill';
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

function getConfidenceTone(
  confidence: ReceiptAnalysisResult['confidence'],
): 'ok' | 'due_soon' | 'overdue' {
  if (confidence === 'high') return 'ok';
  if (confidence === 'low') return 'overdue';
  return 'due_soon';
}

function getConfidenceLabel(
  confidence: ReceiptAnalysisResult['confidence'],
): string {
  if (confidence === 'high') return 'Yüksek Güven';
  if (confidence === 'low') return 'Düşük Güven';
  return 'Orta Güven';
}

export function ReceiptResultMeta({ analysis }: ReceiptResultMetaProps) {
  const hasFinancialBreakdown =
    analysis.subtotal !== null ||
    analysis.taxTotal !== null ||
    analysis.discountTotal !== null ||
    Boolean(analysis.paymentMethod);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {analysis.merchantName && (
          <Badge variant="secondary" className="font-display">
            {analysis.merchantName}
          </Badge>
        )}
        {analysis.merchantTaxId && (
          <Badge variant="outline" size="sm" className="font-mono text-2xs">
            VKN: {analysis.merchantTaxId}
          </Badge>
        )}
        {analysis.date && (
          <Badge variant="outline" className="font-mono tabular-nums">
            {analysis.date}
            {analysis.time ? ` ${analysis.time}` : ''}
          </Badge>
        )}
        {analysis.grandTotal !== null && (
          <Badge variant="default" className="font-mono tabular-nums">
            Toplam: {formatReceiptMoney(analysis.grandTotal, analysis.currency)}
          </Badge>
        )}
        <StatusPill
          tone={getConfidenceTone(analysis.confidence)}
          label={getConfidenceLabel(analysis.confidence)}
          className="text-2xs"
        />
        <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
          {analysis.provider && (
            <Badge variant="outline" size="sm" className="font-mono text-2xs">
              {analysis.provider}
            </Badge>
          )}
          <Badge
            variant="outline"
            size="sm"
            className="max-w-full truncate font-mono text-compact text-ash"
          >
            {analysis.modelUsed}
          </Badge>
          {typeof analysis.usage?.total_tokens === 'number' && (
            <Badge
              variant="outline"
              size="sm"
              className="font-mono text-2xs tabular-nums text-ash"
            >
              {analysis.usage.total_tokens} token
            </Badge>
          )}
        </div>
      </div>

      {hasFinancialBreakdown && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-compact tabular-nums text-ash">
          {analysis.subtotal !== null && (
            <span>
              Ara Toplam:{' '}
              {formatReceiptMoney(analysis.subtotal, analysis.currency)}
            </span>
          )}
          {analysis.taxTotal !== null && (
            <span>
              KDV: {formatReceiptMoney(analysis.taxTotal, analysis.currency)}
            </span>
          )}
          {analysis.discountTotal !== null && (
            <span>
              İndirim:{' '}
              {formatReceiptMoney(analysis.discountTotal, analysis.currency)}
            </span>
          )}
          {analysis.paymentMethod && (
            <span>Ödeme: {analysis.paymentMethod}</span>
          )}
        </div>
      )}

      {analysis.notes && (
        <p className="text-caption text-ash">{analysis.notes}</p>
      )}
    </div>
  );
}
