'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/core/toast';
import type { OpenRouterModelsQueryParams } from '@/lib/ai/openrouter';
import {
  MAX_RECEIPT_IMAGES,
  type ReceiptAnalysisResult,
  type ReceiptLineItem,
} from '@/lib/ai/receipt-analyzer';
import { compressImageFile } from '@/lib/utils/image-compress';
import { aiReceiptService } from '@/services/ai-receipt-service';
import {
  isMissingApiKeyError,
  readFileAsDataUrl,
  receiptAssistantFormSchema,
  type ReceiptAssistantFormValues,
} from './receipt-assistant-utils';
import type { ReceiptImageEntry } from './types';
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

  const [images, setImages] = React.useState<ReceiptImageEntry[]>([]);
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
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    event.target.value = '';

    setErrorMessage(null);
    setAnalysis(null);

    const remainingSlots = MAX_RECEIPT_IMAGES - images.length;
    if (remainingSlots <= 0) {
      toast.error(
        `Tek seferde en fazla ${MAX_RECEIPT_IMAGES} fiş fotoğrafı yükleyebilirsiniz.`,
      );
      return;
    }

    const toProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.info(
        `En fazla ${MAX_RECEIPT_IMAGES} görsel desteklendiği için ilk ${remainingSlots} fotoğraf eklendi.`,
      );
    }

    try {
      const processed = await Promise.all(
        toProcess.map(async (file, idx) => {
          const compressed = await compressImageFile(file, 1600, 0.85);
          const dataUrl = await readFileAsDataUrl(compressed);
          return {
            id: `${Date.now()}-${idx}-${file.name}`,
            name: file.name,
            dataUrl,
          };
        }),
      );

      setImages((prev) => {
        const existingDataUrls = new Set(prev.map((img) => img.dataUrl));
        const uniqueNew = processed.filter(
          (item) => !existingDataUrls.has(item.dataUrl),
        );
        return [...prev, ...uniqueNew].slice(0, MAX_RECEIPT_IMAGES);
      });
    } catch {
      setErrorMessage('Fiş görselleri hazırlanırken bir hata oluştu.');
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setAnalysis(null);
  };

  const handleAnalyze = async (values?: ReceiptAssistantFormValues) => {
    if (images.length === 0) {
      setErrorMessage('Lütfen önce en az bir fiş görseli seçin.');
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
      const imageDataUrls = images.map((img) => img.dataUrl);
      const result = await aiReceiptService.analyzeReceipt({
        imageDataUrl: imageDataUrls[0],
        imageDataUrls,
        modelId: modelState.selectedModelId || undefined,
        promptHint: promptHint || undefined,
      });

      setIsConfigured(true);
      setAnalysis(result.analysis);
      setSelectedIndices(
        new Set(result.analysis.items.map((_, index) => index)),
      );
      options.onAnalyzed?.(result.analysis);
      toast.success(
        images.length > 1
          ? `${images.length} fiş parçası birleştirilerek analiz edildi.`
          : 'Fiş analizi tamamlandı.',
      );
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
    setImages([]);
    formMethods.reset({ promptHint: '' });
    setAnalysis(null);
    setSelectedIndices(new Set());
    setErrorMessage(null);
  };

  return {
    formMethods,
    ...modelState,
    isConfigured,
    images,
    analysis,
    selectedIndices,
    isAnalyzing,
    isApplying,
    errorMessage,
    handleFileChange,
    removeImage,
    handleAnalyze,
    toggleItem,
    toggleAllItems,
    handleApplySelected,
    reset,
  };
}
