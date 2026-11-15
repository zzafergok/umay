'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/core/toast';
import { compressImageFile } from '@/lib/utils/image-compress';
import { aiReceiptService } from '@/services/ai-receipt-service';
import type {
  OpenRouterModel,
  OpenRouterModelsQueryParams,
} from '@/lib/ai/openrouter';
import {
  filterAndSortReceiptModels,
  pickDefaultReceiptModelId,
  type ReceiptAnalysisResult,
  type ReceiptLineItem,
} from '@/lib/ai/receipt-analyzer';
import {
  getOpenRouterModelsQueryKey,
  isMissingApiKeyError,
  readFileAsDataUrl,
} from './receipt-assistant-utils';

export function useReceiptAssistant(options: {
  modelQuery?: OpenRouterModelsQueryParams;
  defaultFreeOnly?: boolean;
  onAnalyzed?: (analysis: ReceiptAnalysisResult) => void;
  onApplyItems?: (
    items: ReceiptLineItem[],
    analysis: ReceiptAnalysisResult,
  ) => void | Promise<void>;
}) {
  const queryClient = useQueryClient();
  const modelsQueryKey = React.useMemo(
    () => getOpenRouterModelsQueryKey(options.modelQuery),
    [options.modelQuery],
  );
  const modelsQuery = useQuery({
    queryKey: modelsQueryKey,
    queryFn: () => aiReceiptService.listModels(false, options.modelQuery),
    staleTime: 1000 * 60 * 10,
  });

  const rawModels: OpenRouterModel[] = React.useMemo(
    () => (Array.isArray(modelsQuery.data?.data) ? modelsQuery.data.data : []),
    [modelsQuery.data],
  );

  const [freeOnly, setFreeOnly] = React.useState(
    options.defaultFreeOnly ?? false,
  );
  const models = React.useMemo(
    () => filterAndSortReceiptModels(rawModels, { freeOnly }),
    [rawModels, freeOnly],
  );

  const defaultModelId = React.useMemo(
    () => pickDefaultReceiptModelId(rawModels),
    [rawModels],
  );

  const [selectedModelId, setSelectedModelId] = React.useState<string>('');
  const effectiveModelId = React.useMemo(() => {
    if (selectedModelId && models.some((m) => m.id === selectedModelId)) {
      return selectedModelId;
    }
    if (defaultModelId && models.some((m) => m.id === defaultModelId)) {
      return defaultModelId;
    }
    return models[0]?.id ?? '';
  }, [selectedModelId, models, defaultModelId]);

  const selectedModel = React.useMemo(
    () => models.find((m) => m.id === effectiveModelId) ?? null,
    [models, effectiveModelId],
  );

  const [imageDataUrl, setImageDataUrl] = React.useState<string>('');
  const [fileName, setFileName] = React.useState<string>('');
  const [promptHint, setPromptHint] = React.useState<string>('');
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

  const handleAnalyze = async () => {
    if (!imageDataUrl) {
      setErrorMessage('Lütfen önce bir fiş görseli seçin.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await aiReceiptService.analyzeReceipt({
        imageDataUrl,
        modelId: effectiveModelId || undefined,
        promptHint: promptHint.trim() || undefined,
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
    setPromptHint('');
    setAnalysis(null);
    setSelectedIndices(new Set());
    setErrorMessage(null);
  };

  const [isRefreshingModels, setIsRefreshingModels] = React.useState(false);

  const refreshModels = async () => {
    setIsRefreshingModels(true);
    try {
      const fresh = await aiReceiptService.listModels(true, options.modelQuery);
      queryClient.setQueryData(modelsQueryKey, fresh);
      toast.success('OpenRouter model listesi güncellendi.');
    } catch {
      toast.error('Model listesi yenilenemedi.');
    } finally {
      setIsRefreshingModels(false);
    }
  };

  return {
    models,
    totalCatalogCount: modelsQuery.data?.total_count ?? rawModels.length,
    freeOnly,
    setFreeOnly,
    defaultModelId,
    isConfigured,
    isLoadingModels: modelsQuery.isLoading,
    modelsLoadError: modelsQuery.isError,
    isRefreshingModels,
    refreshModels,
    selectedModelId: effectiveModelId,
    selectedModel,
    setSelectedModelId,
    imageDataUrl,
    fileName,
    promptHint,
    setPromptHint,
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
