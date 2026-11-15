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
import { Switch } from '@/components/core/switch';
import type { OpenRouterModel } from '@/lib/ai/openrouter';
import {
  formatModelContextLength,
  formatModelPricingLabel,
  supportsJsonObject,
  supportsReasoningOutput,
  supportsStructuredOutputs,
} from '@/lib/ai/receipt-analyzer';

interface ReceiptModelSelectorProps {
  models: OpenRouterModel[];
  totalCatalogCount: number;
  freeOnly: boolean;
  onFreeOnlyChange: (freeOnly: boolean) => void;
  defaultModelId: string;
  selectedModelId: string;
  selectedModel: OpenRouterModel | null;
  isLoadingModels: boolean;
  modelsLoadError: boolean;
  isRefreshingModels: boolean;
  onSelectModel: (modelId: string) => void;
  onRefreshModels: () => void;
}

export function ReceiptModelSelector({
  models,
  totalCatalogCount,
  freeOnly,
  onFreeOnlyChange,
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
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor="receipt-model-select" className="block">
        OpenRouter Vision Modeli
      </Label>

      <div className="flex items-center gap-2">
        <Select
          value={selectedModelId}
          onValueChange={onSelectModel}
          disabled={isLoadingModels}
        >
          <SelectTrigger id="receipt-model-select" className="min-w-0 flex-1">
            <SelectValue placeholder="Model seçin" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
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

      <div className="space-y-1.5 pt-0.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Switch
              id="receipt-free-only-switch"
              size="sm"
              checked={freeOnly}
              onCheckedChange={onFreeOnlyChange}
            />
            <Label
              htmlFor="receipt-free-only-switch"
              className="cursor-pointer font-mono text-2xs text-ash"
            >
              Sadece Ücretsiz
            </Label>
          </div>
          <StatusPill
            tone={modelsLoadError ? 'overdue' : 'ok'}
            label={
              modelsLoadError
                ? 'Hata'
                : freeOnly
                  ? `${models.length} ücretsiz`
                  : `${models.length}/${totalCatalogCount || models.length}`
            }
            className="text-2xs"
          />
        </div>

        {selectedModel && (
          <div className="space-y-1">
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
    </div>
  );
}
