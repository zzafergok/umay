'use client';

import * as React from 'react';
import { Braces, FileText, ListChecks, Plus } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Checkbox } from '@/components/core/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/core/tabs';
import type { ReceiptAnalysisResult } from '@/lib/ai/receipt-analyzer';
import { formatReceiptMoney, ReceiptResultMeta } from './receipt-result-meta';
import { ReceiptResultRawTabs } from './receipt-result-raw-tabs';

interface ReceiptResultViewProps {
  analysis: ReceiptAnalysisResult;
  selectedIndices: Set<number>;
  onToggleItem: (index: number) => void;
  onToggleAll: () => void;
  onApplySelected?: () => void;
  applyLabel?: string;
  isApplying?: boolean;
  isEnriching?: boolean;
  canApply: boolean;
}

export function ReceiptResultView({
  analysis,
  selectedIndices,
  onToggleItem,
  onToggleAll,
  onApplySelected,
  applyLabel = 'Seçilenleri Listeye Ekle',
  isApplying = false,
  isEnriching = false,
  canApply,
}: ReceiptResultViewProps) {
  const allSelected =
    analysis.items.length > 0 && selectedIndices.size === analysis.items.length;
  const hasModelMeta = Boolean(analysis.reasoning || analysis.rawResponse);
  const actionLabel = isApplying
    ? 'Ekleniyor...'
    : isEnriching
      ? 'Adlar Düzenleniyor...'
      : applyLabel;

  return (
    <div className="space-y-4 border-t border-gunmetal/40 pt-4">
      <ReceiptResultMeta analysis={analysis} />

      <Tabs defaultValue={analysis.items.length > 0 ? 'items' : 'raw'}>
        <TabsList className="max-w-full justify-start overflow-x-auto scrollbar-hide">
          <TabsTrigger value="items">
            <ListChecks className="h-3.5 w-3.5" />
            Kalemler ({analysis.items.length})
          </TabsTrigger>
          <TabsTrigger value="raw">
            <FileText className="h-3.5 w-3.5" />
            Ham Metin (OCR)
          </TabsTrigger>
          {hasModelMeta && (
            <TabsTrigger value="response">
              <Braces className="h-3.5 w-3.5" />
              Model Yanıtı
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="items" className="space-y-3">
          {analysis.items.length === 0 ? (
            <p className="text-caption text-ash">
              Yapılandırılmış ürün kalemi bulunamadı. Ham Metin sekmesinden fiş
              çıktısını inceleyebilirsiniz.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {canApply && (
                        <TableHead className="w-10">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={onToggleAll}
                            aria-label="Tümünü seç"
                          />
                        </TableHead>
                      )}
                      <TableHead>Ürün</TableHead>
                      <TableHead>Miktar</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.items.map((item, idx) => (
                      <TableRow key={`${item.name}-${idx}`}>
                        {canApply && (
                          <TableCell className="w-10">
                            <Checkbox
                              checked={selectedIndices.has(idx)}
                              onCheckedChange={() => onToggleItem(idx)}
                              aria-label={`${item.normalizedName || item.name} seç`}
                            />
                          </TableCell>
                        )}
                        <TableCell className="min-w-0 whitespace-normal">
                          <div className="min-w-0 space-y-0.5">
                            <p className="break-words text-sm font-medium text-titanium">
                              {item.normalizedName || item.name}
                            </p>
                            {item.normalizedName &&
                              item.normalizedName !== item.name && (
                                <p className="break-words font-mono text-compact text-ash">
                                  Fiş: {item.name}
                                </p>
                              )}
                            {item.categoryHint && (
                              <Badge
                                variant="outline"
                                size="sm"
                                className="text-2xs"
                              >
                                {item.categoryHint}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-caption tabular-nums text-titanium">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right font-mono text-caption tabular-nums text-titanium">
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-medium">
                              {formatReceiptMoney(
                                item.totalPrice,
                                analysis.currency,
                              )}
                            </span>
                            {(item.unitPrice !== null ||
                              (item.totalPrice !== null &&
                                item.quantity > 0)) && (
                              <Badge
                                variant="outline"
                                size="sm"
                                className="shrink-0 whitespace-nowrap font-mono text-2xs tabular-nums text-ash"
                              >
                                {item.quantity} {item.unit} ×{''}
                                {formatReceiptMoney(
                                  item.unitPrice ??
                                    Number(
                                      (
                                        item.totalPrice! / item.quantity
                                      ).toFixed(2),
                                    ),
                                  analysis.currency,
                                )}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {canApply && onApplySelected && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-mono text-compact tabular-nums text-ash">
                    {selectedIndices.size} / {analysis.items.length} ürün seçili
                  </span>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={onApplySelected}
                    disabled={
                      isApplying || isEnriching || selectedIndices.size === 0
                    }
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    {actionLabel}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <ReceiptResultRawTabs analysis={analysis} hasModelMeta={hasModelMeta} />
      </Tabs>
    </div>
  );
}
