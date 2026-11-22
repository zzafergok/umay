'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { MapPin } from 'lucide-react';
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
import type { LocationDistributionItem } from '../types';

const LOCATION_CHART_CONFIG = {
  itemCount: {
    label: 'Ürün Çeşidi',
    color: 'rgb(var(--accent))',
  },
  totalUnits: {
    label: 'Toplam Birim',
    color: 'rgb(var(--cat-3))',
  },
} satisfies ChartConfig;

export function LocationDistributionCard({
  locations,
}: {
  locations: LocationDistributionItem[];
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-text-muted" aria-hidden="true" />
          Konum Dağılımı
        </CardTitle>
        <CardDescription>En fazla ürün barındıran konumlar</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {locations.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center rounded-md border border-dashed border-border bg-surface-sunken/30 text-body-sm text-text-muted">
            Henüz konum verisi yok.
          </div>
        ) : (
          <ChartContainer
            config={LOCATION_CHART_CONFIG}
            className="aspect-auto h-[240px] w-full"
          >
            <BarChart
              data={locations}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={88}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="itemCount"
                fill="var(--color-itemCount)"
                radius={[0, 4, 4, 0]}
                barSize={16}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
