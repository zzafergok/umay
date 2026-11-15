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

export interface LifecycleCtaCardProps {
  lifecycleCallout: PublicHomeCopy['lifecycleCallout'];
  loginLabel: string;
  hideSignInCta?: boolean;
}

export function LifecycleCtaCard({
  lifecycleCallout,
  loginLabel,
  hideSignInCta = false,
}: LifecycleCtaCardProps) {
  const [replaced, setReplaced] = useState(false);

  const percent = replaced
    ? lifecycleCallout.percentReplaced
    : lifecycleCallout.percentDue;
  const remainingText = replaced
    ? lifecycleCallout.remainingReplacedText
    : lifecycleCallout.remainingDueText;

  return (
    <section id="omurlu-parcalar" className="scroll-mt-20">
      <Card className="overflow-hidden border-border">
        <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-12 md:items-center md:gap-6 md:p-8">
          <div className="space-y-3 sm:space-y-4 md:col-span-6">
            <Badge variant="outline">{lifecycleCallout.badge}</Badge>
            <h2 className="text-text text-xl font-semibold tracking-tight sm:text-3xl">
              {lifecycleCallout.title}
            </h2>
            <p className="text-text-muted text-sm leading-relaxed sm:text-base">
              {lifecycleCallout.description}
            </p>
            <p className="text-text-subtle text-xs">
              {lifecycleCallout.replaceHint}
            </p>
            {!hideSignInCta && (
              <div className="pt-1">
                <GoogleSignInButton label={loginLabel} />
              </div>
            )}
          </div>

          <div className="md:col-span-6">
            <Card className="bg-surface-raised border-border">
              <CardHeader className="space-y-1.5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="bg-warning-subtle flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-warning">
                      <Wrench className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-sm">
                        {lifecycleCallout.samplePartName}
                      </CardTitle>
                      <CardDescription className="truncate text-xs">
                        {lifecycleCallout.sampleParentItem}
                      </CardDescription>
                    </div>
                  </div>
                  <StatusPill
                    tone={replaced ? 'ok' : 'due_soon'}
                    label={
                      replaced
                        ? lifecycleCallout.replacedStatus
                        : lifecycleCallout.dueStatus
                    }
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                    <span className="text-text-muted">
                      {lifecycleCallout.remainingDaysLabel}
                    </span>
                    <span className="text-text font-medium tabular-nums">
                      {remainingText}
                    </span>
                  </div>
                  <LifecycleProgressBar
                    remainingPercent={percent}
                    daysRemaining={replaced ? 30 : 6}
                    status={replaced ? 'ok' : 'due_soon'}
                    metaLabel={remainingText}
                  />
                </div>

                <p className="bg-surface text-text-muted rounded-lg border border-border px-3 py-2 text-xs">
                  {lifecycleCallout.spareStockNote}
                </p>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant={replaced ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => setReplaced((prev) => !prev)}
                    className="w-full gap-1.5 sm:w-auto"
                  >
                    {replaced ? (
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    )}
                    {replaced
                      ? lifecycleCallout.resetDemoAction
                      : lifecycleCallout.replaceDemoAction}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </section>
  );
}
