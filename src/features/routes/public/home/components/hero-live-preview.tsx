'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { StatusPill } from '@/components/core/status-pill';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/core/tabs';
import type { PublicHomeCopy } from '../types';

export function HeroLivePreview({
  preview,
}: {
  preview: PublicHomeCopy['heroPreview'];
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const tab of preview.tabs) {
      for (const item of tab.items) {
        initial[item.id] = item.quantity;
      }
    }
    return initial;
  });

  const adjustQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  };

  return (
    <Card className="bg-surface border-border">
      <CardHeader className="space-y-1.5 border-b border-border pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-heading text-title text-text">
            {preview.title}
          </CardTitle>
          <Badge variant="secondary" size="sm">
            {preview.liveLabel}
          </Badge>
        </div>
        <CardDescription>{preview.subtitle}</CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <Tabs defaultValue={preview.tabs[0]?.id ?? 'today'}>
          <TabsList className="grid w-full grid-cols-3">
            {preview.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {preview.tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="mt-3 space-y-2.5"
            >
              {tab.items.map((item) => {
                const qty = quantities[item.id] ?? item.quantity;
                return (
                  <div
                    key={item.id}
                    className="bg-surface-sunken flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-body-sm text-text truncate font-medium">
                          {item.name}
                        </span>
                        {item.statusTone && item.statusLabel ? (
                          <StatusPill
                            tone={item.statusTone}
                            label={item.statusLabel}
                          />
                        ) : null}
                      </div>
                      <p className="text-text-muted truncate text-caption">
                        {item.location}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`${item.name} -1`}
                        onClick={() => adjustQuantity(item.id, -1)}
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <span className="text-body-sm text-text min-w-[3.25rem] text-center font-medium tabular-nums">
                        {qty}{' '}
                        <span className="text-text-muted text-caption font-normal">
                          {item.unit}
                        </span>
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`${item.name} +1`}
                        onClick={() => adjustQuantity(item.id, 1)}
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <CardFooter className="border-t border-border py-3">
        <p className="text-text-muted w-full text-center text-caption">
          {preview.footerNote}
        </p>
      </CardFooter>
    </Card>
  );
}
