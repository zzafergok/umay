'use client';

import { Badge } from '@/components/core/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import type { PublicHomeCopy } from '../types';

export interface HowItWorksSectionProps {
  howItWorks: PublicHomeCopy['howItWorks'];
}

export function HowItWorksSection({ howItWorks }: HowItWorksSectionProps) {
  return (
    <section id="nasil-calisir" className="scroll-mt-20 space-y-4 sm:space-y-6">
      <div className="max-w-2xl space-y-2">
        <Badge variant="outline">{howItWorks.badge}</Badge>
        <h2 className="text-text text-xl font-semibold tracking-tight sm:text-3xl">
          {howItWorks.title}
        </h2>
        <p className="text-text-muted text-sm leading-relaxed sm:text-base">
          {howItWorks.description}
        </p>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:scroll-px-0 md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
        {howItWorks.steps.map((step) => (
          <Card
            key={step.stepNumber}
            className="w-[82%] shrink-0 snap-start border-border sm:w-[60%] md:w-auto"
          >
            <CardHeader className="space-y-2.5 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span className="bg-accent-subtle inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-semibold text-accent">
                  {step.stepNumber}
                </span>
                <Badge variant="outline" className="text-[11px]">
                  {step.moduleTag}
                </Badge>
              </div>
              <CardTitle className="text-base">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-text-muted text-sm leading-relaxed">
                {step.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
