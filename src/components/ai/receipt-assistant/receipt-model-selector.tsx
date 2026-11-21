'use client';

import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Label } from '@/components/core/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/core/select';
import { StatusPill } from '@/components/core/status-pill';
import type { OpenRouterModel } from '@/lib/ai/openrouter';
import {
  formatModelContextLength,
  formatModelPricingLabel,
  isFreeOpenRouterModel,
  supportsJsonObject,
  supportsReasoningOutput,
  supportsStructuredOutputs,
  type ReceiptModelPricingFilter,
} from '@/lib/ai/receipt-analyzer';
import { cn } from '@/lib/utils';

interface ReceiptModelSelectorProps {
  models: OpenRouterModel[];
  modelCounts: { all: number; free: number; paid: number };
  pricingFilter: ReceiptModelPricingFilter;
  onPricingFilterChange: (filter: ReceiptModelPricingFilter) => void;
  defaultModelId: string;
  selectedModelId: string;
  selectedModel: OpenRouterModel | null;
  isLoadingModels: boolean;
  modelsLoadError: boolean;
  isRefreshingModels: boolean;
  onSelectModel: (modelId: string) => void;
  onRefreshModels: () => void;
}

const PRICING_TABS: Array<{
  id: ReceiptModelPricingFilter;
  label: string;
}> = [
  { id: 'all', label: 'Tümü' },
  { id: 'free', label: 'Ücretsiz' },
  { id: 'paid', label: 'Ücretli' },
];

export function ReceiptModelSelector({
  models,
  modelCounts,
  pricingFilter,
  onPricingFilterChange,
  defaultModelId,
  selectedModelId,
  selectedModel,
  isLoadingModels,
  modelsLoadError,
  isRefreshingModels,
  onSelectModel,
  onRefreshModels,
}: ReceiptModelSelectorProps) {
  const contextLabel = selectedModel
    ? formatModelContextLength(selectedModel.context_length)
    : null;
  const pricingLabel = selectedModel
    ? formatModelPricingLabel(selectedModel.pricing)
    : null;

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor="receipt-model-select" className="block">
          OpenRouter Vision Modeli (Metin Çıkarımı Uyumlu)
        </Label>
        <StatusPill
          tone={modelsLoadError ? 'overdue' : 'ok'}
          label={
            modelsLoadError
              ? 'Hata'
              : pricingFilter === 'free'
                ? `${models.length} ücretsiz`
                : pricingFilter === 'paid'
                  ? `${models.length} ücretli`
                  : `${models.length} uyumlu model`
          }
          className="text-2xs"
        />
      </div>

      <div
        role="group"
        aria-label="Vision model fiyat filtresi"
        className="border-border/80 bg-surface-sunken/80 inline-flex w-full items-center gap-1 rounded-lg border p-1"
      >
        {PRICING_TABS.map((tab) => {
          const isActive = pricingFilter === tab.id;
          const count = modelCounts[tab.id];
          return (
            <Button
              key={tab.id}
              type="button"
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onPricingFilterChange(tab.id)}
              aria-pressed={isActive}
              className={cn(
                'h-7 flex-1 justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-all md:h-7',
                isActive
                  ? 'border-border/70 bg-surface text-text shadow-xs border'
                  : 'text-text-muted hover:text-text',
              )}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-2xs opacity-75">({count})</span>
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={selectedModelId}
          onValueChange={onSelectModel}
          disabled={isLoadingModels || models.length === 0}
        >
          <SelectTrigger id="receipt-model-select" className="min-w-0 flex-1">
            <SelectValue
              placeholder={
                models.length === 0
                  ? 'Bu filtrede uyumlu model yok'
                  : 'Model seçin'
              }
            />
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]">
            {models.map((model) => {
              const isFree = isFreeOpenRouterModel(model);
              const itemPricingLabel = formatModelPricingLabel(model.pricing);
              return (
                <SelectItem
                  key={model.id}
                  value={model.id}
                  className="gap-2"
                  endAdornment={
                    <Badge
                      variant={isFree ? 'secondary' : 'outline'}
                      size="sm"
                      className={cn(
                        'shrink-0 whitespace-nowrap font-mono text-2xs',
                        isFree &&
                          'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                      )}
                    >
                      {itemPricingLabel}
                    </Badge>
                  }
                >
                  {model.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="bg-surface-sunken shrink-0"
          onClick={onRefreshModels}
          disabled={isRefreshingModels}
          aria-label="Model listesini yenile"
          title="Model listesini yenile"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshingModels ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>

      {selectedModel && (
        <div className="space-y-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedModel.id === defaultModelId && (
              <Badge variant="secondary" size="sm" className="text-2xs">
                Varsayılan
              </Badge>
            )}
            {pricingLabel && (
              <Badge
                variant="outline"
                size="sm"
                className="font-mono text-2xs"
              >
                {pricingLabel}
              </Badge>
            )}
            {contextLabel && (
              <Badge
                variant="outline"
                size="sm"
                className="font-mono text-2xs"
              >
                {contextLabel}
              </Badge>
            )}
            {supportsStructuredOutputs(selectedModel) && (
              <Badge
                variant="outline"
                size="sm"
                className="font-mono text-2xs"
              >
                Structured
              </Badge>
            )}
            {supportsJsonObject(selectedModel) && (
              <Badge
                variant="outline"
                size="sm"
                className="font-mono text-2xs"
              >
                JSON
              </Badge>
            )}
            {supportsReasoningOutput(selectedModel) && (
              <Badge
                variant="outline"
                size="sm"
                className="font-mono text-2xs"
              >
                Reasoning
              </Badge>
            )}
          </div>
          {selectedModel.description && (
            <p className="line-clamp-2 text-2xs text-ash">
              {selectedModel.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
