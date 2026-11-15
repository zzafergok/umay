'use client';

import { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader } from '@/components/core/card';
import type { HeroPreviewData, HeroShoppingRow } from '../../types';
import { HeroPreviewHomeTab } from './hero-preview-home-tab';
import { HeroPreviewItemsTab } from './hero-preview-items-tab';
import { HeroPreviewShoppingTab } from './hero-preview-shopping-tab';

type PreviewTabKey = 'home' | 'items' | 'shopping';

export interface HeroLivePreviewProps {
  preview: HeroPreviewData;
}

export function HeroLivePreview({ preview }: HeroLivePreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewTabKey>('home');
  const [items, setItems] = useState(preview.itemsView.rows);
  const [receiptAdded, setReceiptAdded] = useState(false);
  const [shoppingRows, setShoppingRows] = useState<HeroShoppingRow[]>(
    preview.shoppingView.initialRows,
  );

  const lowStockItems = items.filter(
    (item) => item.quantity <= item.minQuantity,
  );
  const openShoppingCount = shoppingRows.filter((row) => !row.checked).length;

  const handleAdjustQuantity = (id: string, delta: -1 | 1) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item,
      ),
    );
  };

  const handleAddReceiptToList = () => {
    if (receiptAdded) return;
    setReceiptAdded(true);
    setShoppingRows((prev) => [
      ...preview.shoppingView.receiptLines.map((line) => ({
        id: `shop-${line.id}`,
        title: `${line.name} (${line.quantityText})`,
        source: 'ai_receipt' as const,
        sourceLabel: 'AI',
        checked: false,
      })),
      ...prev,
    ]);
  };

  const handleAddSuggestion = (
    id: string,
    title: string,
    sourceLabel: string,
  ) => {
    setShoppingRows((prev) => {
      if (prev.some((row) => row.title.toLowerCase() === title.toLowerCase())) {
        return prev;
      }
      return [
        {
          id,
          title,
          source:
            sourceLabel === 'auto_part_due'
              ? 'auto_part_due'
              : 'auto_low_stock',
          sourceLabel,
          checked: false,
        },
        ...prev,
      ];
    });
  };

  const handleToggleRow = (id: string) => {
    setShoppingRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, checked: !row.checked } : row,
      ),
    );
  };

  const tabs: Array<{
    key: PreviewTabKey;
    label: string;
    Icon: typeof LayoutDashboard;
  }> = [
    { key: 'home', label: preview.tabs.home, Icon: LayoutDashboard },
    { key: 'items', label: preview.tabs.items, Icon: Package },
    { key: 'shopping', label: preview.tabs.shopping, Icon: ShoppingCart },
  ];

  return (
    <Card className="bg-surface border-border shadow-sm">
      <CardHeader className="space-y-2.5 border-b border-border pb-3.5">
        <div className="space-y-1">
          <Badge variant="outline" className="text-[10px]">
            {preview.badge}
          </Badge>
          <p className="text-text text-sm font-semibold">{preview.title}</p>
          <p className="text-text-muted text-xs">{preview.description}</p>
        </div>

        <div className="bg-surface-sunken grid grid-cols-3 gap-1 rounded-lg p-1">
          {tabs.map(({ key, label, Icon }) => {
            const active = activeTab === key;
            return (
              <Button
                key={key}
                type="button"
                variant={active ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(key)}
                className="h-8 gap-1 px-2 text-[11px] sm:h-7 sm:gap-1.5 sm:px-2.5"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-3.5">
        <div className="lg:h-[430px] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          {activeTab === 'home' && (
            <HeroPreviewHomeTab
              homeView={preview.homeView}
              items={items}
              lowStockItems={lowStockItems}
              openShoppingCount={openShoppingCount}
              onJumpToItems={() => setActiveTab('items')}
            />
          )}

          {activeTab === 'items' && (
            <HeroPreviewItemsTab
              itemsView={preview.itemsView}
              items={items}
              onAdjustQuantity={handleAdjustQuantity}
            />
          )}

          {activeTab === 'shopping' && (
            <HeroPreviewShoppingTab
              shoppingView={preview.shoppingView}
              lowStockItems={lowStockItems}
              shoppingRows={shoppingRows}
              receiptAdded={receiptAdded}
              onAddReceiptToList={handleAddReceiptToList}
              onAddSuggestion={handleAddSuggestion}
              onToggleRow={handleToggleRow}
            />
          )}
        </div>

        <p className="text-text-muted mt-3 border-t border-border pt-2.5 text-[11px]">
          {preview.routeNote}
        </p>
      </CardContent>
    </Card>
  );
}
