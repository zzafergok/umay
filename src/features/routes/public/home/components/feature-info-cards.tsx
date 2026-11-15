'use client';

import {
  Layers,
  Palette,
  LayoutDashboard,
  ShieldCheck,
  Globe2,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/core/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import type { FeatureCardItem, PublicHomeCopy } from '../types';

const iconMap: Record<FeatureCardItem['icon'], LucideIcon> = {
  layers: Layers,
  palette: Palette,
  layout: LayoutDashboard,
  shield: ShieldCheck,
  globe: Globe2,
  check: CheckCircle2,
};

export function FeatureInfoCards({
  featuresSection,
}: {
  featuresSection: PublicHomeCopy['featuresSection'];
}) {
  return (
    <section className="space-y-6">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <Badge variant="outline">{featuresSection.badge}</Badge>
        <h2 className="font-heading text-title sm:text-display text-text">
          {featuresSection.title}
        </h2>
        <p className="text-body-sm text-text-muted">
          {featuresSection.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featuresSection.cards.map((card) => {
          const Icon = iconMap[card.icon] ?? Layers;
          return (
            <Card key={card.title} className="flex flex-col justify-between">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="bg-surface-sunken text-text-muted flex h-10 w-10 items-center justify-center rounded-md border border-border">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <Badge variant="secondary">{card.badge}</Badge>
                </div>
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {card.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="text-text-muted space-y-2 border-t border-border pt-3 text-caption">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
