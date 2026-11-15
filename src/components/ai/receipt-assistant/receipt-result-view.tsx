'use client';

import * as React from 'react';
import { Braces, Check, Copy, FileText, ListChecks, Plus } from 'lucide-react';
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
import { toast } from '@/components/core/toast';
import type { ReceiptAnalysisResult } from '@/lib/ai/receipt-analyzer';
import { formatReceiptMoney, ReceiptResultMeta } from './receipt-result-meta';

interface ReceiptResultViewProps {
  analysis: ReceiptAnalysisResult;
  selectedIndices: Set<number>;
  onToggleItem: (index: number) => void;
  onToggleAll: () => void;
  onApplySelected?: () => void;
  applyLabel?: string;
  isApplying?: boolean;
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
  canApply,
}: ReceiptResultViewProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyRawText = async () => {
    if (!analysis.rawText) return;
    try {
      await navigator.clipboard.writeText(analysis.rawText);
      setCopied(true);
      toast.success('Fiş metni panoya kopyalandı.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Panoya kopyalanamadı.');
    }
  };

  const allSelected =
    analysis.items.length > 0 && selectedIndices.size === analysis.items.length;
  const hasModelMeta = Boolean(analysis.reasoning || analysis.rawResponse);

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
                        <TableCell>
                          <Checkbox
                            checked={selectedIndices.has(idx)}
                            onCheckedChange={() => onToggleItem(idx)}
                            aria-label={`${item.normalizedName || item.name} seç`}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-titanium">
                            {item.normalizedName || item.name}
                          </p>
                          {item.normalizedName &&
                            item.normalizedName !== item.name && (
                              <p className="font-mono text-compact text-ash">
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
                        {formatReceiptMoney(item.totalPrice, analysis.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {canApply && onApplySelected && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-mono text-compact tabular-nums text-ash">
                    {selectedIndices.size} / {analysis.items.length} ürün seçili
                  </span>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={onApplySelected}
                    disabled={isApplying || selectedIndices.size === 0}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    {isApplying ? 'Ekleniyor...' : applyLabel}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="raw" className="space-y-2">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyRawText}
              disabled={!analysis.rawText}
            >
              {copied ? (
                <Check className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <Copy className="mr-1.5 h-3.5 w-3.5" />
              )}
              {copied ? 'Kopyalandı' : 'Metni Kopyala'}
            </Button>
          </div>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-sm border border-gunmetal/40 bg-void-black/60 p-3 font-mono text-compact leading-relaxed text-titanium">
            {analysis.rawText || 'Metin çıktısı boş.'}
          </pre>
        </TabsContent>

        {hasModelMeta && (
          <TabsContent value="response" className="space-y-3">
            {analysis.reasoning && (
              <div className="space-y-1">
                <p className="font-mono text-2xs uppercase text-ash">
                  Muhakeme (Reasoning)
                </p>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-sm border border-gunmetal/40 bg-void-black/60 p-3 font-mono text-compact leading-relaxed text-titanium">
                  {analysis.reasoning}
                </pre>
              </div>
            )}
            {analysis.rawResponse && (
              <div className="space-y-1">
                <p className="font-mono text-2xs uppercase text-ash">
                  OpenRouter Ham Yanıt
                </p>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-sm border border-gunmetal/40 bg-void-black/60 p-3 font-mono text-compact leading-relaxed text-titanium">
                  {JSON.stringify(analysis.rawResponse, null, 2)}
                </pre>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
