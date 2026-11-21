'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/core/button';
import { TabsContent } from '@/components/core/tabs';
import { toast } from '@/components/core/toast';
import type { ReceiptAnalysisResult } from '@/lib/ai/receipt-analyzer';

interface ReceiptResultRawTabsProps {
  analysis: ReceiptAnalysisResult;
  hasModelMeta: boolean;
}

export function ReceiptResultRawTabs({
  analysis,
  hasModelMeta,
}: ReceiptResultRawTabsProps) {
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

  return (
    <>
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
    </>
  );
}
