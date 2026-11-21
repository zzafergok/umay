'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/core/toast';
import type {
  OpenRouterModel,
  OpenRouterModelsQueryParams,
} from '@/lib/ai/openrouter';
import {
  countReceiptModelsByPricing,
  filterAndSortReceiptModels,
  pickDefaultReceiptModelId,
  type ReceiptModelPricingFilter,
} from '@/lib/ai/receipt-analyzer';
import { aiReceiptService } from '@/services/ai-receipt-service';
import { getOpenRouterModelsQueryKey } from './receipt-assistant-utils';

export function useReceiptModels(options: {
  modelQuery?: OpenRouterModelsQueryParams;
  defaultFreeOnly?: boolean;
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

  const [pricingFilter, setPricingFilter] =
    React.useState<ReceiptModelPricingFilter>(
      options.defaultFreeOnly ? 'free' : 'all',
    );

  const modelCounts = React.useMemo(
    () => countReceiptModelsByPricing(rawModels),
    [rawModels],
  );

  const models = React.useMemo(
    () => filterAndSortReceiptModels(rawModels, { pricingFilter }),
    [rawModels, pricingFilter],
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
    modelCounts,
    totalCatalogCount: modelsQuery.data?.total_count ?? rawModels.length,
    pricingFilter,
    setPricingFilter,
    freeOnly: pricingFilter === 'free',
    defaultModelId,
    isLoadingModels: modelsQuery.isLoading,
    modelsLoadError: modelsQuery.isError,
    isRefreshingModels,
    refreshModels,
    selectedModelId: effectiveModelId,
    selectedModel,
    setSelectedModelId,
  };
}
