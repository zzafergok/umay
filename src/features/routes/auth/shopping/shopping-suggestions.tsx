'use client';

import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';

export interface ShoppingSuggestion {
  key: string;
  itemId: string | null;
  label: string;
  suggestedQty: number;
  unit: string;
  source: 'auto_low_stock' | 'auto_part_due';
}

export function ShoppingSuggestionsCard({
  suggestions,
  onAccept,
}: {
  suggestions: ShoppingSuggestion[];
  onAccept: (s: ShoppingSuggestion) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-umay-blue" />
          <span>Akıllı Öneriler ({suggestions.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map((s) => (
          <div
            key={s.key}
            className="flex items-center justify-between gap-3 rounded-sm border border-border p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                Önerilen: {s.suggestedQty} {s.unit}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAccept(s)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Listeye Ekle
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
