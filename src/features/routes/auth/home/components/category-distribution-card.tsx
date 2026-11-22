'use client';

import * as React from 'react';
import { Cell, Label, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/core/chart';
import type { CategoryDistributionItem } from '../types';

export type { CategoryDistributionItem };

export function CategoryDistributionCard({
  categories,
  totalItems,
}: {
  categories: CategoryDistributionItem[];
  totalItems: number;
}) {
  const chartConfig = React.useMemo<ChartConfig>(() => {
    const cfg: ChartConfig = {};
    for (const cat of categories) {
      cfg[cat.key] = {
        label: cat.name,
        color: cat.dotColor,
      };
    }
    return cfg;
  }, [categories]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Kategori Dağılımı</CardTitle>
        <CardDescription>
          Envanterin kategori bazlı ürün yoğunluğu
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        {categories.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center rounded-md border border-dashed border-border bg-surface-sunken/30 text-body-sm text-text-muted">
            Henüz kategori verisi yok.
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-auto h-[175px] w-full max-w-[230px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={2}
                  strokeWidth={2}
                >
                  {categories.map((entry) => (
                    <Cell key={entry.id} fill={entry.dotColor} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-text font-heading text-xl font-semibold tabular-nums"
                            >
                              {totalItems}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 18}
                              className="fill-text-muted text-[11px]"
                            >
                              toplam ürün
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-2 text-caption"
                >
                  <span className="flex min-w-0 items-center gap-2 font-medium text-text">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.dotColor }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span className="shrink-0 font-mono tabular-nums text-text-muted">
                    {cat.count} (%{cat.percent})
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
