'use client';

import * as React from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ReceiptText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/core/alert';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import { Spinner } from '@/components/core/spinner';
import { ReceiptModelSelector } from './receipt-model-selector';
import { ReceiptResultView } from './receipt-result-view';
import type { ReceiptAssistantProps } from './types';
import { useReceiptAssistant } from './use-receipt-assistant';

export function ReceiptAssistant({
  onApplyItems,
  onAnalyzed,
  applyLabel,
  title = 'AI Fiş Analiz Asistanı',
  description = 'Alışveriş fişi fotoğrafını yükleyin; OpenRouter vision modelleri ile metne çevirip kalemleri otomatik çıkarın.',
  defaultExpanded = false,
  modelQuery,
  defaultFreeOnly = false,
}: ReceiptAssistantProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const state = useReceiptAssistant({
    modelQuery,
    defaultFreeOnly,
    onAnalyzed,
    onApplyItems,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <ReceiptText className="text-umay-blue h-4 w-4" />
            <CardTitle className="font-display text-base">{title}</CardTitle>
            <Badge variant="secondary" size="sm" className="font-mono">
              {state.freeOnly ? 'Ücretsiz Modeller' : 'Tüm Vision Modeller'} (
              {state.models.length})
            </Badge>
          </div>
          <CardDescription className="text-caption">
            {description}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              Gizle <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              Fiş Tara <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {!state.isConfigured && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>OpenRouter API Anahtarı Eksik</AlertTitle>
              <AlertDescription>
                Fiş analizi için <code className="font-mono">.env</code>{' '}
                dosyasına <code className="font-mono">OPENROUTER_API_KEY</code>{' '}
                tanımlayın.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="receipt-image-input">Fiş Görseli</Label>
              <Input
                id="receipt-image-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={state.handleFileChange}
              />
              {state.fileName && (
                <p className="truncate font-mono text-compact text-ash">
                  Seçilen dosya: {state.fileName}
                </p>
              )}
            </div>

            <ReceiptModelSelector
              models={state.models}
              totalCatalogCount={state.totalCatalogCount}
              freeOnly={state.freeOnly}
              onFreeOnlyChange={state.setFreeOnly}
              defaultModelId={state.defaultModelId}
              selectedModelId={state.selectedModelId}
              selectedModel={state.selectedModel}
              isLoadingModels={state.isLoadingModels}
              modelsLoadError={state.modelsLoadError}
              isRefreshingModels={state.isRefreshingModels}
              onSelectModel={state.setSelectedModelId}
              onRefreshModels={state.refreshModels}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="receipt-prompt-hint">Ek Not (İsteğe Bağlı)</Label>
            <Input
              id="receipt-prompt-hint"
              value={state.promptHint}
              onChange={(e) => state.setPromptHint(e.target.value)}
              placeholder="Örn. Sadece temizlik ve gıda ürünlerini listele"
            />
          </div>

          {state.imageDataUrl && (
            <div className="flex flex-wrap items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.imageDataUrl}
                alt="Yüklenen fiş önizlemesi"
                className="h-24 w-24 rounded-sm border border-gunmetal/40 object-cover"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={state.handleAnalyze}
                  disabled={state.isAnalyzing}
                >
                  {state.isAnalyzing ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Analiz Ediliyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Fişi Analiz Et
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={state.reset}
                  disabled={state.isAnalyzing}
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  Temizle
                </Button>
              </div>
            </div>
          )}

          {state.errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Analiz Hatası</AlertTitle>
              <AlertDescription>{state.errorMessage}</AlertDescription>
            </Alert>
          )}

          {state.analysis && (
            <ReceiptResultView
              analysis={state.analysis}
              selectedIndices={state.selectedIndices}
              onToggleItem={state.toggleItem}
              onToggleAll={state.toggleAllItems}
              onApplySelected={state.handleApplySelected}
              applyLabel={applyLabel}
              isApplying={state.isApplying}
              canApply={Boolean(onApplyItems)}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
