'use client';

import {
  Check,
  Receipt,
  ScanLine,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/core/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import type {
  FeatureIconKey,
  FeatureInfoCardItem,
  PublicHomeCopy,
} from '../types';

export interface FeatureInfoCardsProps {
  featuresSection: PublicHomeCopy['featuresSection'];
  withAnchorId?: boolean;
}

const ICON_MAP: Record<FeatureIconKey, typeof Sparkles> = {
  sparkles: Sparkles,
  wrench: Wrench,
  receipt: Receipt,
  tags: Tags,
  scan: ScanLine,
  sliders: SlidersHorizontal,
};

const TOKEN_CSS: Record<FeatureInfoCardItem['categoryToken'], string> = {
  1: '--cat-1',
  2: '--cat-2',
  3: '--cat-3',
  4: '--cat-4',
  5: '--cat-5',
  6: '--cat-6',
};

export function FeatureInfoCards({
  featuresSection,
  withAnchorId = true,
}: FeatureInfoCardsProps) {
  return (
    <section
      id={withAnchorId ? 'ozellikler' : undefined}
      className="scroll-mt-20 space-y-4 sm:space-y-6"
    >
      <div className="max-w-2xl space-y-2">
        <Badge variant="outline">{featuresSection.badge}</Badge>
        <h2 className="text-xl font-semibold tracking-tight text-text sm:text-3xl">
          {featuresSection.title}
        </h2>
        <p className="text-sm leading-relaxed text-text-muted sm:text-base">
          {featuresSection.description}
        </p>
      </div>

      <div className="grid gap-3.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featuresSection.cards.map((card) => {
          const Icon = ICON_MAP[card.icon];
          const cssVar = TOKEN_CSS[card.categoryToken];

          return (
            <Card key={card.id} className="flex flex-col border-border">
              <CardHeader className="space-y-2.5 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg border"
                    style={{
                      backgroundColor: `rgb(var(${cssVar}) / 0.14)`,
                      borderColor: `rgb(var(${cssVar}) / 0.35)`,
                      color: `rgb(var(${cssVar}))`,
                    }}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  {card.badge && (
                    <Badge variant="secondary" className="text-[11px]">
                      {card.badge}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-text-muted">
                    {card.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="mt-auto border-t border-border/70 pt-3">
                <ul className="space-y-1.5">
                  {card.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2 text-xs text-text-muted"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      <span>{highlight}</span>
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
