'use client';

import { CheckCircle2, Wrench } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { GoogleSignInButton } from './google-signin-button';
import type { PublicHomeCopy } from '../types';

export function LifecycleCtaCard({
  lifecycleCallout,
}: {
  lifecycleCallout: PublicHomeCopy['lifecycleCallout'];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
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
          </div>

          <div className="shrink-0">
            <GoogleSignInButton
              label={lifecycleCallout.action}
              size="lg"
              className="w-full sm:w-auto"
            />
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
  );
}
