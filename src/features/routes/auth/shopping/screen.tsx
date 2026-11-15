'use client';

import * as React from 'react';
import { Check, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import { Input } from '@/components/core/input';
import { toast } from '@/components/core/toast';
import {
  useItemsQuery,
  usePartsQuery,
  useRecordMovementMutation,
  useShoppingQuery,
} from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import { useQueryClient } from '@tanstack/react-query';
import {
  ShoppingSuggestionsCard,
  type ShoppingSuggestion,
} from './shopping-suggestions';

export function ShoppingScreen() {
  const qc = useQueryClient();
  const { data: list = [], isLoading } = useShoppingQuery();
  const { data: items = [] } = useItemsQuery();
  const { data: partsData } = usePartsQuery();
  const moveMutation = useRecordMovementMutation();

  const [freeText, setFreeText] = React.useState('');
  const [qty, setQty] = React.useState('1');

  const itemMap = React.useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  );

  const suggestions = React.useMemo<ShoppingSuggestion[]>(() => {
    const existingItemIds = new Set(
      list.filter((s) => !s.done && s.itemId).map((s) => s.itemId),
    );
    const lowStock: ShoppingSuggestion[] = items
      .filter(
        (i) =>
          i.minQuantity > 0 &&
          i.quantity <= i.minQuantity &&
          !existingItemIds.has(i.id),
      )
      .map((i) => ({
        key: `low_${i.id}`,
        itemId: i.id,
        label: i.name,
        suggestedQty: Math.max(
          1,
          (i.targetQuantity ?? i.minQuantity * 2) - i.quantity,
        ),
        unit: i.unit,
        source: 'auto_low_stock',
      }));

    const dueParts: ShoppingSuggestion[] = (partsData?.parts ?? [])
      .filter((p) => p.status !== 'ok' && p.spareItemId && !existingItemIds.has(p.spareItemId))
      .map((p) => {
        const spare = p.spareItemId ? itemMap.get(p.spareItemId) : undefined;
        return {
          key: `part_${p.id}`,
          itemId: p.spareItemId,
          label: spare ? spare.name : `${p.name} Yedeği`,
          suggestedQty: 1,
          unit: spare?.unit ?? 'adet',
          source: 'auto_part_due',
        };
      });

    return [...lowStock, ...dueParts];
  }, [items, partsData, list, itemMap]);

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = freeText.trim();
    if (!trimmed) return;
    try {
      await inventoryService.createShopping({
        itemId: null,
        freeText: trimmed,
        qty: Math.max(1, Number(qty) || 1),
        unit: 'adet',
        source: 'manual',
        done: false,
      });
      await qc.invalidateQueries({ queryKey: ['inventory', 'shopping'] });
      setFreeText('');
      setQty('1');
      toast.success('Listeye eklendi.');
    } catch {
      toast.error('Eklenemedi.');
    }
  };

  const handleAcceptSuggestion = async (s: ShoppingSuggestion) => {
    try {
      await inventoryService.createShopping({
        itemId: s.itemId,
        freeText: s.label,
        qty: s.suggestedQty,
        unit: s.unit,
        source: s.source,
        done: false,
      });
      await qc.invalidateQueries({ queryKey: ['inventory', 'shopping'] });
      toast.success(`${s.label} listeye eklendi.`);
    } catch {
      toast.error('Öneri eklenemedi.');
    }
  };

  const handleMarkBought = async (entryId: string, itemId: string | null, boughtQty: number) => {
    try {
      await inventoryService.updateShopping(entryId, { done: true });
      if (itemId) {
        await moveMutation.mutateAsync({ itemId, type: 'in', delta: boughtQty, reason: 'Alışverişten stok girişi' });
      }
      await qc.invalidateQueries({ queryKey: ['inventory', 'shopping'] });
      toast.success(itemId ? 'Alındı ve stoğa eklendi.' : 'Alındı olarak işaretlendi.');
    } catch {
      toast.error('İşlem başarısız.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await inventoryService.deleteShopping(id);
      await qc.invalidateQueries({ queryKey: ['inventory', 'shopping'] });
    } catch {
      toast.error('Silinemedi.');
    }
  };

  return (
    <div className="space-y-6">
      <ShoppingSuggestionsCard
        suggestions={suggestions}
        onAccept={handleAcceptSuggestion}
      />

      <form onSubmit={handleAddManual} className="flex flex-wrap gap-2">
        <Input
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Listeye ürün ekle (örn. Bulaşık tableti)"
          className="min-w-[200px] flex-1"
        />
        <Input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-20 tabular-nums"
          aria-label="Miktar"
        />
        <Button type="submit">
          <Plus className="mr-1.5 h-4 w-4" />
          Ekle
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Liste yükleniyor...</p>
      ) : list.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingCart />
            </EmptyMedia>
            <EmptyTitle>Alışveriş listen boş</EmptyTitle>
            <EmptyDescription>
              Düşük stok veya geciken parça olduğunda burada öneriler görünür.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          {list.map((entry) => {
            const linked = entry.itemId ? itemMap.get(entry.itemId) : undefined;
            const title = linked?.name ?? entry.freeText ?? 'Ürün';
            return (
              <Card key={entry.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`truncate text-sm font-medium ${
                          entry.done ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {title}
                      </span>
                      <Badge variant="outline" className="tabular-nums">
                        {entry.qty} {entry.unit ?? 'adet'}
                      </Badge>
                    </div>
                    {linked && (
                      <p className="text-xs text-muted-foreground">
                        Alındığında stoğa otomatik +{entry.qty} eklenir
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!entry.done && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleMarkBought(entry.id, entry.itemId, entry.qty)
                        }
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Alındı
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Listeden sil"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
