'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/core/toast';
import type { OpenRouterModelsQueryParams } from '@/lib/ai/openrouter';
import type {
  ReceiptAnalysisResult,
  ReceiptLineItem,
} from '@/lib/ai/receipt-analyzer';
import { compressImageFile } from '@/lib/utils/image-compress';
import { aiReceiptService } from '@/services/ai-receipt-service';
import {
  isMissingApiKeyError,
  readFileAsDataUrl,
  receiptAssistantFormSchema,
  type ReceiptAssistantFormValues,
} from './receipt-assistant-utils';
import { useReceiptModels } from './use-receipt-models';

export function useReceiptAssistant(options: {
  modelQuery?: OpenRouterModelsQueryParams;
  defaultFreeOnly?: boolean;
  onAnalyzed?: (analysis: ReceiptAnalysisResult) => void;
  onApplyItems?: (
    items: ReceiptLineItem[],
    analysis: ReceiptAnalysisResult,
  ) => void | Promise<void>;
}) {
  const modelState = useReceiptModels({
    modelQuery: options.modelQuery,
    defaultFreeOnly: options.defaultFreeOnly,
  });

  const formMethods = useForm<ReceiptAssistantFormValues>({
    resolver: zodResolver(receiptAssistantFormSchema),
    defaultValues: { promptHint: '' },
    mode: 'onChange',
  });

  const [imageDataUrl, setImageDataUrl] = React.useState<string>('');
  const [fileName, setFileName] = React.useState<string>('');
  const [analysis, setAnalysis] = React.useState<ReceiptAnalysisResult | null>(
    null,
  );
  const [selectedIndices, setSelectedIndices] = React.useState<Set<number>>(
    new Set(),
  );
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isApplying, setIsApplying] = React.useState(false);
  const [isConfigured, setIsConfigured] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setAnalysis(null);

    try {
      const compressed = await compressImageFile(file, 1600, 0.85);
      const dataUrl = await readFileAsDataUrl(compressed);
      setImageDataUrl(dataUrl);
      setFileName(file.name);
    } catch {
      setErrorMessage('Fiş görseli hazırlanırken bir hata oluştu.');
    }
  };

  const handleAnalyze = async (values?: ReceiptAssistantFormValues) => {
    if (!imageDataUrl) {
      setErrorMessage('Lütfen önce bir fiş görseli seçin.');
      return;
    }

    const promptHint = (
      values?.promptHint ??
      formMethods.getValues('promptHint') ??
      ''
    ).trim();

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await aiReceiptService.analyzeReceipt({
        imageDataUrl,
        modelId: modelState.selectedModelId || undefined,
        promptHint: promptHint || undefined,
      });

      setIsConfigured(true);
      setAnalysis(result.analysis);
      setSelectedIndices(
        new Set(result.analysis.items.map((_, index) => index)),
      );
      options.onAnalyzed?.(result.analysis);
      toast.success('Fiş analizi tamamlandı.');
    } catch (error) {
      if (isMissingApiKeyError(error)) {
        setIsConfigured(false);
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Fiş analizi sırasında bir hata oluştu.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleItem = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleAllItems = () => {
    if (!analysis) return;
    setSelectedIndices((prev) =>
      prev.size === analysis.items.length
        ? new Set()
        : new Set(analysis.items.map((_, idx) => idx)),
    );
  };

  const handleApplySelected = async () => {
    if (!analysis || !options.onApplyItems) return;
    const chosen = analysis.items.filter((_, idx) => selectedIndices.has(idx));
    if (chosen.length === 0) {
      toast.error('Aktarmak için en az bir ürün seçin.');
      return;
    }

    setIsApplying(true);
    try {
      await options.onApplyItems(chosen, analysis);
    } finally {
      setIsApplying(false);
    }
  };

  const reset = () => {
    setImageDataUrl('');
    setFileName('');
    formMethods.reset({ promptHint: '' });
    setAnalysis(null);
    setSelectedIndices(new Set());
    setErrorMessage(null);
  };

  return {
    formMethods,
    ...modelState,
    isConfigured,
    imageDataUrl,
    fileName,
    analysis,
    selectedIndices,
    isAnalyzing,
    isApplying,
    errorMessage,
    handleFileChange,
    handleAnalyze,
    toggleItem,
    toggleAllItems,
    handleApplySelected,
    reset,
  };
}
