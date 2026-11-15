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
import { Form, SubmitButton, TextField } from '@/components/forms';
import { receiptAssistantFormSchema } from './receipt-assistant-utils';
import { ReceiptImageField } from './receipt-image-field';
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
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const state = useReceiptAssistant({
    modelQuery,
    defaultFreeOnly,
    onAnalyzed,
    onApplyItems,
  });

  const handleReset = () => {
    state.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <ReceiptText className="text-umay-blue h-4 w-4 shrink-0" />
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
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0"
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

          <Form
            schema={receiptAssistantFormSchema}
            methods={state.formMethods}
            onSubmit={state.handleAnalyze}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              <ReceiptImageField
                fileInputRef={fileInputRef}
                fileName={state.fileName}
                onFileChange={state.handleFileChange}
              />

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

            <TextField
              name="promptHint"
              label="Ek Not (İsteğe Bağlı)"
              placeholder="Örn. Sadece temizlik ve gıda ürünlerini listele"
              maxLength={300}
              className="space-y-1.5"
              labelClassName="font-sans text-body-sm font-medium normal-case tracking-normal text-text"
              inputClassName="text-body"
            />

            {state.imageDataUrl && (
              <div className="bg-surface-sunken/50 flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={state.imageDataUrl}
                    alt="Yüklenen fiş önizlemesi"
                    className="h-16 w-16 shrink-0 rounded-sm border border-border object-cover sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-body-sm text-text truncate font-medium">
                      {state.fileName}
                    </p>
                    <p className="text-text-muted text-caption">
                      Görsel analize hazır
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                  <SubmitButton
                    isLoading={state.isAnalyzing}
                    loadingText="Analiz Ediliyor..."
                    icon={<Sparkles className="h-4 w-4" />}
                  >
                    Fişi Analiz Et
                  </SubmitButton>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handleReset}
                    disabled={state.isAnalyzing}
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4" />
                    Temizle
                  </Button>
                </div>
              </div>
            )}
          </Form>

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
