'use client';

import { useState } from 'react';
import { CheckCircle2, RotateCcw, Wrench } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { LifecycleProgressBar } from '@/components/core/progress';
import { StatusPill } from '@/components/core/status-pill';
import { GoogleSignInButton } from './google-signin-button';
import type { PublicHomeCopy } from '../types';

export function LifecycleCtaCard({
  lifecycleCallout,
}: {
  lifecycleCallout: PublicHomeCopy['lifecycleCallout'];
}) {
  const [replaced, setReplaced] = useState(false);
  const { demoPart } = lifecycleCallout;

  const remainingPercent = replaced ? 100 : demoPart.remainingPercent;
  const daysRemaining = replaced ? 180 : demoPart.daysRemaining;
  const spareCount = replaced
    ? Math.max(0, demoPart.spareCount - 1)
    : demoPart.spareCount;

  return (
    <section id="omurlu-parcalar" className="scroll-mt-20">
      <Card>
        <CardHeader className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-7">
              <Badge variant="default">
                <Wrench className="mr-1 h-3 w-3" aria-hidden="true" />
                {lifecycleCallout.badge}
              </Badge>
              <CardTitle className="font-heading text-title sm:text-display-sm">
                {lifecycleCallout.title}
              </CardTitle>
              <CardDescription className="max-w-prose">
                {lifecycleCallout.description}
              </CardDescription>
              <div className="pt-1">
                <GoogleSignInButton
                  label={lifecycleCallout.action}
                  size="lg"
                  className="w-full sm:w-auto"
                />
              </div>
            </div>

            <div className="bg-surface-sunken rounded-lg border border-border p-4 sm:p-5 lg:col-span-5">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-heading text-body-sm text-text font-semibold">
                      {demoPart.name}
                    </p>
                    <p className="text-text-muted text-caption">
                      {demoPart.appliance}
                    </p>
                  </div>
                  <StatusPill
                    tone={replaced ? 'ok' : 'due_soon'}
                    label={replaced ? 'OK' : demoPart.statusLabel}
                  />
                </div>

                <LifecycleProgressBar
                  remainingPercent={remainingPercent}
                  daysRemaining={daysRemaining}
                  status={replaced ? 'ok' : 'due_soon'}
                  metaLabel={demoPart.metaLabel}
                />

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="text-text-muted text-caption tabular-nums">
                    {demoPart.spareLabel}:{' '}
                    <strong className="text-text font-semibold">
                      {spareCount}
                    </strong>
                  </span>

                  <Button
                    type="button"
                    size="sm"
                    variant={replaced ? 'secondary' : 'default'}
                    onClick={() => setReplaced((prev) => !prev)}
                  >
                    {replaced ? (
                      <>
                        <RotateCcw
                          className="mr-1.5 h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        {demoPart.replacedNote}
                      </>
                    ) : (
                      demoPart.replaceAction
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {lifecycleCallout.features.map((feature) => (
              <div
                key={feature}
                className="bg-surface-sunken text-text flex items-start gap-2.5 rounded-md border border-border p-3 text-caption"
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
