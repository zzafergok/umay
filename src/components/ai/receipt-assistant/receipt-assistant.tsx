'use client';

import * as React from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ReceiptText,
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
import { cn } from '@/lib/utils';
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
  description = 'Uzun fişleri tek veya birden fazla parça fotoğraf olarak yükleyin; kesişen mükerrer satırlar otomatik elenir.',
  defaultExpanded = false,
  embedded = false,
  modelQuery,
  defaultFreeOnly = false,
}: ReceiptAssistantProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded || embedded);
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

  const isExpanded = embedded || expanded;
  const imageCount = state.images.length;
  const filterBadgeLabel =
    state.pricingFilter === 'free'
      ? 'Ücretsiz OCR Modeller'
      : state.pricingFilter === 'paid'
        ? 'Ücretli OCR Modeller'
        : 'Uyumlu OCR Modeller';

  const bodyNode = (
    <div className={cn('min-w-0 space-y-3.5', !embedded && 'space-y-4')}>
      {embedded ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-text-muted text-xs">{description}</p>
          <Badge variant="secondary" size="sm" className="shrink-0 font-mono">
            {filterBadgeLabel} ({state.models.length})
          </Badge>
        </div>
      ) : null}

      {!state.isConfigured && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>OpenRouter API Anahtarı Eksik</AlertTitle>
          <AlertDescription>
            Fiş analizi için <code className="font-mono">.env</code> dosyasına{' '}
            <code className="font-mono">OPENROUTER_API_KEY</code> tanımlayın.
          </AlertDescription>
        </Alert>
      )}

      <Form
        schema={receiptAssistantFormSchema}
        methods={state.formMethods}
        onSubmit={state.handleAnalyze}
        className="space-y-3.5"
      >
        <div
          className={cn(
            'grid grid-cols-1 items-start gap-3.5',
            !embedded && 'md:grid-cols-2 md:gap-4',
          )}
        >
          <ReceiptImageField
            fileInputRef={fileInputRef}
            images={state.images}
            isAnalyzing={state.isAnalyzing}
            onFileChange={state.handleFileChange}
            onRemoveImage={state.removeImage}
            onClearAll={handleReset}
          />

          <ReceiptModelSelector
            models={state.models}
            modelCounts={state.modelCounts}
            pricingFilter={state.pricingFilter}
            onPricingFilterChange={state.setPricingFilter}
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
        />

        {imageCount > 0 && (
          <div className="flex flex-col gap-2 border-t border-border/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-text-muted text-caption">
              {imageCount > 1
                ? `${imageCount} fiş parçası birleştirilip mükerrer satırlar elenecek`
                : 'Fiş görseli analize hazır'}
            </p>
            <SubmitButton
              size="sm"
              isLoading={state.isAnalyzing}
              loadingText="Analiz Ediliyor..."
              icon={<Sparkles className="h-3.5 w-3.5" />}
              className="w-full sm:w-auto"
            >
              {imageCount > 1
                ? `Birleştir & Analiz Et (${imageCount})`
                : 'Fişi Analiz Et'}
            </SubmitButton>
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
    </div>
  );

  if (embedded) {
    return bodyNode;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <ReceiptText className="text-umay-blue h-4 w-4 shrink-0" />
            <CardTitle className="font-display text-base">{title}</CardTitle>
            <Badge variant="secondary" size="sm" className="font-mono">
              {filterBadgeLabel} ({state.models.length})
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

      {isExpanded && <CardContent>{bodyNode}</CardContent>}
    </Card>
  );
}
