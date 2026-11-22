'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/core/chart';
import { formatTwoDecimals, roundTwoDecimals } from '../home-utils';
import type { StockTrendPoint } from '../types';

const STOCK_TREND_CONFIG = {
  inflow: {
    label: 'Stok Girişi',
    color: 'rgb(var(--success))',
  },
  outflow: {
    label: 'Çıkış / Tüketim',
    color: 'rgb(var(--ember))',
  },
} satisfies ChartConfig;

interface StockActivityChartProps {
  data: StockTrendPoint[];
}

export function StockActivityChart({ data }: StockActivityChartProps) {
  const totals = React.useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const point of data) {
      inflow += point.inflow;
      outflow += point.outflow;
    }
    return {
      inflow: roundTwoDecimals(inflow),
      outflow: roundTwoDecimals(outflow),
      net: roundTwoDecimals(inflow - outflow),
    };
  }, [data]);

  const hasActivity = totals.inflow > 0 || totals.outflow > 0;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Stok Hareket Trendi</CardTitle>
        <CardDescription>
          Son 14 gündeki günlük stok giriş ve tüketim hareketleri
        </CardDescription>
        <CardAction className="flex flex-wrap items-center gap-1.5">
          <Badge variant="success" size="sm" className="font-mono tabular-nums">
            <ArrowDownLeft className="mr-1 h-3 w-3" aria-hidden="true" />+
            {formatTwoDecimals(totals.inflow)}
          </Badge>
          <Badge variant="warning" size="sm" className="font-mono tabular-nums">
            <ArrowUpRight className="mr-1 h-3 w-3" aria-hidden="true" />-
            {formatTwoDecimals(totals.outflow)}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent>
        {!hasActivity ? (
          <div className="flex h-[240px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-sunken/30 px-4 text-center">
            <p className="text-body-sm font-medium text-text">
              Son 14 günde stok hareketi kaydedilmedi
            </p>
            <p className="mt-1 text-caption text-text-muted">
              Ürün ekleyip stok giriş/çıkışı yaptıkça trend grafiği burada
              oluşur.
            </p>
          </div>
        ) : (
          <ChartContainer
            config={STOCK_TREND_CONFIG}
            className="aspect-auto h-[240px] w-full"
          >
            <AreaChart
              data={data}
              margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="umayInflowFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-inflow)"
                    stopOpacity={0.32}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-inflow)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
                <linearGradient
                  id="umayOutflowFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-outflow)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-outflow)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={42}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="inflow"
                stroke="var(--color-inflow)"
                strokeWidth={2}
                fill="url(#umayInflowFill)"
              />
              <Area
                type="monotone"
                dataKey="outflow"
                stroke="var(--color-outflow)"
                strokeWidth={2}
                fill="url(#umayOutflowFill)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
