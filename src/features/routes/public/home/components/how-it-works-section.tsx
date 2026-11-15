'use client';

import { Badge } from '@/components/core/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import type { PublicHomeCopy } from '../types';

export function HowItWorksSection({
  howItWorksSection,
}: {
  howItWorksSection: PublicHomeCopy['howItWorksSection'];
}) {
  return (
    <section id="nasil-calisir" className="scroll-mt-20 space-y-6">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <Badge variant="outline">{howItWorksSection.badge}</Badge>
        <h2 className="font-heading text-title sm:text-display text-text">
          {howItWorksSection.title}
        </h2>
        <p className="text-body-sm text-text-muted">
          {howItWorksSection.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {howItWorksSection.steps.map((item) => (
          <Card key={item.step} className="flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-accent-subtle rounded-sm px-2 py-0.5 font-mono text-caption font-semibold tabular-nums text-accent">
                  {item.step}
                </span>
                <span className="text-text-muted text-caption">
                  {item.meta}
                </span>
              </div>
              <CardTitle className="font-heading text-title text-text">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-text-muted">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
