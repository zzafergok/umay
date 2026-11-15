'use client';

import { Check, Plus, Receipt, Sparkles } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import type {
  HeroItemPreviewRow,
  HeroPreviewData,
  HeroShoppingRow,
} from '../../types';

interface HeroPreviewShoppingTabProps {
  shoppingView: HeroPreviewData['shoppingView'];
  lowStockItems: HeroItemPreviewRow[];
  shoppingRows: HeroShoppingRow[];
  receiptAdded: boolean;
  onAddReceiptToList: () => void;
  onAddSuggestion: (id: string, title: string, sourceLabel: string) => void;
  onToggleRow: (id: string) => void;
}

export function HeroPreviewShoppingTab({
  shoppingView,
  lowStockItems,
  shoppingRows,
  receiptAdded,
  onAddReceiptToList,
  onAddSuggestion,
  onToggleRow,
}: HeroPreviewShoppingTabProps) {
  const existingTitles = new Set(
    shoppingRows.map((row) => row.title.toLowerCase()),
  );

  const suggestions = [
    ...lowStockItems.map((item) => ({
      id: `sug-${item.id}`,
      title: item.name,
      reason: `${item.quantity}/${item.minQuantity} ${item.unit} · ${shoppingView.lowStockSuggestionReason}`,
      sourceLabel: 'auto_low_stock',
    })),
    {
      id: 'sug-due-part',
      title: shoppingView.duePartSuggestionTitle,
      reason: shoppingView.duePartSuggestionReason,
      sourceLabel: 'auto_part_due',
    },
  ].filter((suggestion) => !existingTitles.has(suggestion.title.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="bg-surface-sunken/40 rounded-xl border border-border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-accent" aria-hidden="true" />
            <p className="text-text text-xs font-semibold">
              {shoppingView.receiptCardTitle}
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {shoppingView.receiptCardBadge}
          </Badge>
        </div>

        <p className="text-text-muted mt-1 text-[11px]">
          {shoppingView.receiptFileName} · {shoppingView.receiptSummary}
        </p>

        <div className="mt-2 space-y-1">
          {shoppingView.receiptLines.map((line) => (
            <div
              key={line.id}
              className="bg-surface flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs"
            >
              <span className="text-text truncate font-medium">
                {line.name}
              </span>
              <span className="text-text-muted shrink-0 text-[11px]">
                {line.quantityText}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex justify-end">
          <Button
            type="button"
            variant={receiptAdded ? 'secondary' : 'default'}
            size="sm"
            disabled={receiptAdded}
            onClick={onAddReceiptToList}
            className="h-7 text-xs"
          >
            {receiptAdded ? (
              <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            )}
            {receiptAdded
              ? shoppingView.receiptAddedAction
              : shoppingView.receiptAddAction}
          </Button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-surface-sunken/60 rounded-xl border border-border p-2.5">
          <p className="text-text-muted mb-1.5 text-[11px] font-semibold">
            {shoppingView.smartSuggestionsTitle}
          </p>
          <div className="space-y-1.5">
            {suggestions.slice(0, 2).map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-surface flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5"
              >
                <div className="min-w-0">
                  <p className="text-text truncate text-xs font-medium">
                    {suggestion.title}
                  </p>
                  <p className="text-text-muted truncate text-[10px]">
                    {suggestion.reason}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  onClick={() =>
                    onAddSuggestion(
                      suggestion.id,
                      suggestion.title,
                      suggestion.sourceLabel,
                    )
                  }
                  aria-label={`+ ${suggestion.title}`}
                  className="h-6 w-6 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-text-muted text-[11px] font-semibold">
          {shoppingView.listTitle}
        </p>
        {shoppingRows.map((row) => (
          <div
            key={row.id}
            className="bg-surface flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-2"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToggleRow(row.id)}
              className="h-auto min-w-0 flex-1 justify-start gap-2 px-1 py-0 text-left font-normal"
            >
              <span
                className={
                  row.checked
                    ? 'text-on-accent flex h-4 w-4 shrink-0 items-center justify-center rounded border border-transparent bg-success text-[10px]'
                    : 'border-border-strong bg-surface flex h-4 w-4 shrink-0 items-center justify-center rounded border'
                }
              >
                {row.checked ? <Check className="h-3 w-3" /> : null}
              </span>
              <span
                className={
                  row.checked
                    ? 'text-text-muted truncate text-xs line-through'
                    : 'text-text truncate text-xs font-medium'
                }
              >
                {row.title}
              </span>
            </Button>
            <Badge
              variant={row.checked ? 'success' : 'secondary'}
              className="shrink-0 text-[10px]"
            >
              {row.checked
                ? shoppingView.boughtBadge
                : shoppingView.pendingBadge}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
